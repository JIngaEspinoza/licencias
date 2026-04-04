import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeclaracionJuradaGiroService } from './declaracion_jurada_giro.service';
import { CreateDeclaracionJuradaGiroDto } from './dto/create-declaracion_jurada_giro.dto';
import { UpdateDeclaracionJuradaGiroDto } from './dto/update-declaracion_jurada_giro.dto';

@Controller('declaracion-jurada-giro')
export class DeclaracionJuradaGiroController {
  constructor(private readonly declaracionJuradaGiroService: DeclaracionJuradaGiroService) {}

  @Post()
  create(@Body() createDeclaracionJuradaGiroDto: CreateDeclaracionJuradaGiroDto) {
    return this.declaracionJuradaGiroService.create(createDeclaracionJuradaGiroDto);
  }

  @Get()
  findAll() {
    return this.declaracionJuradaGiroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declaracionJuradaGiroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclaracionJuradaGiroDto: UpdateDeclaracionJuradaGiroDto) {
    return this.declaracionJuradaGiroService.update(+id, updateDeclaracionJuradaGiroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declaracionJuradaGiroService.remove(+id);
  }
}
