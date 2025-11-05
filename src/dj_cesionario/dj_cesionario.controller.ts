import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DjCesionarioService } from './dj_cesionario.service';
import { CreateDjCesionarioDto } from './dto/create-dj_cesionario.dto';
import { UpdateDjCesionarioDto } from './dto/update-dj_cesionario.dto';

@Controller('dj-cesionario')
export class DjCesionarioController {
  constructor(private readonly djCesionarioService: DjCesionarioService) {}

  @Post()
  create(@Body() createDjCesionarioDto: CreateDjCesionarioDto) {
    return this.djCesionarioService.create(createDjCesionarioDto);
  }

  @Get()
  findAll() {
    return this.djCesionarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.djCesionarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDjCesionarioDto: UpdateDjCesionarioDto) {
    return this.djCesionarioService.update(+id, updateDjCesionarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.djCesionarioService.remove(+id);
  }
}
