import { IsString, IsNumber } from 'class-validator';
export class CreateGiroDto {
    @IsString() 
    codigo: string;
    
    @IsString() 
    nombre: string;
}
