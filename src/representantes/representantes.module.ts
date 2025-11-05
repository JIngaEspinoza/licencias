import { Module } from '@nestjs/common';
import { RepresentantesService } from './representantes.service';
import { RepresentantesController } from './representantes.controller';

@Module({
  controllers: [RepresentantesController],
  providers: [RepresentantesService],
})
export class RepresentantesModule {}
