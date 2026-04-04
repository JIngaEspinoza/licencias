import { IsString, IsOptional} from 'class-validator';

export class CreateActividadCatalogoDto {
    @IsString()
    nombre_actividad  : string
    
    @IsOptional()
    @IsString()
    estado           ?: string
}