import { PartialType } from '@nestjs/mapped-types';
import { CreateActividadCatalogoDto } from './create-actividad_catalogo.dto';

export class UpdateActividadCatalogoDto extends PartialType(CreateActividadCatalogoDto) {}
