import { IsOptional, IsString, IsInt, Min, IsDateString } from "class-validator";
import { Type } from "class-transformer";

export class FindExpedientesDto {
  // Búsqueda general (Expediente, Nombre, Documento)
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

  // Razón Social (Si quieres un campo independiente de 'q')
  @IsOptional()
  @IsString()
  razonSocial?: string; 
  
  // RUC (Se puede incluir en 'q' o como campo separado)
  @IsOptional()
  @IsString()
  ruc?: string; 

  // Modalidad de Trámite (SELECT)
  @IsOptional()
  @IsString()
  modalidadTramite?: string; // Asume que el valor es un string (ej: "PRESENCIAL", "VIRTUAL")

  @IsOptional()
  @IsDateString()
  fechaInicio?: string; 

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

}