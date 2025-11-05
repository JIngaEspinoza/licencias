import { Module } from '@nestjs/common';
import { AutorizacionAnexoService } from './autorizacion_anexo.service';
import { AutorizacionAnexoController } from './autorizacion_anexo.controller';

@Module({
  controllers: [AutorizacionAnexoController],
  providers: [AutorizacionAnexoService],
})
export class AutorizacionAnexoModule {}
