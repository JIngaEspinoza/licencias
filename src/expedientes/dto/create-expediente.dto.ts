import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Length,
  IsDateString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateExpedienteDto {
  @IsInt({ message: 'id_persona debe ser entero' })
  @Min(1, { message: 'id_persona debe ser mayor o igual a 1' })
  id_persona!: number;

  @IsDateString()
  fecha!: string; // Prisma @db.Date (date-only). Aceptamos string ISO.

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  numero_expediente!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado?: string | null;

  @IsOptional()
  @IsString()
  codigo_qr?: string | null;

}