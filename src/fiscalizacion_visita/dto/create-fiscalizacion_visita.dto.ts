import { Prisma } from '@prisma/client';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches } from 'class-validator';
export class CreateFiscalizacionVisitaDto {
  @IsInt()
  @Min(1)
  id_expediente!: number;

  @IsOptional()
  @IsISO8601()
  fecha_visita?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  resultado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acta_numero?: string;
}
