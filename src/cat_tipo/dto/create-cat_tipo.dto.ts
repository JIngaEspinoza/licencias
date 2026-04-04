import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean } from 'class-validator';
export class CreateCatTipoDto {
    @IsInt()
    id_categoria: number;

    @IsString()
    @MaxLength(40)
    key!: string;

    @IsString()
    @MaxLength(200)
    titulo!: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    vigencia_text?: string;

    @IsOptional()
    @IsString()
    @MaxLength(160)
    presentacion_text?: string;

    @IsOptional()
    @IsString()
    tarifa_text?: string;

    @IsOptional()
    @IsString()
    nota?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    base_legal?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    vigencia_dias?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    presentacion_min_dh?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    presentacion_es_hab?: boolean;
}