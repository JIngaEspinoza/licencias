import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluacionTecnicaDto } from './create-evaluacion_tecnica.dto';

export class UpdateEvaluacionTecnicaDto extends PartialType(CreateEvaluacionTecnicaDto) {}
