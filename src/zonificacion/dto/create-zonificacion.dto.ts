import { IsString } from 'class-validator';
export class CreateZonificacionDto {
    @IsString()
    codigo: string;
    
    @IsString()
    descripcion?: string;
}
