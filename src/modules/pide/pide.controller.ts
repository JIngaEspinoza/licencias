import { Controller, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { PideService } from './pide.service';
import { ConsultaDniDto } from './dto/consulta-dni.dto';

@Controller('modules/pide')
export class PideController {
  constructor(private readonly pideService: PideService) {}

  @Get(':dni')
  @UsePipes(new ValidationPipe({ transform: true }))
  async buscarDni(@Param() params: ConsultaDniDto) {
    return await this.pideService.consultarDni(params.dni);
  }

}
