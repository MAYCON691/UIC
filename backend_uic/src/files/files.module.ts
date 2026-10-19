import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { StorageService } from '../common/storage.module';
import { AuthModule } from '../auth/auth.module';
import { AuthUser } from '../auth/auth-user';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [
    AuthModule, // JwtService para los tickets de descarga
    MulterModule.registerAsync({
      inject: [StorageService, ConfigService],
      useFactory: (storage: StorageService, config: ConfigService) => {
        const maxMb = Number(config.get('MAX_FILE_SIZE_MB') ?? 2000);
        return {
          storage: diskStorage({
            destination: (req, _file, cb) => {
              const user = (req as Request & { user: AuthUser }).user;
              const dir = join(storage.root, String(user.id));
              mkdirSync(dir, { recursive: true });
              cb(null, dir);
            },
            filename: (_req, file, cb) => {
              const ext = extname(file.originalname).toLowerCase().slice(0, 10);
              cb(null, `${randomUUID()}${ext}`);
            },
          }),
          limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
        };
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
