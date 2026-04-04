import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatCategoriaService } from './cat_categoria.service';
import { CreateCatCategoriaDto } from './dto/create-cat_categoria.dto';
import { UpdateCatCategoriaDto } from './dto/update-cat_categoria.dto';

@Controller('cat-categoria')
export class CatCategoriaController {
  constructor(private readonly catCategoriaService: CatCategoriaService) {}

  @Post()
  create(@Body() createCatCategoriaDto: CreateCatCategoriaDto) {
    return this.catCategoriaService.create(createCatCategoriaDto);
  }

  @Get()
  findAll() {
    return this.catCategoriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catCategoriaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatCategoriaDto: UpdateCatCategoriaDto) {
    return this.catCategoriaService.update(+id, updateCatCategoriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catCategoriaService.remove(+id);
  }
}
