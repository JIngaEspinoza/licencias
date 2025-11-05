import { IsString, IsOptional, IsIn, IsEmail, Matches, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePersonaDto {
  @IsString({ message: 'tipo_persona debe ser texto' })
  @IsIn(['JURIDICA', 'NATURAL'], {
    message: 'tipo_persona debe ser "JURIDICA" o "NATURAL"',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  tipo_persona!: 'JURIDICA' | 'NATURAL';

  @IsString({ message: 'nombre_razon_social debe ser texto' })
  @Length(2, 200, { message: 'nombre_razon_social debe tener entre 2 y 200 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombre_razon_social!: string;

  // RUC es opcional en el modelo
  @IsOptional()
  @Matches(/^\d{11}$/, {
    message: 'ruc debe tener 11 dígitos numéricos',
  })
  ruc?: string;

  @IsOptional()
  @IsString({ message: 'telefono debe ser texto' })
  @Matches(/^\+?\d{7,15}$/, {
    message: 'telefono debe ser 7–15 dígitos (opcional prefijo +)',
  })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'correo no tiene formato válido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  correo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  via_tipo?: string; // p.ej. 'Av.', 'Jr.', 'Calle'

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  via_nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  numero?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  interior?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mz?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lt?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  otros?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  urb_aa_hh_otros?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  distrito?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  provincia?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  departamento?: string;
}