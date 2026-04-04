import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoUsoDto } from './create-estado_uso.dto';
import { IsString } from 'class-validator';

export class UpdateEstadoUsoDto extends PartialType(CreateEstadoUsoDto) {
    @IsString() 
    codigo: string;

    @IsString()
    descripcion: string;
}
