import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeclaracionVigenciaPoderService } from './declaracion_vigencia_poder.service';
import { CreateDeclaracionVigenciaPoderDto } from './dto/create-declaracion_vigencia_poder.dto';
import { UpdateDeclaracionVigenciaPoderDto } from './dto/update-declaracion_vigencia_poder.dto';

@Controller('declaracion-vigencia-poder')
export class DeclaracionVigenciaPoderController {
  constructor(private readonly declaracionVigenciaPoderService: DeclaracionVigenciaPoderService) {}

  @Post()
  create(@Body() createDeclaracionVigenciaPoderDto: CreateDeclaracionVigenciaPoderDto) {
    return this.declaracionVigenciaPoderService.create(createDeclaracionVigenciaPoderDto);
  }

  @Get()
  findAll() {
    return this.declaracionVigenciaPoderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declaracionVigenciaPoderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeclaracionVigenciaPoderDto: UpdateDeclaracionVigenciaPoderDto) {
    return this.declaracionVigenciaPoderService.update(+id, updateDeclaracionVigenciaPoderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.declaracionVigenciaPoderService.remove(+id);
  }
}
