import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches } from 'class-validator';
export class CreateDjCesionarioDto {
  @IsInt()
  id_declaracion : number;
  
  @IsOptional()
  @IsString()
  nombre_razon   ?: string;
  
  @IsOptional()
  @IsString()
  documento      ?: string;
}