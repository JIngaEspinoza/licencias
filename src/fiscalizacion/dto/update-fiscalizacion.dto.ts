import { PartialType } from '@nestjs/mapped-types';
import { CreateFiscalizacionDto } from './create-fiscalizacion.dto';

export class UpdateFiscalizacionDto extends PartialType(CreateFiscalizacionDto) {}
