import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DjActividadesService } from './dj_actividades.service';
import { CreateDjActividadeDto } from './dto/create-dj_actividade.dto';
import { UpdateDjActividadeDto } from './dto/update-dj_actividade.dto';

@Controller('dj-actividades')
export class DjActividadesController {
  constructor(private readonly djActividadesService: DjActividadesService) {}

  @Post()
  create(@Body() createDjActividadeDto: CreateDjActividadeDto) {
    return this.djActividadesService.create(createDjActividadeDto);
  }

  @Get()
  findAll() {
    return this.djActividadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.djActividadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDjActividadeDto: UpdateDjActividadeDto) {
    return this.djActividadesService.update(+id, updateDjActividadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.djActividadesService.remove(+id);
  }
}
