import { IsString, IsOptional, IsInt } from 'class-validator';
export class CreateMedioVentaDto {
    @IsInt()
    id_medio: number;
    
    @IsInt()
    id_autorizacion: number;
    
    @IsOptional()
    @IsString()
    tipo_medio?: string;
    
    @IsOptional()
    @IsString()
    descripcion?: string;
    
    @IsOptional()
    @IsString()
    foto_url?: string;
    
    @IsOptional()
    @IsString()
    croquis_url?: string;
}
