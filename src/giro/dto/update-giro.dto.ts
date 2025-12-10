import { PartialType } from '@nestjs/mapped-types';
import { CreateGiroDto } from './create-giro.dto';
import { IsString, IsNumber } from 'class-validator';

export class UpdateGiroDto extends PartialType(CreateGiroDto) {
    @IsString() 
    codigo: string;
    
    @IsString() 
    nombre: string;
}
