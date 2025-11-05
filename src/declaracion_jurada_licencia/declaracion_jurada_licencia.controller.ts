import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeclaracionJuradaLicenciaService } from './declaracion_jurada_licencia.service';
import { CreateDeclaracionJuradaLicenciaDto } from './dto/create-declaracion_jurada_licencia.dto';
import { UpdateDeclaracionJuradaLicenciaDto } from './dto/update-declaracion_jurada_licencia.dto';

@Controller('declaracion-jurada-licencia')
export class DeclaracionJuradaLicenciaController {
  constructor(private readonly declaracionJuradaLicenciaService: DeclaracionJuradaLicenciaService) {}

  @Post()
  create(@Body() createDeclaracionJuradaLicenciaDto: CreateDeclaracionJuradaLicenciaDto) {
    return this.declaracionJuradaLicenciaService.create(createDeclaracionJuradaLicenciaDto);
  }

  @Get()
  findAll() {
    return this.declaracionJuradaLicenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declaracionJuradaLicenciaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclaracionJuradaLicenciaDto: UpdateDeclaracionJuradaLicenciaDto) {
    return this.declaracionJuradaLicenciaService.update(+id, updateDeclaracionJuradaLicenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declaracionJuradaLicenciaService.remove(+id);
  }
}
