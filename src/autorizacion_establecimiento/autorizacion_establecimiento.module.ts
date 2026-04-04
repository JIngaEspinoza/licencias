import { Module } from '@nestjs/common';
import { AutorizacionEstablecimientoService } from './autorizacion_establecimiento.service';
import { AutorizacionEstablecimientoController } from './autorizacion_establecimiento.controller';

@Module({
  controllers: [AutorizacionEstablecimientoController],
  providers: [AutorizacionEstablecimientoService],
})
export class AutorizacionEstablecimientoModule {}
