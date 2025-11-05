import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutorizacionTemporalService } from './autorizacion_temporal.service';
import { CreateAutorizacionTemporalDto } from './dto/create-autorizacion_temporal.dto';
import { UpdateAutorizacionTemporalDto } from './dto/update-autorizacion_temporal.dto';

@Controller('autorizacion-temporal')
export class AutorizacionTemporalController {
  constructor(private readonly autorizacionTemporalService: AutorizacionTemporalService) {}

  @Post()
  create(@Body() createAutorizacionTemporalDto: CreateAutorizacionTemporalDto) {
    return this.autorizacionTemporalService.create(createAutorizacionTemporalDto);
  }

  @Get()
  findAll() {
    return this.autorizacionTemporalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autorizacionTemporalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAutorizacionTemporalDto: UpdateAutorizacionTemporalDto) {
    return this.autorizacionTemporalService.update(+id, updateAutorizacionTemporalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.autorizacionTemporalService.remove(+id);
  }
}
