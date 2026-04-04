import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DjConstanciasService } from './dj_constancias.service';
import { CreateDjConstanciaDto } from './dto/create-dj_constancia.dto';
import { UpdateDjConstanciaDto } from './dto/update-dj_constancia.dto';

@Controller('dj-constancias')
export class DjConstanciasController {
  constructor(private readonly djConstanciasService: DjConstanciasService) {}

  @Post()
  create(@Body() createDjConstanciaDto: CreateDjConstanciaDto) {
    return this.djConstanciasService.create(createDjConstanciaDto);
  }

  @Get()
  findAll() {
    return this.djConstanciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.djConstanciasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDjConstanciaDto: UpdateDjConstanciaDto) {
    return this.djConstanciasService.update(+id, updateDjConstanciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.djConstanciasService.remove(+id);
  }
}
