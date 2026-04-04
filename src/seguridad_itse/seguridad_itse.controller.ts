import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeguridadItseService } from './seguridad_itse.service';
import { CreateSeguridadItseDto } from './dto/create-seguridad_itse.dto';
import { UpdateSeguridadItseDto } from './dto/update-seguridad_itse.dto';

@Controller('seguridad-itse')
export class SeguridadItseController {
  constructor(private readonly seguridadItseService: SeguridadItseService) {}

  @Post()
  create(@Body() createSeguridadItseDto: CreateSeguridadItseDto) {
    return this.seguridadItseService.create(createSeguridadItseDto);
  }

  @Get()
  findAll() {
    return this.seguridadItseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seguridadItseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeguridadItseDto: UpdateSeguridadItseDto) {
    return this.seguridadItseService.update(+id, updateSeguridadItseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seguridadItseService.remove(+id);
  }
}
