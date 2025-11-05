import { Module } from '@nestjs/common';
import { DjConstanciasService } from './dj_constancias.service';
import { DjConstanciasController } from './dj_constancias.controller';

@Module({
  controllers: [DjConstanciasController],
  providers: [DjConstanciasService],
})
export class DjConstanciasModule {}
