import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
export class CreateTipoAutorizacionTemporalDto {
    @IsInt()
    id_tipo: number;
    
    @IsOptional()
    @IsString()
    nombre_tipo?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
