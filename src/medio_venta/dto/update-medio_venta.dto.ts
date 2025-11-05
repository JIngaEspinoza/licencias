import { PartialType } from '@nestjs/mapped-types';
import { CreateMedioVentaDto } from './create-medio_venta.dto';

export class UpdateMedioVentaDto extends PartialType(CreateMedioVentaDto) {}
