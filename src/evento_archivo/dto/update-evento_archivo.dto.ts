import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoArchivoDto } from './create-evento_archivo.dto';

export class UpdateEventoArchivoDto extends PartialType(CreateEventoArchivoDto) {}
