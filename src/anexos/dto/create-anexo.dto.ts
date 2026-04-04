import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  Matches,
  IsNumberString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateAnexoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_expediente!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombre?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  ruta!: string; // requerido en DTO para calzar con Prisma

  @IsOptional()
  @Matches(/^[A-Za-z0-9]{1,10}$/)
  extension?: string;

  @IsOptional()
  @IsNumberString()
  tamano_bytes?: string;

  @IsOptional()
  @Matches(/^[a-fA-F0-9]{16,128}$/)
  hash_archivo?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/)
  fecha_subida?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo_anexo?: string;
}