import { IsInt, IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExpedienteLicenciaDto {
  @IsInt()
  id_expediente: number;

  @IsInt()
  id_representante: number;

  @IsOptional()
  @IsString()
  numero_licencia_origen?: string;

  @IsDateString()
  fecha_recepcion: string;

  @IsString({ message: 'tipo_tramite debe ser texto' })
  @IsIn(['NUEVA', 'CAMBIO_DENOMINACION', 'TRANSFERENCIA', 'CESE', 'OTROS'], {
      message: 'tipo_tramite debe ser NUEVA, CAMBIO_DENOMINACION, TRANSFERENCIA, CESE u OTROS',
  })
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

  @IsOptional()
  @IsString()
  numero_resolucion?: string;

  @IsOptional()
  @IsDateString()
  resolucion_fecha?: string;

  @IsOptional()
  @IsString()
  nueva_denominacion?: string;

  @IsOptional()
  @IsString()
  numero_certificado?: string;

  @IsOptional()
  @IsString()
  qr_certificado?: string;

  @IsOptional()
  @IsString()
  detalle_otros?: string;
}