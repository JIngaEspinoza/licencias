import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { FindExpedientesDto } from './dto/find-expedientes.dto';
//import { NuevaDJTransaccionalRequest } from './dto/nueva-dj-transaccional.request';
import type { NuevaDJTransaccionalRequest } from './dto/nueva-dj-transaccional.request';
import type { Response } from 'express';

@Controller('expedientes')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Get(':id/pdf')
  async generarPdf(@Param('id') id: string, @Res() res: Response) {
    console.log("Controller=>", id);
    return this.expedientesService.generarPdf(Number(id), res);
  }

  @Get(':id/pdfCarton')
  async generarPdfCarton(@Param('id') id: string, @Res() res: Response) {
    console.log("Controller=>", id);
    return this.expedientesService.generarPdfCarton(Number(id), res);
  }

  @Post()
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedientesService.create(createExpedienteDto);
  }

  @Get()
  findAll(@Query() query: FindExpedientesDto) {
    return this.expedientesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expedientesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedientesService.update(+id, updateExpedienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expedientesService.remove(+id);
  }

  @Post('nueva-dj/full')
  async creaNuevaDjFull(
    @Body() payload: NuevaDJTransaccionalRequest,
  ): Promise<{ok: boolean; id_expediente?: number}> {
    const id = await this.expedientesService.crearDemo(payload);
    return { ok: true, id_expediente: id };
  }



}
