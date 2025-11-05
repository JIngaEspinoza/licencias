import { PartialType } from '@nestjs/mapped-types';
import { CreateAutorizacionSectorialDto } from './create-autorizacion_sectorial.dto';

export class UpdateAutorizacionSectorialDto extends PartialType(CreateAutorizacionSectorialDto) {}
