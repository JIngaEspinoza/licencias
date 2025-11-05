import { PartialType } from '@nestjs/mapped-types';
import { CreateFiscalizacionAutorizacionDto } from './create-fiscalizacion_autorizacion.dto';

export class UpdateFiscalizacionAutorizacionDto extends PartialType(CreateFiscalizacionAutorizacionDto) {}
