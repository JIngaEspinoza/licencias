import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
export class CreateDeclaracionVigenciaPoderDto {
    @IsInt()
    id_vigencia: number;

    @IsInt()
    id_licencia: number;

    @IsOptional()
    @IsString()
    representante_legal?: string;

    @IsOptional()
    @IsString()
    partida_sunarp?: string;

    @IsOptional()
    @IsString()
    asiento?: string;

    @IsOptional()
    @IsDateString()
    fecha?: string;

}
