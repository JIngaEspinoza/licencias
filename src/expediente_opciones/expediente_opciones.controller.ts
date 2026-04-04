import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpedienteOpcionesService } from './expediente_opciones.service';
import { CreateExpedienteOpcioneDto } from './dto/create-expediente_opcione.dto';
import { UpdateExpedienteOpcioneDto } from './dto/update-expediente_opcione.dto';

@Controller('expediente-opciones')
export class ExpedienteOpcionesController {
  constructor(private readonly expedienteOpcionesService: ExpedienteOpcionesService) {}

  @Post()
  create(@Body() createExpedienteOpcioneDto: CreateExpedienteOpcioneDto) {
    return this.expedienteOpcionesService.create(createExpedienteOpcioneDto);
  }

  @Get()
  findAll() {
    return this.expedienteOpcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expedienteOpcionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpedienteOpcioneDto: UpdateExpedienteOpcioneDto) {
    return this.expedienteOpcionesService.update(+id, updateExpedienteOpcioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expedienteOpcionesService.remove(+id);
  }
}
