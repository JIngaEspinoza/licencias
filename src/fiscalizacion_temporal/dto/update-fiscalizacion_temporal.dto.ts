import { PartialType } from '@nestjs/mapped-types';
import { CreateFiscalizacionTemporalDto } from './create-fiscalizacion_temporal.dto';

export class UpdateFiscalizacionTemporalDto extends PartialType(CreateFiscalizacionTemporalDto) {}
