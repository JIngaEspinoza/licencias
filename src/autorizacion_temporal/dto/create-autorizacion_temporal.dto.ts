import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
export class CreateAutorizacionTemporalDto {
    @IsInt()
    id_autorizacion: number;
    
    @IsInt()
    id_ciudadano: number;

    @IsInt()
    id_tipo: number;

    @IsOptional()
    @IsString()    
    numero_autorizacion?: string;
    
    @IsOptional()
    @IsDateString()    
    fecha_solicitud?: string;
    
    @IsOptional()
    @IsDateString()
    fecha_emision?: string;
    
    @IsOptional()
    @IsDateString()    
    fecha_inicio?: string;
    
    @IsOptional()
    @IsDateString()
    fecha_fin?: string;

    @IsOptional()
    @IsString()
    ubicacion?: string;
    
    @IsOptional()
    @IsString()
    aforo?: number;
    
    @IsOptional()
    @IsString()    
    estado?: string;
    
    @IsOptional()
    @IsString()
    codigo_qr?: string;
}
