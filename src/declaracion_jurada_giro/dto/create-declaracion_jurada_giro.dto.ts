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

export class CreateDeclaracionJuradaGiroDto {
  @IsInt()
  id_expediente        : number;

  @IsInt()
  id_giro_zonificacion : number;
}