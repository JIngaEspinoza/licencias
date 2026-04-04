import { Prisma } from '@prisma/client';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches } from 'class-validator';

export class CreatePagoTramiteDto {
  @IsInt()
  @Min(1)
  id_expediente!: number;

  @IsString()
  @MaxLength(150)
  concepto!: string;

  @IsString()
  @MaxLength(50)
  nro_recibo!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha_pago debe tener formato YYYY-MM-DD',
  })
  fecha_pago!: string;

  @IsString()
  @Matches(/^-?\d{1,10}(\.\d{1,2})?$/, {
    message: 'monto debe tener hasta 12 dígitos totales y 2 decimales',
  })
  monto!: string; // string por precisión; se convertirá a Prisma.Decimal en el servicio
}