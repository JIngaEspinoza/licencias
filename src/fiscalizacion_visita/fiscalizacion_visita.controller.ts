import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FiscalizacionVisitaService } from './fiscalizacion_visita.service';
import { CreateFiscalizacionVisitaDto } from './dto/create-fiscalizacion_visita.dto';
import { UpdateFiscalizacionVisitaDto } from './dto/update-fiscalizacion_visita.dto';

@Controller('fiscalizacion-visita')
export class FiscalizacionVisitaController {
  constructor(private readonly fiscalizacionVisitaService: FiscalizacionVisitaService) {}

  @Post()
  create(@Body() createFiscalizacionVisitaDto: CreateFiscalizacionVisitaDto) {
    return this.fiscalizacionVisitaService.create(createFiscalizacionVisitaDto);
  }

  @Get()
  findAll() {
    return this.fiscalizacionVisitaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiscalizacionVisitaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFiscalizacionVisitaDto: UpdateFiscalizacionVisitaDto) {
    return this.fiscalizacionVisitaService.update(+id, updateFiscalizacionVisitaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiscalizacionVisitaService.remove(+id);
  }
}
