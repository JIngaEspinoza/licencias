import { PartialType } from '@nestjs/mapped-types';
import { CreateExpedienteLicenciaDto } from './create-expediente_licencia.dto';

export class UpdateExpedienteLicenciaDto extends PartialType(CreateExpedienteLicenciaDto) {}
