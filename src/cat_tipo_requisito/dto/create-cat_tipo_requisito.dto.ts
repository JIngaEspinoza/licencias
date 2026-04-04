import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean } from 'class-validator';
export class CreateCatTipoRequisitoDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_tipo!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_requisito!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    orden?: number;
}