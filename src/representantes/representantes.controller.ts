import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { RepresentantesService } from './representantes.service';
import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { FindRepresentantesDto } from './dto/find-representantes.dto';

@Controller('representantes')
export class RepresentantesController {
  constructor(private readonly representantesService: RepresentantesService) {}

  @Post()
  create(@Body() createRepresentanteDto: CreateRepresentanteDto) {
    return this.representantesService.create(createRepresentanteDto);
  }

  @Get()
  findAll(@Query() query: FindRepresentantesDto) {
    return this.representantesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.representantesService.findOne(+id);
  }

  @Get('persona/:id_persona')
  findManyByPersona(@Param('id_persona', ParseIntPipe) id_persona: string) {
    return this.representantesService.findManyByPersona(+id_persona);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepresentanteDto: UpdateRepresentanteDto) {
    return this.representantesService.update(+id, updateRepresentanteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.representantesService.remove(+id);
  }
}
