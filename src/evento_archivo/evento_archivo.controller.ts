import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventoArchivoService } from './evento_archivo.service';
import { CreateEventoArchivoDto } from './dto/create-evento_archivo.dto';
import { UpdateEventoArchivoDto } from './dto/update-evento_archivo.dto';

@Controller('evento-archivo')
export class EventoArchivoController {
  constructor(private readonly eventoArchivoService: EventoArchivoService) {}

  @Post()
  create(@Body() createEventoArchivoDto: CreateEventoArchivoDto) {
    return this.eventoArchivoService.create(createEventoArchivoDto);
  }

  @Get()
  findAll() {
    return this.eventoArchivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoArchivoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoArchivoDto: UpdateEventoArchivoDto) {
    return this.eventoArchivoService.update(+id, updateEventoArchivoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventoArchivoService.remove(+id);
  }
}
