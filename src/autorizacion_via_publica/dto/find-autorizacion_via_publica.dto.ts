import { IsOptional, IsString, IsInt, Min, IsDateString } from "class-validator";
import { Type } from "class-transformer";

export class FindAutorizacionViaPublicaDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  numero_expediente?: string; 

  @IsOptional()
  @IsString()
  razonSocial?: string; 
  
  @IsOptional()
  @IsString()
  ruc?: string; 

  @IsOptional()
  @IsDateString()
  fechaInicio?: string; 

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

}