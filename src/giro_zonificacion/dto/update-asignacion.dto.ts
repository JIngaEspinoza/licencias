import { IsOptional, IsString, IsInt, Min, Max, IsNumber, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class UpdateAsignacionDto {
    @IsNumber()
    @IsNotEmpty()
    giroId: number;

    @IsNumber()
    @IsNotEmpty()
    zonificacionId: number;

    @IsString()
    @IsOptional()
    estado_codigo: string;
}