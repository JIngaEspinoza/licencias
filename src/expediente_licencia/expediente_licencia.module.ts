import { Module } from '@nestjs/common';
import { ExpedienteLicenciaService } from './expediente_licencia.service';
import { ExpedienteLicenciaController } from './expediente_licencia.controller';

@Module({
  controllers: [ExpedienteLicenciaController],
  providers: [ExpedienteLicenciaService],
})
export class ExpedienteLicenciaModule {}
