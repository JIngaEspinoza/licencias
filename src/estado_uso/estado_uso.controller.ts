import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EstadoUsoService } from './estado_uso.service';
import { CreateEstadoUsoDto } from './dto/create-estado_uso.dto';
import { UpdateEstadoUsoDto } from './dto/update-estado_uso.dto';
import { FindUsosDto } from './dto/find-estado_uso.dto';

@Controller('estado-uso')
export class EstadoUsoController {
  constructor(private readonly estadoUsoService: EstadoUsoService) {}

  @Post()
  create(@Body() createEstadoUsoDto: CreateEstadoUsoDto) {
    return this.estadoUsoService.create(createEstadoUsoDto);
  }

  @Get()
  async findAll(@Query() query: FindUsosDto) {
    return this.estadoUsoService.findAll(query);
  }

  @Get('list')
  async findAllWithoutPagination() {
    return this.estadoUsoService.findAllWithoutPagination();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoUsoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstadoUsoDto: UpdateEstadoUsoDto) {
    return this.estadoUsoService.update(id, updateEstadoUsoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadoUsoService.remove(id)
  }
}
