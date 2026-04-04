import { PartialType } from '@nestjs/mapped-types';
import { CreateCatCategoriaDto } from './create-cat_categoria.dto';

export class UpdateCatCategoriaDto extends PartialType(CreateCatCategoriaDto) {}
