import { Module } from '@nestjs/common';
import { EstadoUsoService } from './estado_uso.service';
import { EstadoUsoController } from './estado_uso.controller';

@Module({
  controllers: [EstadoUsoController],
  providers: [EstadoUsoService],
})
export class EstadoUsoModule {}
