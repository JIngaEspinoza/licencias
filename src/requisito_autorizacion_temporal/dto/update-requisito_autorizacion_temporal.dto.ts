import { PartialType } from '@nestjs/mapped-types';
import { CreateRequisitoAutorizacionTemporalDto } from './create-requisito_autorizacion_temporal.dto';

export class UpdateRequisitoAutorizacionTemporalDto extends PartialType(CreateRequisitoAutorizacionTemporalDto) {}
