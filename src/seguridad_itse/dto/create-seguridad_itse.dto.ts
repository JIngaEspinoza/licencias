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
  IsBoolean
} from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateSeguridadItseDto {
    @IsInt()
    id_expediente         : number;
    
    @IsOptional()
    @IsString()
    nivel                 ?: string;
    
    @IsBoolean()
    condiciones_seguridad : boolean;
    
    @IsOptional()
    @IsString()
    modal_itse            ?: string;
    
    @IsOptional()
    @IsString()
    numero_itse           ?: string;
    
    @IsOptional()
    @IsString()
    archivo_itse          ?: string;

    @IsBoolean()
    editable              : boolean;
    
    @IsOptional()
    @IsString()
    calificador_nombre    ?: string;
    
    @IsDateString()
    fecha                 ?: string;
}