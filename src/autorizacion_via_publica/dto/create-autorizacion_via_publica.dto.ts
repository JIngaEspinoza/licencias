import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean, IsNumberString } from 'class-validator';

export const MODALIDADES_AVP = [
  'AUTORIZACION_MUNICIPAL_TEMPORAL',
  'AUTORIZACION_MUNICIPAL_EXCEPCIONAL',
] as const;
type ModalidadAvp = (typeof MODALIDADES_AVP)[number];

const YMD = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

export class CreateAutorizacionViaPublicaDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_expediente!: number;

    @IsOptional()
    @Matches(YMD, { message: 'fecha_solicitud debe ser YYYY-MM-DD' })
    fecha_solicitud?: string;

    @IsOptional()
    @IsIn(MODALIDADES_AVP as unknown as string[])
    modalidad?: ModalidadAvp;

    @IsOptional()
    @Matches(YMD, { message: 'fecha_inicio_temporal debe ser YYYY-MM-DD' })
    fecha_inicio_temporal?: string;

    @IsOptional()
    @Matches(YMD, { message: 'fecha_fin_temporal debe ser YYYY-MM-DD' })
    fecha_fin_temporal?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    otras_referencia?: string;
}