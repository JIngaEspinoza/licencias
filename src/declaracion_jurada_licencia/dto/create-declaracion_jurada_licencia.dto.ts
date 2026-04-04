import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString
} from 'class-validator';
export class CreateDeclaracionJuradaLicenciaDto {
    @IsInt()
    id_licencia: number;

    @IsOptional()
    @IsString()
    tipo_declaracion: string;

    @IsOptional()
    @IsDateString()
    fecha: string;
    
    @IsOptional()
    @IsString()
    observaciones: string;
}
