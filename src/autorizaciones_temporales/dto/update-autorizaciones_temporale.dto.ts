import { PartialType } from '@nestjs/mapped-types';
import { CreateAutorizacionesTemporaleDto } from './create-autorizaciones_temporale.dto';

export class UpdateAutorizacionesTemporaleDto extends PartialType(CreateAutorizacionesTemporaleDto) {}
