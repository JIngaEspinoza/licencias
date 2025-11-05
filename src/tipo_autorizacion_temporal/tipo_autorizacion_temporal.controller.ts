import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoAutorizacionTemporalService } from './tipo_autorizacion_temporal.service';
import { CreateTipoAutorizacionTemporalDto } from './dto/create-tipo_autorizacion_temporal.dto';
import { UpdateTipoAutorizacionTemporalDto } from './dto/update-tipo_autorizacion_temporal.dto';

@Controller('tipo-autorizacion-temporal')
export class TipoAutorizacionTemporalController {
  constructor(private readonly tipoAutorizacionTemporalService: TipoAutorizacionTemporalService) {}

  @Post()
  create(@Body() createTipoAutorizacionTemporalDto: CreateTipoAutorizacionTemporalDto) {
    return this.tipoAutorizacionTemporalService.create(createTipoAutorizacionTemporalDto);
  }

  @Get()
  findAll() {
    return this.tipoAutorizacionTemporalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoAutorizacionTemporalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoAutorizacionTemporalDto: UpdateTipoAutorizacionTemporalDto) {
    return this.tipoAutorizacionTemporalService.update(+id, updateTipoAutorizacionTemporalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoAutorizacionTemporalService.remove(+id);
  }
}
