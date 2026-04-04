import { Module } from '@nestjs/common';
import { FiscalizacionVisitaService } from './fiscalizacion_visita.service';
import { FiscalizacionVisitaController } from './fiscalizacion_visita.controller';

@Module({
  controllers: [FiscalizacionVisitaController],
  providers: [FiscalizacionVisitaService],
})
export class FiscalizacionVisitaModule {}
