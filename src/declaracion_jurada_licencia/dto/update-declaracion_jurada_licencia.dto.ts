import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclaracionJuradaLicenciaDto } from './create-declaracion_jurada_licencia.dto';

export class UpdateDeclaracionJuradaLicenciaDto extends PartialType(CreateDeclaracionJuradaLicenciaDto) {}
