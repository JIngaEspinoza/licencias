import { Module } from '@nestjs/common';
import { EventoHorarioService } from './evento_horario.service';
import { EventoHorarioController } from './evento_horario.controller';

@Module({
  controllers: [EventoHorarioController],
  providers: [EventoHorarioService],
})
export class EventoHorarioModule {}
