import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GiroService } from './giro.service';
import { CreateGiroDto } from './dto/create-giro.dto';
import { UpdateGiroDto } from './dto/update-giro.dto';
import { FindGirosDto } from './dto/find-giro.dto';

@Controller('giro')
export class GiroController {
  constructor(private readonly giroService: GiroService) {}

  @Post()
  create(@Body() createGiroDto: CreateGiroDto) {
    return this.giroService.create(createGiroDto);
  }

  @Get()
  findAll(@Query() query: FindGirosDto) {
    return this.giroService.findAll(query);
  }

  @Get('list')
  async findAllWithoutPagination() {
    return this.giroService.findAllWithoutPagination();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.giroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGiroDto: UpdateGiroDto) {
    return this.giroService.update(+id, updateGiroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giroService.remove(+id);
  }

}
