import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/** Largo permitido de contraseñas nuevas (72 = límite real de bcrypt). */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(PASSWORD_MIN, { message: `La nueva contraseña debe tener al menos ${PASSWORD_MIN} caracteres` })
  @MaxLength(PASSWORD_MAX, { message: `La nueva contraseña no puede pasar de ${PASSWORD_MAX} caracteres` })
  newPassword!: string;
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;
}
