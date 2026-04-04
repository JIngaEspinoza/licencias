import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatRequisitoService } from './cat_requisito.service';
import { CreateCatRequisitoDto } from './dto/create-cat_requisito.dto';
import { UpdateCatRequisitoDto } from './dto/update-cat_requisito.dto';

@Controller('cat-requisito')
export class CatRequisitoController {
  constructor(private readonly catRequisitoService: CatRequisitoService) {}

  @Post()
  create(@Body() createCatRequisitoDto: CreateCatRequisitoDto) {
    return this.catRequisitoService.create(createCatRequisitoDto);
  }

  @Get()
  findAll() {
    return this.catRequisitoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catRequisitoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatRequisitoDto: UpdateCatRequisitoDto) {
    return this.catRequisitoService.update(+id, updateCatRequisitoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catRequisitoService.remove(+id);
  }
}
