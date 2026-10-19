import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, hashSync } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.module';
import { USER_SELECT } from '../common/helpers';
import { ChangePasswordDto, LoginDto, UpdateProfileDto } from './auth.dto';

const BCRYPT_COST = 10;

/**
 * Hash de mentira: si el usuario no existe igual se hace una comparación,
 * así el tiempo de respuesta no revela qué usuarios existen.
 */
const DUMMY_HASH = hashSync('contrasena-falsa-uic', BCRYPT_COST);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: { equals: dto.username.trim(), mode: 'insensitive' } },
    });

    // Siempre se compara (aunque no exista el usuario) para tardar lo mismo.
    const passwordOk = await compare(dto.password, user?.password ?? DUMMY_HASH);

    if (!user || !user.active || !passwordOk) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
      },
    };
  }

  me(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT });
  }

  updateProfile(userId: number, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { fullName: dto.fullName.trim() },
      select: USER_SELECT,
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await compare(dto.currentPassword, user.password))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await hash(dto.newPassword, BCRYPT_COST) },
    });
    return { message: 'Contraseña actualizada' };
  }
}
