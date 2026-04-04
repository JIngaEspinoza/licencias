import { Module } from '@nestjs/common';
import { EventoArchivoService } from './evento_archivo.service';
import { EventoArchivoController } from './evento_archivo.controller';

@Module({
  controllers: [EventoArchivoController],
  providers: [EventoArchivoService],
})
export class EventoArchivoModule {}
