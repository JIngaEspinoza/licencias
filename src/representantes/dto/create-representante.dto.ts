import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsIn,
  Matches,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRepresentanteDto {
  @IsInt({ message: 'id_persona debe ser entero' })
  @Min(1, { message: 'id_persona debe ser mayor o igual a 1' })
  id_persona!: number;

  // En tu modelo 'nombres' es opcional; si quieres hacerlo requerido, quita @IsOptional
  @IsOptional()
  @IsString({ message: 'nombres debe ser texto' })
  @Length(2, 200, { message: 'nombres debe tener entre 2 y 200 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombres?: string;

  @IsOptional()
  @IsString({ message: 'tipo_documento debe ser texto' })
  @IsIn(['DNI', 'CE', 'PASAPORTE', 'OTRO'], {
    message: 'tipo_documento debe ser DNI, CE, PASAPORTE u OTRO',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  tipo_documento?: 'DNI' | 'CE' | 'PASAPORTE' | 'OTRO';

  @IsOptional()
  @IsString({ message: 'numero_documento debe ser texto' })
  // Reglas: DNI 8 dígitos; CE/Pasaporte: 6–12 alfanumérico
  @Matches(/^(\d{8}|[A-Za-z0-9]{6,12})$/, {
    message: 'numero_documento debe ser DNI (8 dígitos) o doc. alfanumérico de 6–12 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  numero_documento?: string;

  @IsOptional()
  @IsString({ message: 'sunarp_partida_asiento debe ser texto' })
  // Ejemplo de formato genérico "Partida-XXXX/Asiento-YY" o libre alfanumérico con / - #
  @Matches(/^[A-Za-z0-9\s\-\/#]{3,50}$/, {
    message: 'sunarp_partida_asiento tiene un formato inválido (use letras, números, -, /, #)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  sunarp_partida_asiento?: string;
}