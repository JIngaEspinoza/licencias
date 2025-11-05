import { Module } from '@nestjs/common';
import { FiscalizacionTemporalService } from './fiscalizacion_temporal.service';
import { FiscalizacionTemporalController } from './fiscalizacion_temporal.controller';

@Module({
  controllers: [FiscalizacionTemporalController],
  providers: [FiscalizacionTemporalService],
})
export class FiscalizacionTemporalModule {}
