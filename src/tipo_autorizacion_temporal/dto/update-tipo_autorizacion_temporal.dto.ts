import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoAutorizacionTemporalDto } from './create-tipo_autorizacion_temporal.dto';

export class UpdateTipoAutorizacionTemporalDto extends PartialType(CreateTipoAutorizacionTemporalDto) {}
