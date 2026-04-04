import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatTipoService } from './cat_tipo.service';
import { CreateCatTipoDto } from './dto/create-cat_tipo.dto';
import { UpdateCatTipoDto } from './dto/update-cat_tipo.dto';

@Controller('cat-tipo')
export class CatTipoController {
  constructor(private readonly catTipoService: CatTipoService) {}

  @Post()
  create(@Body() createCatTipoDto: CreateCatTipoDto) {
    return this.catTipoService.create(createCatTipoDto);
  }

  @Get()
  findAll() {
    return this.catTipoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catTipoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatTipoDto: UpdateCatTipoDto) {
    return this.catTipoService.update(+id, updateCatTipoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catTipoService.remove(+id);
  }
}
