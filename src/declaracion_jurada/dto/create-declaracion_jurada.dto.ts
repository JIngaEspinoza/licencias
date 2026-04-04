import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsIn,
  Matches,
  Length,
  IsDateString,
  IsBoolean,
  IsDecimal,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDeclaracionJuradaDto {
    id_expediente                : number;
    
    @IsDateString()
    @IsString()
    fecha                        : string;

    @IsBoolean()
    aceptacion                   : boolean;  
    
    @IsOptional()
    @IsString()
    nombre_comercial             ?: string;
    
    @IsOptional()
    @IsString()
    codigo_ciiu                  ?: string;
    
    @IsOptional()
    @IsString()
    actividad                    ?: string;
    
    @IsOptional()
    @IsString()
    zonificacion                 ?: string;
    
    @IsOptional()
    @IsString()
    via_tipo                     ?: string;
    
    @IsOptional()
    @IsString()
    via_nombre                   ?: string;
    
    @IsOptional()
    @IsString()
    numero                       ?: string;
    
    @IsOptional()
    @IsString()
    interior                     ?: string;
    
    @IsOptional()
    @IsString()
    mz                           ?: string;
    
    @IsOptional()
    @IsString()
    lt                           ?: string;
    
    @IsOptional()
    @IsString()
    otros                        ?: string;
    
    @IsOptional()
    @IsString()
    urb_aa_hh_otros              ?: string;
    
    @IsOptional()
    @IsString()
    provincia                    ?: string;
    
    @IsBoolean()
    tiene_aut_sectorial          : boolean;
    
    @IsOptional()
    @IsString()
    aut_entidad                  ?: string;
    
    @IsOptional()
    @IsString()
    aut_denominacion             ?: string;
    
    @IsOptional()
    @IsString()
    aut_fecha                    ?: string;
    
    @IsOptional()
    @IsString()
    aut_numero                   ?: string;
    
    @IsBoolean()
    monumento                    : boolean;
    
    @IsBoolean()
    aut_ministerio_cultura       : boolean;
    
    @IsOptional()
    @IsString()
    num_aut_ministerio_cultura   ?: string;
    
    @IsOptional()
    @IsDateString()
    fecha_aut_ministerio_cultura ?: string;

    @IsOptional()
    @IsDecimal({ decimal_digits: '0,2', force_decimal: true }) // valida cadenas con hasta 2 decimales
    area_total_m2                ?: string; // <- string en el DTO
    
    @IsOptional()
    @IsString()
    firmante_tipo                ?: string;
    
    @IsOptional()
    @IsString()
    firmante_nombre              ?: string;
    
    @IsOptional()
    @IsString()
    firmante_doc_tipo            ?: string;
    
    @IsOptional()
    @IsString()
    firmante_doc_numero          ?: string;
        
    @IsBoolean()
    vigencia_poder               : boolean;
    
    @IsBoolean()
    condiciones_seguridad        : boolean;
    
    @IsBoolean()
    titulo_profesional           : boolean;
    
    @IsOptional()
    @IsString()
    observaciones                ?: string;
}