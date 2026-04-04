import { PartialType } from '@nestjs/mapped-types';
import { CreateDjConstanciaDto } from './create-dj_constancia.dto';

export class UpdateDjConstanciaDto extends PartialType(CreateDjConstanciaDto) {}
