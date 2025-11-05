import { Module } from '@nestjs/common';
import { DeclaracionTituloProfesionalService } from './declaracion_titulo_profesional.service';
import { DeclaracionTituloProfesionalController } from './declaracion_titulo_profesional.controller';

@Module({
  controllers: [DeclaracionTituloProfesionalController],
  providers: [DeclaracionTituloProfesionalService],
})
export class DeclaracionTituloProfesionalModule {}
