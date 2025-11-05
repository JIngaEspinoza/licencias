import { IsString, IsOptional, IsInt, IsDateString, IsBoolean } from 'class-validator';
export class CreateFiscalizacionAutorizacionDto {
    @IsInt()
    id_fiscalizacion: number;
    
    @IsInt()
    id_autorizacion: number;
    
    @IsOptional()
    @IsDateString()
    fecha_visita?: string;
    
    @IsOptional()
    @IsString()
    observaciones?: string;
    
    @IsOptional()
    @IsString()
    resultado?: string;
}
