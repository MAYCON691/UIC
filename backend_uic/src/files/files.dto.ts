import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class FilesQueryDto {
  @IsOptional() @Type(() => Number) @IsInt()
  userId?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  channelId?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  categoryId?: number;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsIn(['audio', 'video', 'image', 'pdf', 'document'])
  type?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number;

  @IsOptional() @IsIn(['createdAt', 'originalName', 'size'])
  sortBy?: string;

  @IsOptional() @IsIn(['asc', 'desc'])
  order?: string;
}

export class UpdateFileDto {
  @IsOptional() @IsString() @MaxLength(255)
  originalName?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  channelId?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  categoryId?: number;
}