import { IsString, IsOptional, IsInt, IsDateString, IsBoolean } from 'class-validator';
export class CreateRequisitoAutorizacionDto {
    @IsInt()
    id_requisito: number;
    
    @IsInt()
    id_autorizacion: number;
    
    @IsOptional()
    @IsString()
    tipo_requisito?: string;
    
    @IsOptional()
    @IsString()
    descripcion?: string;
    
    @IsOptional()
    @IsDateString()
    fecha_presentacion?: string;
    
    @IsOptional()
    @IsBoolean()
    cumplido?: boolean;
}
