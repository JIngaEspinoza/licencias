import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GiroZonificacionService } from './giro_zonificacion.service';
import { CreateGiroZonificacionDto } from './dto/create-giro_zonificacion.dto';
import { UpdateGiroZonificacionDto } from './dto/update-giro_zonificacion.dto';
import { FindGirosZonificacionesDto } from './dto/find-giro-zonificacion.dto';

@Controller('giro-zonificacion')
export class GiroZonificacionController {
  constructor(private readonly giroZonificacionService: GiroZonificacionService) {}

  @Post()
  async create(@Body() createGiroZonificacionDto: CreateGiroZonificacionDto) {
    return this.giroZonificacionService.create(createGiroZonificacionDto);
  }

  @Get()
  async findAll(@Query() query: FindGirosZonificacionesDto) {
    return this.giroZonificacionService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, id2: string) {
    return this.giroZonificacionService.findOne(+id, +id2);
  }

  @Patch(':id')
  async update(@Param('id') id: string, id2: string, @Body() updateGiroZonificacionDto: UpdateGiroZonificacionDto) {
    return this.giroZonificacionService.update(+id, +id2,  updateGiroZonificacionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, id2: string) {
    return this.giroZonificacionService.remove(+id, +id2);
  }
}
