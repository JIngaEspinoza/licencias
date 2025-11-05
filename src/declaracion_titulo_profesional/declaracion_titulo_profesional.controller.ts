import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeclaracionTituloProfesionalService } from './declaracion_titulo_profesional.service';
import { CreateDeclaracionTituloProfesionalDto } from './dto/create-declaracion_titulo_profesional.dto';
import { UpdateDeclaracionTituloProfesionalDto } from './dto/update-declaracion_titulo_profesional.dto';

@Controller('declaracion-titulo-profesional')
export class DeclaracionTituloProfesionalController {
  constructor(private readonly declaracionTituloProfesionalService: DeclaracionTituloProfesionalService) {}

  @Post()
  create(@Body() createDeclaracionTituloProfesionalDto: CreateDeclaracionTituloProfesionalDto) {
    return this.declaracionTituloProfesionalService.create(createDeclaracionTituloProfesionalDto);
  }

  @Get()
  findAll() {
    return this.declaracionTituloProfesionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declaracionTituloProfesionalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclaracionTituloProfesionalDto: UpdateDeclaracionTituloProfesionalDto) {
    return this.declaracionTituloProfesionalService.update(+id, updateDeclaracionTituloProfesionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declaracionTituloProfesionalService.remove(+id);
  }
}
