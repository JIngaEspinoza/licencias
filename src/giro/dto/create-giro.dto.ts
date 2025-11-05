import { IsString, IsNumber } from 'class-validator';
export class CreateGiroDto {
    @IsNumber()
    id_giro: number;

    @IsString() 
    codigo: string;
    
    @IsString() 
    nombre: string;
}
