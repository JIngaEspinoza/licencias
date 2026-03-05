import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { TramiteService } from './tramite.service';

@Controller('modules/tramite')
export class TramiteController {
  constructor(private readonly tramiteService: TramiteService) {}

  @Get(':numero')
  @HttpCode(HttpStatus.OK)
  async getHistorial(@Param('numero') numero: string) {
    // Aquí llamamos al método que devuelve el arreglo de registros
    const datos = await this.tramiteService.obtenerExpediente(numero);
    
    // Devolvemos un objeto estandarizado (buena práctica para React)
    return {
      success: true,
      data: datos,
      total: datos.length
    };
  }
}
