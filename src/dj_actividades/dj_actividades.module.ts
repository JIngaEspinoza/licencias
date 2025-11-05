import { Module } from '@nestjs/common';
import { DjActividadesService } from './dj_actividades.service';
import { DjActividadesController } from './dj_actividades.controller';

@Module({
  controllers: [DjActividadesController],
  providers: [DjActividadesService],
})
export class DjActividadesModule {}
