import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclaracionJuradaDto } from './create-declaracion_jurada.dto';

export class UpdateDeclaracionJuradaDto extends PartialType(CreateDeclaracionJuradaDto) {}
