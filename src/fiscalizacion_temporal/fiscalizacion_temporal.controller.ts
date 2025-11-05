import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FiscalizacionTemporalService } from './fiscalizacion_temporal.service';
import { CreateFiscalizacionTemporalDto } from './dto/create-fiscalizacion_temporal.dto';
import { UpdateFiscalizacionTemporalDto } from './dto/update-fiscalizacion_temporal.dto';

@Controller('fiscalizacion-temporal')
export class FiscalizacionTemporalController {
  constructor(private readonly fiscalizacionTemporalService: FiscalizacionTemporalService) {}

  @Post()
  create(@Body() createFiscalizacionTemporalDto: CreateFiscalizacionTemporalDto) {
    return this.fiscalizacionTemporalService.create(createFiscalizacionTemporalDto);
  }

  @Get()
  findAll() {
    return this.fiscalizacionTemporalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiscalizacionTemporalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFiscalizacionTemporalDto: UpdateFiscalizacionTemporalDto) {
    return this.fiscalizacionTemporalService.update(+id, updateFiscalizacionTemporalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiscalizacionTemporalService.remove(+id);
  }
}
