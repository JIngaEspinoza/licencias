import { Module } from '@nestjs/common';
import { DeclaracionJuradaService } from './declaracion_jurada.service';
import { DeclaracionJuradaController } from './declaracion_jurada.controller';

@Module({
  controllers: [DeclaracionJuradaController],
  providers: [DeclaracionJuradaService],
})
export class DeclaracionJuradaModule {}
