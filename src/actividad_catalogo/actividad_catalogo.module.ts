import { Module } from '@nestjs/common';
import { ActividadCatalogoService } from './actividad_catalogo.service';
import { ActividadCatalogoController } from './actividad_catalogo.controller';

@Module({
  controllers: [ActividadCatalogoController],
  providers: [ActividadCatalogoService],
})
export class ActividadCatalogoModule {}
