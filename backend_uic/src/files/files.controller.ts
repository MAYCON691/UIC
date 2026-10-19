import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post,
  Query, Res, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators';
import { AuthUser } from '../auth/auth-user';
import { FilesService } from './files.service';
import { FilesQueryDto, UpdateFileDto } from './files.dto';

@Controller('files')
export class FilesController {
  constructor(private files: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { channelId?: string; categoryId?: string },
  ) {
    return this.files.upload(user, file, body);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() q: FilesQueryDto) {
    return this.files.list(user, q);
  }

  /** ?inline=1 para previsualizar (audio/video/pdf/imagen). Sin eso, descarga. */
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Query('inline') inline: string | undefined,
    @Res() res: Response,
  ) {
    const { file, abs } = await this.files.getForDownload(user, id);
    const name = encodeURIComponent(file.originalName).replace(/'/g, '%27');
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${name}`,
    );
    res.sendFile(abs, { dotfiles: 'allow' });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFileDto,
  ) {
    return this.files.update(user, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.files.remove(user, id);
  }
}