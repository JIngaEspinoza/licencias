import { PartialType } from '@nestjs/mapped-types';
import { CreateAutorizacionAnexoDto } from './create-autorizacion_anexo.dto';

export class UpdateAutorizacionAnexoDto extends PartialType(CreateAutorizacionAnexoDto) {}
