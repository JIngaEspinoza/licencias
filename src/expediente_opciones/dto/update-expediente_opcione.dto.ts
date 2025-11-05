import { PartialType } from '@nestjs/mapped-types';
import { CreateExpedienteOpcioneDto } from './create-expediente_opcione.dto';

export class UpdateExpedienteOpcioneDto extends PartialType(CreateExpedienteOpcioneDto) {}
