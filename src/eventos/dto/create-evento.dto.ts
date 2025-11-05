import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean } from 'class-validator';
export const ESTADOS_EVENTO = ['BORRADOR', 'ACTIVO', 'ANULADO', 'CERRADO'] as const;
type EstadoEvento = (typeof ESTADOS_EVENTO)[number];

export class CreateEventoDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_tipo!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_expediente!: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numero_licencia?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numero_certificado?: string;

    @IsString()
    @MaxLength(200)
    actividad!: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    ubicacion?: string;

    @IsOptional()
    @IsISO8601()
    fecha_registro?: string;

    @IsOptional()
    @IsIn(ESTADOS_EVENTO as unknown as string[])
    estado?: EstadoEvento;
}
