import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutorizacionesTemporalesService } from './autorizaciones_temporales.service';
import { CreateAutorizacionesTemporaleDto } from './dto/create-autorizaciones_temporale.dto';
import { UpdateAutorizacionesTemporaleDto } from './dto/update-autorizaciones_temporale.dto';

@Controller('autorizaciones-temporales')
export class AutorizacionesTemporalesController {
  constructor(private readonly autorizacionesTemporalesService: AutorizacionesTemporalesService) {}

  @Post()
  create(@Body() createAutorizacionesTemporaleDto: CreateAutorizacionesTemporaleDto) {
    return this.autorizacionesTemporalesService.create(createAutorizacionesTemporaleDto);
  }

  @Get()
  async findAll() {
    return this.autorizacionesTemporalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autorizacionesTemporalesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAutorizacionesTemporaleDto: UpdateAutorizacionesTemporaleDto) {
    return this.autorizacionesTemporalesService.update(+id, updateAutorizacionesTemporaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.autorizacionesTemporalesService.remove(+id);
  }

  /*@Get()
  async getVista() {
    return this.autorizacionesTemporalesService.listarVista();
  }*/
}
