import { Global, Injectable, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import { join, resolve } from 'path';

@Injectable()
export class StorageService {
  readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolve(config.get<string>('UPLOADS_DIR') ?? './uploads');
    mkdirSync(this.root, { recursive: true });
  }

  absolute(relativePath: string) {
    return join(this.root, relativePath);
  }

  async remove(relativePaths: string[]) {
    await Promise.all(
      relativePaths.map((p) => unlink(this.absolute(p)).catch(() => undefined)),
    );
  }
}

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}