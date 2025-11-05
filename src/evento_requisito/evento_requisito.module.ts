import { Module } from '@nestjs/common';
import { EventoRequisitoService } from './evento_requisito.service';
import { EventoRequisitoController } from './evento_requisito.controller';

@Module({
  controllers: [EventoRequisitoController],
  providers: [EventoRequisitoService],
})
export class EventoRequisitoModule {}
