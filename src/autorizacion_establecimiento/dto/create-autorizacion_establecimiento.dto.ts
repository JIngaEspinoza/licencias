import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean, IsNumberString, Max } from 'class-validator';
// hasta 9,6 => signo opcional, hasta 3 enteros + 6 decimales para lat/lng (ajustamos con rangos)
const DEC_9_6 = /^-?\d{1,3}(\.\d{1,6})?$/;

export class CreateAutorizacionEstablecimientoDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_auto_viapublica!: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    modulo_movible?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    modulo_estacionario?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    triciclo?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    vehiculo_motorizado?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    medio_venta?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    giro_actividad?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    via_tipo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    via_nombre?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    numero?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    interior?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    mz?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    lt?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    otros?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    urb_aa_hh_otros?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    ubicacion?: string;

    @Matches(DEC_9_6, { message: 'lat debe tener hasta 6 decimales' })
    lat!: string;

    @Matches(DEC_9_6, { message: 'lng debe tener hasta 6 decimales' })
    lng!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(30)
    map_zoom?: number;
}