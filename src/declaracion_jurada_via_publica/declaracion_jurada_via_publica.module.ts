import { Module } from '@nestjs/common';
import { DeclaracionJuradaViaPublicaService } from './declaracion_jurada_via_publica.service';
import { DeclaracionJuradaViaPublicaController } from './declaracion_jurada_via_publica.controller';

@Module({
  controllers: [DeclaracionJuradaViaPublicaController],
  providers: [DeclaracionJuradaViaPublicaService],
})
export class DeclaracionJuradaViaPublicaModule {}
