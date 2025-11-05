import { PartialType } from '@nestjs/mapped-types';
import { CreateLicenciaFuncionamientoDto } from './create-licencia_funcionamiento.dto';

export class UpdateLicenciaFuncionamientoDto extends PartialType(CreateLicenciaFuncionamientoDto) {}
