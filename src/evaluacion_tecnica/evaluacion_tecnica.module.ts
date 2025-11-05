import { Module } from '@nestjs/common';
import { EvaluacionTecnicaService } from './evaluacion_tecnica.service';
import { EvaluacionTecnicaController } from './evaluacion_tecnica.controller';

@Module({
  controllers: [EvaluacionTecnicaController],
  providers: [EvaluacionTecnicaService],
})
export class EvaluacionTecnicaModule {}
