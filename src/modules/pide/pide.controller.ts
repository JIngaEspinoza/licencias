import { Controller, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { PideService } from './pide.service';
import { ConsultaDniDto } from './dto/consulta-dni.dto';
import { ConsultaCarneExtDto } from './dto/consulta-carnetExt.dto';

@Controller('modules/pide')
export class PideController {
  constructor(private readonly pideService: PideService) {}

  @Get('dni/:dni')
  @UsePipes(new ValidationPipe({ transform: true }))
  async buscarDni(@Param() params: ConsultaDniDto) {
    return await this.pideService.consultarDni(params.dni);
  }

  @Get('ce/:carneExtranjeria')
  @UsePipes(new ValidationPipe({ transform: true }))
  async buscarCarnetExt(@Param() params: ConsultaCarneExtDto) {
    return await this.pideService.consultarCE(params.carneExtranjeria);
  }

}