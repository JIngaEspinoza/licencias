import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
export class CreateFiscalizacionTemporalDto {
  @IsInt()
  id_fiscalizacion: number;
  
  @IsOptional()
  @IsInt()
  id_autorizacion: number;
  
  @IsOptional()
  @IsDateString()
  fecha_visita?: string;
  
  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  resultado?: string;
}
