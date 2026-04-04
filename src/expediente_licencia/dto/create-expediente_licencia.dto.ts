import { IsInt, IsOptional, IsString, IsIn, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExpedienteLicenciaDto {
  @IsInt()
  id_expediente: number;

  @IsInt()
  id_representante?: number;
  
  @IsBoolean()
  tiene_apoderado: boolean;

  @IsDateString()
  fecha_recepcion: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  tipo_tramite?: 'NUEVA' | 'CAMBIO_DENOMINACION' | 'TRANSFERENCIA' | 'CESE' | 'OTROS';

  @IsString({ message: 'tipo_tramite debe ser texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  modalidad?: 'INDETERMINADA' | 'TEMPORAL';

  @IsOptional()
  @IsDateString()
  fecha_inicio_plazo?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin_plazo?: string;

  @IsBoolean()
  anuncio: boolean;

  @IsOptional()
  @IsString()
  a_descripcion?: string;

  @IsBoolean()
  cesionario: boolean;

  @IsOptional()
  @IsString()
  ces_nrolicencia?: string;

  @IsBoolean()
  mercado: boolean;

  @IsOptional()
  @IsString()
  tipo_accion_tramite?: string;

  @IsOptional()
  @IsString()
  numero_resolucion?: string;

  @IsOptional()
  @IsDateString()
  resolucion_fecha?: string;

  @IsOptional()
  @IsString()
  numero_certificado?: string;

  @IsString()
  @IsOptional()
  numero_licencia_origen?: string;

  @IsOptional()
  @IsString()
  nueva_denominacion?: string;

  @IsOptional()
  @IsString()
  detalle_otros?: string;

  @IsOptional()
  @IsString()
  qr_certificado?: string;

  @IsString()
  nivel_riesgo: string;

  @IsString()
  numero_itse?: string;

  @IsString()
  doc_itse?: string;

  @IsBoolean()
  bajo_juramento: boolean;
  
}