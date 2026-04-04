import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequisitoAutorizacionTemporalService } from './requisito_autorizacion_temporal.service';
import { CreateRequisitoAutorizacionTemporalDto } from './dto/create-requisito_autorizacion_temporal.dto';
import { UpdateRequisitoAutorizacionTemporalDto } from './dto/update-requisito_autorizacion_temporal.dto';

@Controller('requisito-autorizacion-temporal')
export class RequisitoAutorizacionTemporalController {
  constructor(private readonly requisitoAutorizacionTemporalService: RequisitoAutorizacionTemporalService) {}

  @Post()
  create(@Body() createRequisitoAutorizacionTemporalDto: CreateRequisitoAutorizacionTemporalDto) {
    return this.requisitoAutorizacionTemporalService.create(createRequisitoAutorizacionTemporalDto);
  }

  @Get()
  findAll() {
    return this.requisitoAutorizacionTemporalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitoAutorizacionTemporalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisitoAutorizacionTemporalDto: UpdateRequisitoAutorizacionTemporalDto) {
    return this.requisitoAutorizacionTemporalService.update(+id, updateRequisitoAutorizacionTemporalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitoAutorizacionTemporalService.remove(+id);
  }
}
