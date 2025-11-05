import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean, IsNumberString } from 'class-validator';
export class CreateEventoArchivoDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_evento_req!: number;

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
    tamano_bytes?: string; // luego se convierte a BigInt

    @IsOptional()
    @Matches(/^[a-fA-F0-9]{16,128}$/, { message: 'hash_archivo debe ser hex (16-128)' })
    hash_archivo?: string;

    @IsOptional()
    @IsNumberString()
    fecha_subida?: string;
}
