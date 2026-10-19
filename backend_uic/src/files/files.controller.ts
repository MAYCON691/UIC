import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post,
  Query, Req, Res, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser, Public } from '../auth/decorators';
import { AuthUser } from '../auth/auth-user';
import { FilesService } from './files.service';
import { FilesQueryDto, UpdateFileDto } from './files.dto';
import { isInlineSafe } from './safe-mime';

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

  /**
   * Ticket de corta duración para UN archivo. El navegador lo usa en <video>, <img>, <iframe>
   * y descargas, que no pueden mandar la cabecera Authorization.
   */
  @SkipThrottle()
  @Post(':id/ticket')
  async ticket(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return { ticket: await this.files.createTicket(user, id) };
  }

  /**
   * ?ticket=… (o cabecera Bearer). ?inline=1 para previsualizar; sin eso, descarga.
   * Es @Public porque la autenticación se hace aquí dentro con el ticket.
   */
  @Public()
  @SkipThrottle() // el navegador pide el archivo por partes (rangos); no es un ataque
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Query('ticket') ticket: string | undefined,
    @Query('inline') inline: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.files.authenticateDownload(id, ticket, req.headers.authorization);
    const { file, abs } = await this.files.getForDownload(user, id);

    const showInline = !!inline && isInlineSafe(file.mimeType);
    const name = encodeURIComponent(file.originalName).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

    res.setHeader('Content-Type', showInline ? file.mimeType : 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${showInline ? 'inline' : 'attachment'}; filename*=UTF-8''${name}`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=0');
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
