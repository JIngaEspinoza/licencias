import { PartialType } from '@nestjs/mapped-types';
import { CreateRequisitoAutorizacionDto } from './create-requisito_autorizacion.dto';

export class UpdateRequisitoAutorizacionDto extends PartialType(CreateRequisitoAutorizacionDto) {}
