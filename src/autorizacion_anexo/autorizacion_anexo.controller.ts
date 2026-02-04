import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutorizacionAnexoService } from './autorizacion_anexo.service';
import { CreateAutorizacionAnexoDto } from './dto/create-autorizacion_anexo.dto';
import { UpdateAutorizacionAnexoDto } from './dto/update-autorizacion_anexo.dto';

@Controller('autorizacion-anexo')
export class AutorizacionAnexoController {
  constructor(private readonly autorizacionAnexoService: AutorizacionAnexoService) {}

  @Post()
  create(@Body() createAutorizacionAnexoDto: CreateAutorizacionAnexoDto) {
    return this.autorizacionAnexoService.create(createAutorizacionAnexoDto);
  }

  @Get()
  findAll() {
    console.log('--- Endpoint findAll de autorizacionAnexoService llamado ---');
    return this.autorizacionAnexoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autorizacionAnexoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAutorizacionAnexoDto: UpdateAutorizacionAnexoDto) {
    return this.autorizacionAnexoService.update(+id, updateAutorizacionAnexoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.autorizacionAnexoService.remove(+id);
  }
}
