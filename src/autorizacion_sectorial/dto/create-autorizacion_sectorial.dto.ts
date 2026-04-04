import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
export class CreateAutorizacionSectorialDto {
    @IsInt()
    id_autorizacion: number;
    
    @IsInt()
    id_licencia: number;
    
    @IsOptional()
    @IsString()
    entidad_otorgante?: string
    
    @IsOptional()
    @IsString()
    denominacion?: string
    
    @IsOptional()
    @IsString()
    numero_autorizacion?: string
    
    @IsOptional()
    @IsDateString()
    fecha_autorizacion?: string
}
