import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser } from './auth-user';
import { TOKEN_TYPE_FILE } from './token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Solo por cabecera Authorization: nunca por la URL (las URL quedan en historiales y registros).
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; typ?: string }): Promise<AuthUser> {
    // Un ticket de descarga sirve solo para bajar UN archivo, jamás como sesión.
    if (payload.typ === TOKEN_TYPE_FILE) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) throw new UnauthorizedException();
    return { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
  }
}
