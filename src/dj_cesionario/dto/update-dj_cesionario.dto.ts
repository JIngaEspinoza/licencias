import { PartialType } from '@nestjs/mapped-types';
import { CreateDjCesionarioDto } from './create-dj_cesionario.dto';

export class UpdateDjCesionarioDto extends PartialType(CreateDjCesionarioDto) {}
