import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * DTO para la solicitud de cambio de contraseña.
 * Recibe el token de restablecimiento y la nueva contraseña.
 */
export class ResetPasswordDto {
  @IsNotEmpty({ message: 'El token es requerido.' })
  @IsString({ message: 'El token debe ser una cadena de texto válida.' })
  token: string;

  @IsNotEmpty({ message: 'La nueva contraseña es requerida.' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto válida.' })
  @Length(6, 50, { message: 'La contraseña debe tener entre 6 y 50 caracteres.' })
  password: string;
}