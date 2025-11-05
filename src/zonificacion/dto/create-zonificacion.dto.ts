import { IsString } from 'class-validator';
export class CreateZonificacionDto {
    @IsString()
    id_zonificacion: number;
    
    @IsString()
    codigo: string;
    
    @IsString()
    descripcion?: string;
}
