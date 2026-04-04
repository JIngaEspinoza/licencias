import { Module } from '@nestjs/common';
import { AutorizacionTemporalService } from './autorizacion_temporal.service';
import { AutorizacionTemporalController } from './autorizacion_temporal.controller';

@Module({
  controllers: [AutorizacionTemporalController],
  providers: [AutorizacionTemporalService],
})
export class AutorizacionTemporalModule {}
