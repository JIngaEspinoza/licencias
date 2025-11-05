import { Module } from '@nestjs/common';
import { DjCesionarioService } from './dj_cesionario.service';
import { DjCesionarioController } from './dj_cesionario.controller';

@Module({
  controllers: [DjCesionarioController],
  providers: [DjCesionarioService],
})
export class DjCesionarioModule {}
