import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclaracionJuradaGiroDto } from './create-declaracion_jurada_giro.dto';

export class UpdateDeclaracionJuradaGiroDto extends PartialType(CreateDeclaracionJuradaGiroDto) {}
