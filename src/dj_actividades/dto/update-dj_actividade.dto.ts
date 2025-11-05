import { PartialType } from '@nestjs/mapped-types';
import { CreateDjActividadeDto } from './create-dj_actividade.dto';

export class UpdateDjActividadeDto extends PartialType(CreateDjActividadeDto) {}
