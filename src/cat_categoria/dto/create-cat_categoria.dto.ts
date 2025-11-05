import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail } from 'class-validator';
export class CreateCatCategoriaDto {
    @IsString()
    nombre       :  string;
    
    @IsOptional()
    @IsString()
    slug         ?: string;
}