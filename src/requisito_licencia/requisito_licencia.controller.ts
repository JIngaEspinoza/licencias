import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequisitoLicenciaService } from './requisito_licencia.service';
import { CreateRequisitoLicenciaDto } from './dto/create-requisito_licencia.dto';
import { UpdateRequisitoLicenciaDto } from './dto/update-requisito_licencia.dto';

@Controller('requisito-licencia')
export class RequisitoLicenciaController {
  constructor(private readonly requisitoLicenciaService: RequisitoLicenciaService) {}

  @Post()
  create(@Body() createRequisitoLicenciaDto: CreateRequisitoLicenciaDto) {
    return this.requisitoLicenciaService.create(createRequisitoLicenciaDto);
  }

  @Get()
  findAll() {
    return this.requisitoLicenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitoLicenciaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisitoLicenciaDto: UpdateRequisitoLicenciaDto) {
    return this.requisitoLicenciaService.update(+id, updateRequisitoLicenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitoLicenciaService.remove(+id);
  }
}
