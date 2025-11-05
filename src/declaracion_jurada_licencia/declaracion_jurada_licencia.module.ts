import { Module } from '@nestjs/common';
import { DeclaracionJuradaLicenciaService } from './declaracion_jurada_licencia.service';
import { DeclaracionJuradaLicenciaController } from './declaracion_jurada_licencia.controller';

@Module({
  controllers: [DeclaracionJuradaLicenciaController],
  providers: [DeclaracionJuradaLicenciaService],
})
export class DeclaracionJuradaLicenciaModule {}
