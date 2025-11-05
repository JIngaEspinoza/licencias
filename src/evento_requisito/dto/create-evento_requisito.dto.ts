import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean } from 'class-validator';
export const ESTADOS_REQ = ['PENDIENTE', 'ENTREGADO', 'OBSERVADO', 'EXONERADO'] as const;
type EstadoReq = (typeof ESTADOS_REQ)[number];

export class CreateEventoRequisitoDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_evento!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_requisito!: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    obligatorio?: boolean; // default true en la BD

    @IsOptional()
    @IsIn(ESTADOS_REQ as unknown as string[])
    estado?: EstadoReq; // default 'PENDIENTE' en la BD

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    observacion?: string;
}
