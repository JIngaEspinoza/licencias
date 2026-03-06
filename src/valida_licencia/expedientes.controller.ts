import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ExpedientesService } from "src/expedientes/expedientes.service";

@Controller('public')
export class PublicController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Get('validar/:hash')
  async validarLicencia(@Param('hash') hash: string) {
    console.log(hash);
    const data = await this.expedientesService.buscarPorHash(hash);
    if (!data) {
      throw new NotFoundException('El código de validación no es válido o ha expirado.');
    }
    return data;
  }
}