import { PartialType } from '@nestjs/mapped-types';
import { CreateAutorizacionTemporalDto } from './create-autorizacion_temporal.dto';

export class UpdateAutorizacionTemporalDto extends PartialType(CreateAutorizacionTemporalDto) {}
