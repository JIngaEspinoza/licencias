import { PartialType } from '@nestjs/mapped-types';
import { CreateFiscalizacionVisitaDto } from './create-fiscalizacion_visita.dto';

export class UpdateFiscalizacionVisitaDto extends PartialType(CreateFiscalizacionVisitaDto) {}
