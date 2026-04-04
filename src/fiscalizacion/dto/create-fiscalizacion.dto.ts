import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
export class CreateFiscalizacionDto {
    @IsInt()
    id_fiscalizacion: number;
    
    @IsInt()
    id_licencia: number;
    
    @IsDateString()
    fecha_visita?: string;
    
    @IsString()
    infraccion_detectada?: string;
    
    @IsString()
    resultado?: string;

}
