import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatTipoRequisitoService } from './cat_tipo_requisito.service';
import { CreateCatTipoRequisitoDto } from './dto/create-cat_tipo_requisito.dto';
import { UpdateCatTipoRequisitoDto } from './dto/update-cat_tipo_requisito.dto';

@Controller('cat-tipo-requisito')
export class CatTipoRequisitoController {
  constructor(private readonly catTipoRequisitoService: CatTipoRequisitoService) {}

  @Post()
  create(@Body() createCatTipoRequisitoDto: CreateCatTipoRequisitoDto) {
    return this.catTipoRequisitoService.create(createCatTipoRequisitoDto);
  }

  @Get()
  findAll() {
    return this.catTipoRequisitoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string,  id2: string) {
    return this.catTipoRequisitoService.findOne(+id, +id2);
  }

  @Patch(':id')
  update(@Param('id') id: string, id2: string, @Body() updateCatTipoRequisitoDto: UpdateCatTipoRequisitoDto) {
    return this.catTipoRequisitoService.update(+id, +id2, updateCatTipoRequisitoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, id2: string,) {
    return this.catTipoRequisitoService.remove(+id, +id2);
  }
}
