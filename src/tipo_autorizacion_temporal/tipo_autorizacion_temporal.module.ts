import { Module } from '@nestjs/common';
import { TipoAutorizacionTemporalService } from './tipo_autorizacion_temporal.service';
import { TipoAutorizacionTemporalController } from './tipo_autorizacion_temporal.controller';

@Module({
  controllers: [TipoAutorizacionTemporalController],
  providers: [TipoAutorizacionTemporalService],
})
export class TipoAutorizacionTemporalModule {}
