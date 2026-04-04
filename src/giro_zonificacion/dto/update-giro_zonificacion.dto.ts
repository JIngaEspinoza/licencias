import { PartialType } from '@nestjs/mapped-types';
import { CreateGiroZonificacionDto } from './create-giro_zonificacion.dto';
import { IsString, IsNumber } from 'class-validator';

export class UpdateGiroZonificacionDto extends PartialType(CreateGiroZonificacionDto) {
    @IsNumber()
    id_giro: number;

    @IsNumber()
    id_zonificacion: number;

    @IsString()
    estado_codigo: string;
}
