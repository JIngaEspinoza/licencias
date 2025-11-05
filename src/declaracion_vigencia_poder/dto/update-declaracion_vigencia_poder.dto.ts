import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclaracionVigenciaPoderDto } from './create-declaracion_vigencia_poder.dto';

export class UpdateDeclaracionVigenciaPoderDto extends PartialType(CreateDeclaracionVigenciaPoderDto) {}
