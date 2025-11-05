import { Module } from '@nestjs/common';
import { GiroZonificacionService } from './giro_zonificacion.service';
import { GiroZonificacionController } from './giro_zonificacion.controller';

@Module({
  controllers: [GiroZonificacionController],
  providers: [GiroZonificacionService],
})
export class GiroZonificacionModule {}
