import { Module } from '@nestjs/common';
import { LicenciaFuncionamientoService } from './licencia_funcionamiento.service';
import { LicenciaFuncionamientoController } from './licencia_funcionamiento.controller';

@Module({
  controllers: [LicenciaFuncionamientoController],
  providers: [LicenciaFuncionamientoService],
})
export class LicenciaFuncionamientoModule {}
