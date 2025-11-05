import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FiscalizacionAutorizacionService } from './fiscalizacion_autorizacion.service';
import { CreateFiscalizacionAutorizacionDto } from './dto/create-fiscalizacion_autorizacion.dto';
import { UpdateFiscalizacionAutorizacionDto } from './dto/update-fiscalizacion_autorizacion.dto';

@Controller('fiscalizacion-autorizacion')
export class FiscalizacionAutorizacionController {
  constructor(private readonly fiscalizacionAutorizacionService: FiscalizacionAutorizacionService) {}

  @Post()
  create(@Body() createFiscalizacionAutorizacionDto: CreateFiscalizacionAutorizacionDto) {
    return this.fiscalizacionAutorizacionService.create(createFiscalizacionAutorizacionDto);
  }

  @Get()
  findAll() {
    return this.fiscalizacionAutorizacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiscalizacionAutorizacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFiscalizacionAutorizacionDto: UpdateFiscalizacionAutorizacionDto) {
    return this.fiscalizacionAutorizacionService.update(+id, updateFiscalizacionAutorizacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiscalizacionAutorizacionService.remove(+id);
  }
}
