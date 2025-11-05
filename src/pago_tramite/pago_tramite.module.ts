import { Module } from '@nestjs/common';
import { PagoTramiteService } from './pago_tramite.service';
import { PagoTramiteController } from './pago_tramite.controller';

@Module({
  controllers: [PagoTramiteController],
  providers: [PagoTramiteService],
})
export class PagoTramiteModule {}
