import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadCatalogoService } from './actividad_catalogo.service';
import { CreateActividadCatalogoDto } from './dto/create-actividad_catalogo.dto';
import { UpdateActividadCatalogoDto } from './dto/update-actividad_catalogo.dto';

@Controller('actividad-catalogo')
export class ActividadCatalogoController {
  constructor(private readonly actividadCatalogoService: ActividadCatalogoService) {}

  @Post()
  create(@Body() createActividadCatalogoDto: CreateActividadCatalogoDto) {
    return this.actividadCatalogoService.create(createActividadCatalogoDto);
  }

  @Get()
  findAll() {
    return this.actividadCatalogoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadCatalogoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActividadCatalogoDto: UpdateActividadCatalogoDto) {
    return this.actividadCatalogoService.update(+id, updateActividadCatalogoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadCatalogoService.remove(+id);
  }
}
