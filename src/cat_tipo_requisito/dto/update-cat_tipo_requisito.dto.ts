import { PartialType } from '@nestjs/mapped-types';
import { CreateCatTipoRequisitoDto } from './create-cat_tipo_requisito.dto';

export class UpdateCatTipoRequisitoDto extends PartialType(CreateCatTipoRequisitoDto) {}
