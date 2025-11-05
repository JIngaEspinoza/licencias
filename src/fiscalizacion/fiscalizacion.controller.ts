import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FiscalizacionService } from './fiscalizacion.service';
import { CreateFiscalizacionDto } from './dto/create-fiscalizacion.dto';
import { UpdateFiscalizacionDto } from './dto/update-fiscalizacion.dto';

@Controller('fiscalizacion')
export class FiscalizacionController {
  constructor(private readonly fiscalizacionService: FiscalizacionService) {}

  @Post()
  create(@Body() createFiscalizacionDto: CreateFiscalizacionDto) {
    return this.fiscalizacionService.create(createFiscalizacionDto);
  }

  @Get()
  findAll() {
    return this.fiscalizacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fiscalizacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFiscalizacionDto: UpdateFiscalizacionDto) {
    return this.fiscalizacionService.update(+id, updateFiscalizacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fiscalizacionService.remove(+id);
  }
}
