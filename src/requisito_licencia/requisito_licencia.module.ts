import { Module } from '@nestjs/common';
import { RequisitoLicenciaService } from './requisito_licencia.service';
import { RequisitoLicenciaController } from './requisito_licencia.controller';

@Module({
  controllers: [RequisitoLicenciaController],
  providers: [RequisitoLicenciaService],
})
export class RequisitoLicenciaModule {}
