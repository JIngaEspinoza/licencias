import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsIn,
  Matches,
  Length,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateExpedienteOpcioneDto {
    @IsInt()
    @Min(1)
    id_expediente!: number;

    @IsString()
    @MaxLength(50)
    codigo!: string;

    @IsOptional()
    // Nota: class-validator no valida "JSON value" directamente.
    // Aceptamos cualquier tipo y lo tipamos como InputJsonValue para Prisma.
    valor_json?: Prisma.InputJsonValue;
}