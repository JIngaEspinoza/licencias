import { PartialType } from '@nestjs/mapped-types';
import { CreateCatRequisitoDto } from './create-cat_requisito.dto';

export class UpdateCatRequisitoDto extends PartialType(CreateCatRequisitoDto) {}
