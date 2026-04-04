import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LicenciaFuncionamientoService } from './licencia_funcionamiento.service';
import { CreateLicenciaFuncionamientoDto } from './dto/create-licencia_funcionamiento.dto';
import { UpdateLicenciaFuncionamientoDto } from './dto/update-licencia_funcionamiento.dto';

@Controller('licencia-funcionamiento')
export class LicenciaFuncionamientoController {
  constructor(private readonly licenciaFuncionamientoService: LicenciaFuncionamientoService) {}

  @Post()
  create(@Body() createLicenciaFuncionamientoDto: CreateLicenciaFuncionamientoDto) {
    return this.licenciaFuncionamientoService.create(createLicenciaFuncionamientoDto);
  }

  @Get()
  findAll() {
    return this.licenciaFuncionamientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenciaFuncionamientoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLicenciaFuncionamientoDto: UpdateLicenciaFuncionamientoDto) {
    return this.licenciaFuncionamientoService.update(+id, updateLicenciaFuncionamientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.licenciaFuncionamientoService.remove(+id);
  }
}
