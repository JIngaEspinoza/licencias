import { Module } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { ExpedientesController } from './expedientes.controller';
import { PublicController } from 'src/valida_licencia/expedientes.controller';

@Module({
  controllers: [ExpedientesController, PublicController],
  providers: [ExpedientesService],
})
export class ExpedientesModule {}
