import { PartialType } from '@nestjs/mapped-types';
import { CreateRequisitoLicenciaDto } from './create-requisito_licencia.dto';

export class UpdateRequisitoLicenciaDto extends PartialType(CreateRequisitoLicenciaDto) {}
