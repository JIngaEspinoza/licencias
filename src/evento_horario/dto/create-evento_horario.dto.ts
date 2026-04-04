import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean } from 'class-validator';
export class CreateEventoHorarioDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_evento!: number;

    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha_inicio debe ser YYYY-MM-DD' })
    fecha_inicio!: string;

    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha_fin debe ser YYYY-MM-DD' })
    fecha_fin!: string;

    @IsString()
    @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'hora_inicio debe ser HH:mm o HH:mm:ss' })
    hora_inicio!: string;

    @IsString()
    @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'hora_fin debe ser HH:mm o HH:mm:ss' })
    hora_fin!: string;
}