import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoRequisitoDto } from './create-evento_requisito.dto';

export class UpdateEventoRequisitoDto extends PartialType(CreateEventoRequisitoDto) {}
