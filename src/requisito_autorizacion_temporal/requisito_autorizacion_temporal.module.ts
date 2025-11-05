import { Module } from '@nestjs/common';
import { RequisitoAutorizacionTemporalService } from './requisito_autorizacion_temporal.service';
import { RequisitoAutorizacionTemporalController } from './requisito_autorizacion_temporal.controller';

@Module({
  controllers: [RequisitoAutorizacionTemporalController],
  providers: [RequisitoAutorizacionTemporalService],
})
export class RequisitoAutorizacionTemporalModule {}
