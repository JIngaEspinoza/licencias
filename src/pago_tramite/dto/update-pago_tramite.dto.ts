import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoTramiteDto } from './create-pago_tramite.dto';

export class UpdatePagoTramiteDto extends PartialType(CreatePagoTramiteDto) {}
