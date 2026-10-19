import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser } from '../auth/auth-user';
import { assertCanView, USER_SELECT } from '../common/helpers';
import { CreateUserDto, UpdateUserDto } from './users.dto';

const WITH_COUNTS = {
  ...USER_SELECT,
  _count: { select: { files: true, channels: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Tarjetas de perfil (solo ADMIN y SUPERADMIN llegan aquí). */
  async list() {
    const [users, sums] = await Promise.all([
      this.prisma.user.findMany({
        select: WITH_COUNTS,
        orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
      }),
      this.prisma.file.groupBy({ by: ['userId'], _sum: { size: true } }),
    ]);
    const bytes = new Map(sums.map((s) => [s.userId, s._sum.size ?? 0]));
    return users.map((u) => ({ ...u, storageBytes: bytes.get(u.id) ?? 0 }));
  }

  async findOne(requester: AuthUser, id: number) {
    assertCanView(requester, id);
    const user = await this.prisma.user.findUnique({ where: { id }, select: WITH_COUNTS });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const agg = await this.prisma.file.aggregate({ where: { userId: id }, _sum: { size: true } });
    return { ...user, storageBytes: agg._sum.size ?? 0 };
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findFirst({
      where: { username: { equals: dto.username, mode: 'insensitive' } },
    });
    if (exists) throw new ConflictException('Ese nombre de usuario ya existe');

    return this.prisma.user.create({
      data: {
        username: dto.username,
        password: await hash(dto.password, 10),
        fullName: dto.fullName.trim(),
        role: dto.role,
      },
      select: USER_SELECT,
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Usuario no encontrado');
    if (target.role === Role.SUPERADMIN) {
      throw new ForbiddenException('El superadmin se gestiona desde su propio perfil');
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.role) data.role = dto.role;
    if (dto.password) data.password = await hash(dto.password, 10);

    return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }

  async remove(id: number) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Usuario no encontrado');
    if (target.role === Role.SUPERADMIN) {
      throw new ForbiddenException('No se puede eliminar al superadmin');
    }
    const files = await this.prisma.file.count({ where: { userId: id } });
    if (files > 0) {
      throw new ConflictException(
        'Este usuario tiene archivos. Desactívalo en lugar de eliminarlo.',
      );
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuario eliminado' };
  }
}