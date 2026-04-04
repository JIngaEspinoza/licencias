import { PartialType } from '@nestjs/mapped-types';
import { CreateCatTipoDto } from './create-cat_tipo.dto';

export class UpdateCatTipoDto extends PartialType(CreateCatTipoDto) {}
