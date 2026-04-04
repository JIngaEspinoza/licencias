import { IsString } from 'class-validator';
export class CreateCatRequisitoDto {
    @IsString()
    nombre       : string;
}