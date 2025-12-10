import { Controller, Get, Post, Body, Patch, Param, Delete, Query, InternalServerErrorException } from '@nestjs/common';
import { GiroZonificacionService } from './giro_zonificacion.service';
import { CreateGiroZonificacionDto } from './dto/create-giro_zonificacion.dto';
import { UpdateGiroZonificacionDto } from './dto/update-giro_zonificacion.dto';
import { FindGirosZonificacionesDto } from './dto/find-giro-zonificacion.dto';
import { MatrixResponse } from './interfaces/matrix-response.interface';

@Controller('giro-zonificacion')
export class GiroZonificacionController {
  constructor(private readonly giroZonificacionService: GiroZonificacionService) {}

  @Post()
  async create(@Body() createGiroZonificacionDto: CreateGiroZonificacionDto) {
    return this.giroZonificacionService.create(createGiroZonificacionDto);
  }

  @Get()
  async findAll(@Query() query: FindGirosZonificacionesDto) {
    return this.giroZonificacionService.findAll(query);
  }

  /*@Get(':id')
  async findByCodigo(@Param('id') id: string) {
    return this.giroZonificacionService.findByCodigo(+id);
  }*/

  /*@Get(':id')
  async findOne(@Param('id') id: string, id2: string) {
    return this.giroZonificacionService.findOne(+id, +id2);
  }*/

  @Patch(':id')
  async update(@Param('id') id: string, id2: string, @Body() updateGiroZonificacionDto: UpdateGiroZonificacionDto) {
    return this.giroZonificacionService.update(+id, +id2,  updateGiroZonificacionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, id2: string) {
    return this.giroZonificacionService.remove(+id, +id2);
  }

  /**
   * GET /api/giro-zonificacion/matrix
   * Obtiene todos los datos iniciales para cargar la tabla de asignación.
   */
  /*@Get('matrix')
  async getMatrixViewData() {
    try {
      const data = await this.giroZonificacionService.getMatrixViewData();
      return data;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Error al obtener datos de la matriz de usos.");
    }
  }*/

  @Get('matrix')
  async getMatrixViewData(@Query() query: FindGirosZonificacionesDto): Promise<MatrixResponse> {
    // Llama al nuevo método del servicio para obtener la matriz paginada
    return this.giroZonificacionService.getMatrixViewData(query);
  }

  /**
   * PATCH /api/giro-zonificacion/asignacion
   * Endpoint llamado por el Input.onBlur para guardar un solo cambio.
   * Body: { id_giro: 101, id_zonificacion: 1, codigo: 'C' }
   */
  public async updateAsignacion(req: any, res: any) {
    const { id_giro, id_zonificacion, codigo } = req.body;
    
    if (!id_giro || !id_zonificacion) {
      return res.status(400).json({ message: "Faltan ID de Giro o Zonificación." });
    }

    try {
      // Llamamos a la lógica de negocio en el servicio
      const result = await this.giroZonificacionService.updateAsignacion(
        Number(id_giro), 
        Number(id_zonificacion), 
        codigo
      );
      
      res.status(200).json({ 
        success: true, 
        message: "Asignación actualizada/creada correctamente.",
        data: result
      });
        
    } catch (error: any) {
      console.error("Error al actualizar asignación:", error.message);
      
      // Manejo de errores específicos del servicio
      if (error.message.includes("inválido")) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error interno al guardar la asignación." });
    }
  }



}
