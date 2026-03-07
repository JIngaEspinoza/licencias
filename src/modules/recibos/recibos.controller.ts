import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { RecibosService } from './recibos.service';

@Controller('modules/recibos')
export class RecibosController {
  constructor(private readonly recibosService: RecibosService) {}

  @Get(':nrorecibo')
  @HttpCode(HttpStatus.OK)
  async getBuscarRecibos(@Param('nrorecibo') nrorecibo: string) {
    const resultado = await this.recibosService.buscarRecibos(nrorecibo);

    return {
      ...resultado,
      total: resultado.data ? resultado.data.length : 0
    }
  }
}
