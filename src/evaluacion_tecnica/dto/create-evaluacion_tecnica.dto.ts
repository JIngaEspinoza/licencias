import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
export class CreateEvaluacionTecnicaDto {
    @IsInt() 
    id_evaluacion: number;
    
    @IsInt() 
    id_licencia: number;

    @IsOptional()
    @IsString()
    area_responsable?: string;
    
    @IsOptional()
    @IsString()
    resultado?: string;
    
    @IsOptional()
    @IsDateString()
    fecha_evaluacion: string;
    
    @IsOptional()
    @IsString()
    observaciones?: string;
}
