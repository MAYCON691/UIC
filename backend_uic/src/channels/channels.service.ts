import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.module';
import { StorageService } from '../common/storage.module';
import { AuthUser } from '../auth/auth-user';
import { assertCanView, assertOwner, isUniqueError } from '../common/helpers';

const CHANNEL_INCLUDE = {
  _count: { select: { files: true } },
  categories: {
    orderBy: { name: 'asc' },
    include: { _count: { select: { files: true } } },
  },
} satisfies Prisma.ChannelInclude;

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // ---------- Canales ----------
  list(user: AuthUser, userId?: number) {
    const target = userId ?? user.id;
    assertCanView(user, target);
    return this.prisma.channel.findMany({
      where: { userId: target },
      orderBy: { name: 'asc' },
      include: CHANNEL_INCLUDE,
    });
  }

  async createChannel(user: AuthUser, name: string) {
    try {
      return await this.prisma.channel.create({
        data: { name, userId: user.id },
        include: CHANNEL_INCLUDE,
      });
    } catch (e) {
      if (isUniqueError(e)) throw new ConflictException('Ya tienes un canal con ese nombre');
      throw e;
    }
  }

  async updateChannel(user: AuthUser, id: number, name: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new NotFoundException('Canal no encontrado');
    assertOwner(user, channel.userId);
    try {
      return await this.prisma.channel.update({
        where: { id },
        data: { name },
        include: CHANNEL_INCLUDE,
      });
    } catch (e) {
      if (isUniqueError(e)) throw new ConflictException('Ya tienes un canal con ese nombre');
      throw e;
    }
  }

  async removeChannel(user: AuthUser, id: number) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new NotFoundException('Canal no encontrado');
    assertOwner(user, channel.userId);

    const files = await this.prisma.file.findMany({
      where: { channelId: id },
      select: { storedPath: true },
    });
    await this.prisma.channel.delete({ where: { id } }); // borra categorías y archivos (cascade)
    await this.storage.remove(files.map((f) => f.storedPath));
    return { message: 'Canal eliminado' };
  }

  // ---------- Categorías ----------
  async createCategory(user: AuthUser, channelId: number, name: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Canal no encontrado');
    assertOwner(user, channel.userId);
    try {
      return await this.prisma.category.create({
        data: { name, channelId },
        include: { _count: { select: { files: true } } },
      });
    } catch (e) {
      if (isUniqueError(e)) throw new ConflictException('Esa categoría ya existe en este canal');
      throw e;
    }
  }

  async updateCategory(user: AuthUser, id: number, name: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { channel: true },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    assertOwner(user, category.channel.userId);
    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name },
        include: { _count: { select: { files: true } } },
      });
    } catch (e) {
      if (isUniqueError(e)) throw new ConflictException('Esa categoría ya existe en este canal');
      throw e;
    }
  }

  async removeCategory(user: AuthUser, id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { channel: true },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    assertOwner(user, category.channel.userId);

    const files = await this.prisma.file.findMany({
      where: { categoryId: id },
      select: { storedPath: true },
    });
    await this.prisma.category.delete({ where: { id } });
    await this.storage.remove(files.map((f) => f.storedPath));
    return { message: 'Categoría eliminada' };
  }
}