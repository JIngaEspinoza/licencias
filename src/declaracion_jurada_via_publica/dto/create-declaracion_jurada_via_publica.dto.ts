import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
export class CreateDeclaracionJuradaViaPublicaDto {
    @IsInt()
    id_declaracion: number;
    
    @IsInt()
    id_autorizacion: number;  
    
    @IsOptional()
    @IsDateString()    
    fecha?: string;
    
    @IsOptional()
    @IsString()
    compromisos?: string;
}
