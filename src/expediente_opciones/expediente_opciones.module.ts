import { Module } from '@nestjs/common';
import { ExpedienteOpcionesService } from './expediente_opciones.service';
import { ExpedienteOpcionesController } from './expediente_opciones.controller';

@Module({
  controllers: [ExpedienteOpcionesController],
  providers: [ExpedienteOpcionesService],
})
export class ExpedienteOpcionesModule {}
