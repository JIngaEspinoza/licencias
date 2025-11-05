import { Module } from '@nestjs/common';
import { ZonificacionService } from './zonificacion.service';
import { ZonificacionController } from './zonificacion.controller';

@Module({
  controllers: [ZonificacionController],
  providers: [ZonificacionService],
})
export class ZonificacionModule {}
