import { PartialType } from '@nestjs/mapped-types';
import { CreateAutorizacionEstablecimientoDto } from './create-autorizacion_establecimiento.dto';

export class UpdateAutorizacionEstablecimientoDto extends PartialType(CreateAutorizacionEstablecimientoDto) {}
