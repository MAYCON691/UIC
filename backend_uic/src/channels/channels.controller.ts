import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators';
import { AuthUser } from '../auth/auth-user';
import { ChannelsService } from './channels.service';
import { NameDto, OwnerQueryDto } from './channels.dto';

@Controller()
export class ChannelsController {
  constructor(private service: ChannelsService) {}

  @Get('channels')
  list(@CurrentUser() user: AuthUser, @Query() q: OwnerQueryDto) {
    return this.service.list(user, q.userId);
  }

  @Post('channels')
  createChannel(@CurrentUser() user: AuthUser, @Body() dto: NameDto) {
    return this.service.createChannel(user, dto.name);
  }

  @Patch('channels/:id')
  updateChannel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NameDto,
  ) {
    return this.service.updateChannel(user, id, dto.name);
  }

  @Delete('channels/:id')
  removeChannel(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeChannel(user, id);
  }

  @Post('channels/:id/categories')
  createCategory(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NameDto,
  ) {
    return this.service.createCategory(user, id, dto.name);
  }

  @Patch('categories/:id')
  updateCategory(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NameDto,
  ) {
    return this.service.updateCategory(user, id, dto.name);
  }

  @Delete('categories/:id')
  removeCategory(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeCategory(user, id);
  }
}