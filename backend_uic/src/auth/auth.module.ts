import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

const MIN_SECRET_LENGTH = 32;

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        if (secret.length < MIN_SECRET_LENGTH) {
          const msg = `JWT_SECRET es corto (${secret.length}). Usa al menos ${MIN_SECRET_LENGTH} caracteres aleatorios.`;
          // En producción es obligatorio; en desarrollo solo se avisa.
          if (config.get('NODE_ENV') === 'production') throw new Error(msg);
          new Logger('Seguridad').warn(msg);
        }
        return {
          secret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '12h') as NonNullable<
              JwtModuleOptions['signOptions']
            >['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // FilesModule necesita JwtService para firmar/verificar los tickets de descarga.
  exports: [JwtModule],
})
export class AuthModule {}
