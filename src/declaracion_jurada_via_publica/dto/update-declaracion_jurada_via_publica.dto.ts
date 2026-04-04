import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclaracionJuradaViaPublicaDto } from './create-declaracion_jurada_via_publica.dto';

export class UpdateDeclaracionJuradaViaPublicaDto extends PartialType(CreateDeclaracionJuradaViaPublicaDto) {}
