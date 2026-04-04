import { PartialType } from '@nestjs/mapped-types';
import { CreateAutorizacionViaPublicaDto } from './create-autorizacion_via_publica.dto';

export class UpdateAutorizacionViaPublicaDto extends PartialType(CreateAutorizacionViaPublicaDto) {}
