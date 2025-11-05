import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ZonificacionService } from './zonificacion.service';
import { CreateZonificacionDto } from './dto/create-zonificacion.dto';
import { UpdateZonificacionDto } from './dto/update-zonificacion.dto';
import { FindZonificacionesDto } from './dto/find-zonificaciones.dto';

@Controller('zonificacion')
export class ZonificacionController {
  constructor(private readonly zonificacionService: ZonificacionService) {}

  @Post()
  async create(@Body() createZonificacionDto: CreateZonificacionDto) {
    return this.zonificacionService.create(createZonificacionDto);
  }

  @Get()
  async findAll(@Query() query: FindZonificacionesDto) {
    return this.zonificacionService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.zonificacionService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateZonificacionDto: UpdateZonificacionDto) {
    return this.zonificacionService.update(id, updateZonificacionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.zonificacionService.remove(id);
  }
}
