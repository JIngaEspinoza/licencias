import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpedienteLicenciaService } from './expediente_licencia.service';
import { CreateExpedienteLicenciaDto } from './dto/create-expediente_licencia.dto';
import { UpdateExpedienteLicenciaDto } from './dto/update-expediente_licencia.dto';

@Controller('expediente-licencia')
export class ExpedienteLicenciaController {
  constructor(private readonly expedienteLicenciaService: ExpedienteLicenciaService) {}

  @Post()
  create(@Body() createExpedienteLicenciaDto: CreateExpedienteLicenciaDto) {
    return this.expedienteLicenciaService.create(createExpedienteLicenciaDto);
  }

  @Get()
  findAll() {
    return this.expedienteLicenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expedienteLicenciaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpedienteLicenciaDto: UpdateExpedienteLicenciaDto) {
    return this.expedienteLicenciaService.update(+id, updateExpedienteLicenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expedienteLicenciaService.remove(+id);
  }
}
