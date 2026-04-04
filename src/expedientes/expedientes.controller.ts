import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseInterceptors, UploadedFile, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { FindExpedientesDto } from './dto/find-expedientes.dto';
//import { NuevaDJTransaccionalRequest } from './dto/nueva-dj-transaccional.request';
import type { NuevaDJTransaccionalRequest } from './dto/nueva-dj-transaccional.request';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('expedientes')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Get(':id/pdfResolucion')
  async generarPdf(@Param('id') id: string, @Res() res: Response) {
    console.log("Controller=>", id);
    return this.expedientesService.generarPdfResolucion(Number(id), res);
  }

  @Get(':id/pdfddjj')
  async generarPdfddjj(@Param('id') id: string, @Res() res: Response) {
    const pdfBytes = await this.expedientesService.generaPdfddjj(Number(id));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=ddjj.pdf',
      'Content-Length': pdfBytes.length,
    });
    
    res.send(Buffer.from(pdfBytes));
  }

  @Get(':id/pdfCarton')
  async generarPdfCarton(@Param('id') id: string, @Res() res: Response) {
    console.log("Controller=>", id);
    return this.expedientesService.generarPdfCarton(Number(id), res);
  }  

  /*@Post('guardar-solicitud')
  async guardarSolicitudDDJJ(@Body() payload: any) {
    return await this.expedientesService.guardarSolicitudDDJJ(payload);
  }*/
  @Post('guardar-solicitud')
  @UseInterceptors(FileInterceptor('archivo_mc', {
    storage: diskStorage({
      //destination: './uploads/expedientes', // Asegúrate de crear esta carpeta
      destination: (req, file, callback) => {
        const uploadPath = join(process.cwd(), 'uploads', 'expedientes');
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `MC-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async guardarSolicitudDDJJ(
    @UploadedFile() file: Express.Multer.File, 
    @Body('json_data') jsonData: string,
    @GetUser() user: any
  ) {
    const data = JSON.parse(jsonData); // Lo convertimos a objeto
    
    // Si hay un archivo, guardamos el nombre generado en el objeto de la declaración
    if (file) {
      data.declaracion.archivo_aut_ministerio_cultura = file.filename;
    }

    return await this.expedientesService.guardarSolicitudDDJJ(data, user);
  }

  @Patch('riesgo/:id')
  @UseInterceptors(
    FileInterceptor('archivo_pdf', {
      storage: diskStorage({
        destination: './uploads/itse',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async actualizarRiesgo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any
  ) {
    const filePath = file ? file.path : null;
    return await this.expedientesService.actualizarRiesgoItse(id, body, user, filePath);
  }


  @Post('generar-resolucion')
  async generarResolucion(@Body() payload: any) {
    return await this.expedientesService.generarResolucion(payload);
  }

  @Post()
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedientesService.create(createExpedienteDto);
  }

  @Get()
  //@UseGuards(JwtAuthGuard)
  findAll(@Query() query: FindExpedientesDto, @Req() req: any) {
    console.log(req.user);
    return this.expedientesService.findAll(query, req.user);
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

  // Estadísticas
  @Get('stats/dashboard')
  async getDashboardStats() {
    return await this.expedientesService.obtenerKpisDashboard();
  }

  @Get('stats/recent')
  async getDashboardRecent() {
    return await this.expedientesService.obtenerActividadReciente();
  }

  @Get('stats/chart')
  async getDashboardChart() {
    return await this.expedientesService.obtenerDatosGrafico();
  }

}
