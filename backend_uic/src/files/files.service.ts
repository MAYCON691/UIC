import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { existsSync } from 'fs';
import { PrismaService } from '../prisma/prisma.module';
import { StorageService } from '../common/storage.module';
import { AuthUser } from '../auth/auth-user';
import { assertCanView, assertOwner } from '../common/helpers';
import { FilesQueryDto, UpdateFileDto } from './files.dto';

const FILE_INCLUDE = {
  channel: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  user: { select: { id: true, fullName: true, username: true } },
} satisfies Prisma.FileInclude;

const TYPE_FILTERS: Record<string, Prisma.FileWhereInput> = {
  audio: { mimeType: { startsWith: 'audio/' } },
  video: { mimeType: { startsWith: 'video/' } },
  image: { mimeType: { startsWith: 'image/' } },
  pdf: { mimeType: 'application/pdf' },
  document: {
    OR: [
      { mimeType: { contains: 'word' } },
      { mimeType: { contains: 'officedocument' } },
      { mimeType: { contains: 'excel' } },
      { mimeType: { contains: 'powerpoint' } },
      { mimeType: { startsWith: 'text/' } },
    ],
  },
};

/** Multer entrega el nombre en latin1; lo pasamos a UTF-8 (tildes, ñ, etc.) */
function fixName(name: string) {
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return decoded.includes('\uFFFD') ? name : decoded;
}

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async upload(
    user: AuthUser,
    file: Express.Multer.File | undefined,
    body: { channelId?: string; categoryId?: string },
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    const storedPath = `${user.id}/${file.filename}`;

    try {
      const channelId = Number(body?.channelId);
      const categoryId = Number(body?.categoryId);
      if (!Number.isInteger(channelId) || !Number.isInteger(categoryId)) {
        throw new BadRequestException('Debes elegir un canal y una categoría');
      }

      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: { channel: true },
      });
      if (!category || category.channelId !== channelId || category.channel.userId !== user.id) {
        throw new BadRequestException('Canal o categoría inválidos');
      }

      return await this.prisma.file.create({
        data: {
          originalName: fixName(file.originalname),
          storedPath,
          mimeType: file.mimetype || 'application/octet-stream',
          size: file.size,
          userId: user.id,
          channelId,
          categoryId,
        },
        include: FILE_INCLUDE,
      });
    } catch (e) {
      await this.storage.remove([storedPath]); // no dejar archivos huérfanos
      throw e;
    }
  }

  async list(user: AuthUser, q: FilesQueryDto) {
    const target = q.userId ?? user.id;
    assertCanView(user, target);

    const where: Prisma.FileWhereInput = { userId: target };
    if (q.channelId) where.channelId = q.channelId;
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.search?.trim()) {
      where.originalName = { contains: q.search.trim(), mode: 'insensitive' };
    }
    if (q.type && TYPE_FILTERS[q.type]) where.AND = [TYPE_FILTERS[q.type]];

    const page = q.page ?? 1;
    const limit = q.limit ?? 24;
    const orderBy = {
      [q.sortBy ?? 'createdAt']: q.order ?? 'desc',
    } as Prisma.FileOrderByWithRelationInput;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.file.count({ where }),
      this.prisma.file.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: FILE_INCLUDE,
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async getForDownload(user: AuthUser, id: number) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Archivo no encontrado');
    assertCanView(user, file.userId);

    const abs = this.storage.absolute(file.storedPath);
    if (!existsSync(abs)) throw new NotFoundException('El archivo ya no existe en el servidor');
    return { file, abs };
  }

  async update(user: AuthUser, id: number, dto: UpdateFileDto) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Archivo no encontrado');
    assertOwner(user, file.userId);

    const channelId = dto.channelId ?? file.channelId;
    const categoryId = dto.categoryId ?? file.categoryId;

    if (channelId !== file.channelId || categoryId !== file.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: { channel: true },
      });
      if (!category || category.channelId !== channelId || category.channel.userId !== user.id) {
        throw new BadRequestException('Canal o categoría inválidos');
      }
    }

    const name = dto.originalName?.trim();
    return this.prisma.file.update({
      where: { id },
      data: { originalName: name || file.originalName, channelId, categoryId },
      include: FILE_INCLUDE,
    });
  }

  async remove(user: AuthUser, id: number) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Archivo no encontrado');
    assertOwner(user, file.userId);

    await this.prisma.file.delete({ where: { id } });
    await this.storage.remove([file.storedPath]);
    return { message: 'Archivo eliminado' };
  }
}