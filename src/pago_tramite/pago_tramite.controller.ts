import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagoTramiteService } from './pago_tramite.service';
import { CreatePagoTramiteDto } from './dto/create-pago_tramite.dto';
import { UpdatePagoTramiteDto } from './dto/update-pago_tramite.dto';

@Controller('pago-tramite')
export class PagoTramiteController {
  constructor(private readonly pagoTramiteService: PagoTramiteService) {}

  @Post()
  create(@Body() createPagoTramiteDto: CreatePagoTramiteDto) {
    return this.pagoTramiteService.create(createPagoTramiteDto);
  }

  @Get()
  findAll() {
    return this.pagoTramiteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagoTramiteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoTramiteDto: UpdatePagoTramiteDto) {
    return this.pagoTramiteService.update(+id, updatePagoTramiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagoTramiteService.remove(+id);
  }
}
