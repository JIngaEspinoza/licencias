import { Module } from '@nestjs/common';
import { DeclaracionJuradaGiroService } from './declaracion_jurada_giro.service';
import { DeclaracionJuradaGiroController } from './declaracion_jurada_giro.controller';

@Module({
  controllers: [DeclaracionJuradaGiroController],
  providers: [DeclaracionJuradaGiroService],
})
export class DeclaracionJuradaGiroModule {}
