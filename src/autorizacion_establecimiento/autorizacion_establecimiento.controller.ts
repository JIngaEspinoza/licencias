import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutorizacionEstablecimientoService } from './autorizacion_establecimiento.service';
import { CreateAutorizacionEstablecimientoDto } from './dto/create-autorizacion_establecimiento.dto';
import { UpdateAutorizacionEstablecimientoDto } from './dto/update-autorizacion_establecimiento.dto';

@Controller('autorizacion-establecimiento')
export class AutorizacionEstablecimientoController {
  constructor(private readonly autorizacionEstablecimientoService: AutorizacionEstablecimientoService) {}

  @Post()
  create(@Body() createAutorizacionEstablecimientoDto: CreateAutorizacionEstablecimientoDto) {
    return this.autorizacionEstablecimientoService.create(createAutorizacionEstablecimientoDto);
  }

  @Get()
  findAll() {
    return this.autorizacionEstablecimientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autorizacionEstablecimientoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAutorizacionEstablecimientoDto: UpdateAutorizacionEstablecimientoDto) {
    return this.autorizacionEstablecimientoService.update(+id, updateAutorizacionEstablecimientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.autorizacionEstablecimientoService.remove(+id);
  }
}
