import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedioVentaService } from './medio_venta.service';
import { CreateMedioVentaDto } from './dto/create-medio_venta.dto';
import { UpdateMedioVentaDto } from './dto/update-medio_venta.dto';

@Controller('medio-venta')
export class MedioVentaController {
  constructor(private readonly medioVentaService: MedioVentaService) {}

  @Post()
  create(@Body() createMedioVentaDto: CreateMedioVentaDto) {
    return this.medioVentaService.create(createMedioVentaDto);
  }

  @Get()
  findAll() {
    return this.medioVentaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medioVentaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedioVentaDto: UpdateMedioVentaDto) {
    return this.medioVentaService.update(+id, updateMedioVentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medioVentaService.remove(+id);
  }
}
