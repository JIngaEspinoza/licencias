import { PartialType } from '@nestjs/mapped-types';
import { CreateGiroDto } from './create-giro.dto';
import { IsString, IsNumber } from 'class-validator';

export class UpdateGiroDto extends PartialType(CreateGiroDto) {
    @IsNumber()
    id_giro: number;

    @IsString() 
    codigo: string;
    
    @IsString() 
    nombre: string;
}
