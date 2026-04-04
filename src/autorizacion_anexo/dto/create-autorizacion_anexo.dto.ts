import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean, IsNumberString, Max } from 'class-validator';
export class CreateAutorizacionAnexoDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_auto_viapublica!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_requisito!: number;

    @IsString()
    @MaxLength(260)
    nombre_archivo!: string;

    @IsString()
    @MaxLength(500)
    ruta_almacen!: string;

    @IsOptional()
    @Matches(/^[A-Za-z0-9]{1,10}$/, { message: 'extension inválida' })
    extension?: string;

    @IsOptional()
    @IsNumberString()
    tamano_bytes?: string;

    @IsOptional()
    @Matches(/^[a-fA-F0-9]{16,128}$/, { message: 'hash_archivo debe ser hex (16-128)' })
    hash_archivo?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
        message: 'fecha_subida debe ser ISO UTC (e.g., 2025-10-05T12:00:00.000Z)',
    })
    fecha_subida?: string;
}