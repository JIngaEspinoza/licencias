import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvaluacionTecnicaService } from './evaluacion_tecnica.service';
import { CreateEvaluacionTecnicaDto } from './dto/create-evaluacion_tecnica.dto';
import { UpdateEvaluacionTecnicaDto } from './dto/update-evaluacion_tecnica.dto';

@Controller('evaluacion-tecnica')
export class EvaluacionTecnicaController {
  constructor(private readonly evaluacionTecnicaService: EvaluacionTecnicaService) {}

  @Post()
  create(@Body() createEvaluacionTecnicaDto: CreateEvaluacionTecnicaDto) {
    return this.evaluacionTecnicaService.create(createEvaluacionTecnicaDto);
  }

  @Get()
  findAll() {
    return this.evaluacionTecnicaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluacionTecnicaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvaluacionTecnicaDto: UpdateEvaluacionTecnicaDto) {
    return this.evaluacionTecnicaService.update(+id, updateEvaluacionTecnicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluacionTecnicaService.remove(+id);
  }
}
