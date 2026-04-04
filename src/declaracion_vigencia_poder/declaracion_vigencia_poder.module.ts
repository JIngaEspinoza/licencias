import { Module } from '@nestjs/common';
import { DeclaracionVigenciaPoderService } from './declaracion_vigencia_poder.service';
import { DeclaracionVigenciaPoderController } from './declaracion_vigencia_poder.controller';

@Module({
  controllers: [DeclaracionVigenciaPoderController],
  providers: [DeclaracionVigenciaPoderService],
})
export class DeclaracionVigenciaPoderModule {}
