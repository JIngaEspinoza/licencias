import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
export class CreateDeclaracionTituloProfesionalDto {
  @IsInt()
  id_titulo: number;
  
  @IsInt()
  id_licencia: number;

  @IsString()
  nombre_titulo?: string;

  @IsString()
  institucion?: string;

  @IsDateString()
  fecha_emision?: string;

  @IsString()
  colegio_profesional?: string;
  
  @IsString()
  nro_colegiatura?: string;
}
