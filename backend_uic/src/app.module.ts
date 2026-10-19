import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './common/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { FilesModule } from './files/files.module';
import { JwtAuthGuard, RolesGuard } from './auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Límite general por IP: 1200 peticiones por minuto (el login y la clave tienen límites más estrictos).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1200 }]),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    ChannelsModule,
    FilesModule,
  ],
  providers: [
    // El orden importa: 1) límite de peticiones  2) sesión válida  3) rol permitido
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
