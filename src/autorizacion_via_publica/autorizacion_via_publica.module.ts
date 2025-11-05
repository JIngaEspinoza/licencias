import { Module } from '@nestjs/common';
import { AutorizacionViaPublicaService } from './autorizacion_via_publica.service';
import { AutorizacionViaPublicaController } from './autorizacion_via_publica.controller';

@Module({
  controllers: [AutorizacionViaPublicaController],
  providers: [AutorizacionViaPublicaService],
})
export class AutorizacionViaPublicaModule {}
