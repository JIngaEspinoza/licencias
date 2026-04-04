import { PartialType } from '@nestjs/mapped-types';
import { CreateSeguridadItseDto } from './create-seguridad_itse.dto';

export class UpdateSeguridadItseDto extends PartialType(CreateSeguridadItseDto) {}
