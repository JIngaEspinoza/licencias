import { IsString } from 'class-validator';
export class CreateEstadoUsoDto {
    @IsString() 
    codigo: string;

    @IsString()
    descripcion: string;
}
