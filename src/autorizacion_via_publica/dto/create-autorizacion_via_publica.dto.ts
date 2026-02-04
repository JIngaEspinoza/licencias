/*
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail, IsBoolean, IsNumberString } from 'class-validator';

export const MODALIDADES_AVP = [
  'AUTORIZACION_MUNICIPAL_TEMPORAL',
  'AUTORIZACION_MUNICIPAL_EXCEPCIONAL',
] as const;
type ModalidadAvp = (typeof MODALIDADES_AVP)[number];

const YMD = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

export class CreateAutorizacionViaPublicaDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_expediente!: number;

    @IsOptional()
    @Matches(YMD, { message: 'fecha_solicitud debe ser YYYY-MM-DD' })
    fecha_solicitud?: string;

    @IsOptional()
    @IsIn(MODALIDADES_AVP as unknown as string[])
    modalidad?: ModalidadAvp;

    @IsOptional()
    @Matches(YMD, { message: 'fecha_inicio_temporal debe ser YYYY-MM-DD' })
    fecha_inicio_temporal?: string;

    @IsOptional()
    @Matches(YMD, { message: 'fecha_fin_temporal debe ser YYYY-MM-DD' })
    fecha_fin_temporal?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    otras_referencia?: string;
}
*/
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// A. DTO para AutorizacionEstablecimiento (Relación 1:N, pero suele ser 1 en la práctica)
// El ID de la relación principal (id_auto_viapublica) se añade automáticamente por Prisma.
export class CreateAutorizacionEstablecimientoDto {
  @IsOptional()
  @IsBoolean()
  modulo_movible?: boolean;

  @IsOptional()
  @IsBoolean()
  modulo_estacionario?: boolean;

  @IsOptional()
  @IsBoolean()
  triciclo?: boolean;

  @IsOptional()
  @IsBoolean()
  vehiculo_motorizado?: boolean;

  @IsOptional()
  @IsString()
  medio_venta?: string;

  @IsOptional()
  @IsString()
  giro_actividad?: string;

  @IsOptional()
  @IsString()
  via_tipo?: string;

  @IsOptional()
  @IsString()
  via_nombre?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  // Campos de ubicación
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsInt()
  map_zoom?: number;
}


// B. DTO para AutorizacionAnexo
// Para la creación inicial, solo necesitamos saber qué requisitos estamos adjuntando.
// En una implementación real, la subida de archivos se haría en otro endpoint, 
// y aquí solo se enviaría la FK (id_requisito) o quizás el ID del anexo ya creado.
// Aquí asumiremos que los anexos se gestionan por separado, y este DTO es para 
// un caso de prueba si fueras a crear el anexo con la info mínima.

export class CreateAutorizacionAnexoDto {
  // Asumimos que la subida del archivo ya ocurrió y tienes el id_requisito.
  @IsNotEmpty()
  @IsInt()
  id_requisito: number;

  // Estos campos normalmente los define el sistema después de subir el archivo,
  // pero los incluimos si el cliente los envía:
  @IsString()
  @IsNotEmpty()
  nombre_archivo: string;

  @IsString()
  @IsNotEmpty()
  ruta_almacen: string;
  
  // Nota: tamano_bytes es BigInt en DB, por lo que se recibe como string
  @IsOptional()
  @IsString()
  tamano_bytes?: string;
}


// --- DTO Principal (Create) ---

export class CreateAutorizacionViaPublicaDto {
  @IsNotEmpty()
  @IsInt()
  id_expediente: number; // FK obligatoria

  @IsOptional()
  @IsDateString()
  fecha_solicitud?: string;

  @IsNotEmpty()
  @IsString()
  modalidad: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio_temporal?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin_temporal?: string;

  // --- Relaciones Anidadas ---

  // Para el establecimiento: Usamos @Type() y @ValidateNested() para validar el sub-DTO
  @ValidateNested()
  @Type(() => CreateAutorizacionEstablecimientoDto)
  autorizacion_establecimiento: CreateAutorizacionEstablecimientoDto;

  // Para los anexos: Es un array de anexos
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(0) // Puede que no se suban anexos al inicio
  @Type(() => CreateAutorizacionAnexoDto)
  autorizacion_anexo: CreateAutorizacionAnexoDto[];
}