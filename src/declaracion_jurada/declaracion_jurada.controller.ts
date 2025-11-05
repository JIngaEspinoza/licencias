import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeclaracionJuradaService } from './declaracion_jurada.service';
import { CreateDeclaracionJuradaDto } from './dto/create-declaracion_jurada.dto';
import { UpdateDeclaracionJuradaDto } from './dto/update-declaracion_jurada.dto';

@Controller('declaracion-jurada')
export class DeclaracionJuradaController {
  constructor(private readonly declaracionJuradaService: DeclaracionJuradaService) {}

  @Post()
  create(@Body() createDeclaracionJuradaDto: CreateDeclaracionJuradaDto) {
    return this.declaracionJuradaService.create(createDeclaracionJuradaDto);
  }

  @Get()
  findAll() {
    return this.declaracionJuradaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declaracionJuradaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclaracionJuradaDto: UpdateDeclaracionJuradaDto) {
    return this.declaracionJuradaService.update(+id, updateDeclaracionJuradaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declaracionJuradaService.remove(+id);
  }
}
