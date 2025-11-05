import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclaracionTituloProfesionalDto } from './create-declaracion_titulo_profesional.dto';

export class UpdateDeclaracionTituloProfesionalDto extends PartialType(CreateDeclaracionTituloProfesionalDto) {}
