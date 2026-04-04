import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventoRequisitoService } from './evento_requisito.service';
import { CreateEventoRequisitoDto } from './dto/create-evento_requisito.dto';
import { UpdateEventoRequisitoDto } from './dto/update-evento_requisito.dto';

@Controller('evento-requisito')
export class EventoRequisitoController {
  constructor(private readonly eventoRequisitoService: EventoRequisitoService) {}

  @Post()
  create(@Body() createEventoRequisitoDto: CreateEventoRequisitoDto) {
    return this.eventoRequisitoService.create(createEventoRequisitoDto);
  }

  @Get()
  findAll() {
    return this.eventoRequisitoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoRequisitoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoRequisitoDto: UpdateEventoRequisitoDto) {
    return this.eventoRequisitoService.update(+id, updateEventoRequisitoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventoRequisitoService.remove(+id);
  }
}
