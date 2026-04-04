import { PartialType } from '@nestjs/mapped-types';
import { CreateZonificacionDto } from './create-zonificacion.dto';
import { IsString } from 'class-validator';

export class UpdateZonificacionDto extends PartialType(CreateZonificacionDto) {
    @IsString()
    codigo: string;
    
    @IsString()
    descripcion?: string;
}
