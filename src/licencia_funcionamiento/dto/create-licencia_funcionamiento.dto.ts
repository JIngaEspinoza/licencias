import { Decimal } from '@prisma/client/runtime/library';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsDecimal,
} from 'class-validator';
export class CreateLicenciaFuncionamientoDto {
    @IsInt()
    id_ciudadano: number;

    @IsOptional()
    @IsString()
    numero_expediente?: string;

    @IsOptional()
    @IsString()
    numero_resolucion?: string;

    @IsOptional()
    @IsString()
    numero_certificado?: string;

    @IsOptional()
    @IsDateString()
    fecha_solicitud?: string;

    @IsOptional()
    @IsDateString()
    fecha_emision?: string;

    @IsOptional()
    @IsDateString()
    fecha_vencimiento?: string;

    @IsOptional()
    @IsString()
    nombre_comercial?: string;

    @IsOptional()
    @IsString()
    giro_actividad?: string;

    @IsOptional()
    @IsString()
    zonificacion?: string;

    @IsOptional()
    @IsDecimal()
    area_total_m2?: Decimal;

    @IsOptional()
    @IsString()
    riesgo?: string;

    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsString()
    codigo_qr?: string;
}
