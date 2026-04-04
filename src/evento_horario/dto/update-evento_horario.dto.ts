import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoHorarioDto } from './create-evento_horario.dto';

export class UpdateEventoHorarioDto extends PartialType(CreateEventoHorarioDto) {}
