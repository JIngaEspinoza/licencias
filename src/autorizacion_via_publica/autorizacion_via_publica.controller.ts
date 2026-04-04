import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AutorizacionViaPublicaService } from './autorizacion_via_publica.service';
import { CreateAutorizacionViaPublicaDto } from './dto/create-autorizacion_via_publica.dto';
import { UpdateAutorizacionViaPublicaDto } from './dto/update-autorizacion_via_publica.dto';
import { FindAutorizacionViaPublicaDto } from './dto/find-autorizacion_via_publica.dto';

@Controller('autorizacion-via-publica')
export class AutorizacionViaPublicaController {
  constructor(private readonly autorizacionViaPublicaService: AutorizacionViaPublicaService) {}

  @Post()
  create(@Body() createAutorizacionViaPublicaDto: CreateAutorizacionViaPublicaDto) {
    return this.autorizacionViaPublicaService.create(createAutorizacionViaPublicaDto);
  }

  @Get()
  findAll(@Query() query: FindAutorizacionViaPublicaDto) {
    return this.autorizacionViaPublicaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autorizacionViaPublicaService.findOne(+id);
  }

  /*@Patch(':id')
  update(@Param('id') id: string, @Body() updateAutorizacionViaPublicaDto: UpdateAutorizacionViaPublicaDto) {
    return this.autorizacionViaPublicaService.update(+id, updateAutorizacionViaPublicaDto);
  }*/

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.autorizacionViaPublicaService.remove(+id);
  }
}
