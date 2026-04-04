import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeclaracionJuradaViaPublicaService } from './declaracion_jurada_via_publica.service';
import { CreateDeclaracionJuradaViaPublicaDto } from './dto/create-declaracion_jurada_via_publica.dto';
import { UpdateDeclaracionJuradaViaPublicaDto } from './dto/update-declaracion_jurada_via_publica.dto';

@Controller('declaracion-jurada-via-publica')
export class DeclaracionJuradaViaPublicaController {
  constructor(private readonly declaracionJuradaViaPublicaService: DeclaracionJuradaViaPublicaService) {}

  @Post()
  create(@Body() createDeclaracionJuradaViaPublicaDto: CreateDeclaracionJuradaViaPublicaDto) {
    return this.declaracionJuradaViaPublicaService.create(createDeclaracionJuradaViaPublicaDto);
  }

  @Get()
  findAll() {
    return this.declaracionJuradaViaPublicaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declaracionJuradaViaPublicaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclaracionJuradaViaPublicaDto: UpdateDeclaracionJuradaViaPublicaDto) {
    return this.declaracionJuradaViaPublicaService.update(+id, updateDeclaracionJuradaViaPublicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declaracionJuradaViaPublicaService.remove(+id);
  }
}
