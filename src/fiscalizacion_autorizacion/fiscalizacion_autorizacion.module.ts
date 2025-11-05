import { Module } from '@nestjs/common';
import { FiscalizacionAutorizacionService } from './fiscalizacion_autorizacion.service';
import { FiscalizacionAutorizacionController } from './fiscalizacion_autorizacion.controller';

@Module({
  controllers: [FiscalizacionAutorizacionController],
  providers: [FiscalizacionAutorizacionService],
})
export class FiscalizacionAutorizacionModule {}
