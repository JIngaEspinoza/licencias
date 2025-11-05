import { IsString, IsNumber } from 'class-validator';
export class CreateGiroZonificacionDto {
    @IsNumber()
    id_giro: number;

    @IsNumber()
    id_zonificacion: number;

    @IsString()
    estado_codigo: string;
}