import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequisitoAutorizacionService } from './requisito_autorizacion.service';
import { CreateRequisitoAutorizacionDto } from './dto/create-requisito_autorizacion.dto';
import { UpdateRequisitoAutorizacionDto } from './dto/update-requisito_autorizacion.dto';

@Controller('requisito-autorizacion')
export class RequisitoAutorizacionController {
  constructor(private readonly requisitoAutorizacionService: RequisitoAutorizacionService) {}

  @Post()
  create(@Body() createRequisitoAutorizacionDto: CreateRequisitoAutorizacionDto) {
    return this.requisitoAutorizacionService.create(createRequisitoAutorizacionDto);
  }

  @Get()
  findAll() {
    return this.requisitoAutorizacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitoAutorizacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisitoAutorizacionDto: UpdateRequisitoAutorizacionDto) {
    return this.requisitoAutorizacionService.update(+id, updateRequisitoAutorizacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitoAutorizacionService.remove(+id);
  }
}
