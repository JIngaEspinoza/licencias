import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventoHorarioService } from './evento_horario.service';
import { CreateEventoHorarioDto } from './dto/create-evento_horario.dto';
import { UpdateEventoHorarioDto } from './dto/update-evento_horario.dto';

@Controller('evento-horario')
export class EventoHorarioController {
  constructor(private readonly eventoHorarioService: EventoHorarioService) {}

  @Post()
  create(@Body() createEventoHorarioDto: CreateEventoHorarioDto) {
    return this.eventoHorarioService.create(createEventoHorarioDto);
  }

  @Get()
  findAll() {
    return this.eventoHorarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoHorarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoHorarioDto: UpdateEventoHorarioDto) {
    return this.eventoHorarioService.update(+id, updateEventoHorarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventoHorarioService.remove(+id);
  }
}
