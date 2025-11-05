import { Module } from '@nestjs/common';
import { AutorizacionesTemporalesService } from './autorizaciones_temporales.service';
import { AutorizacionesTemporalesController } from './autorizaciones_temporales.controller';

@Module({
  controllers: [AutorizacionesTemporalesController],
  providers: [AutorizacionesTemporalesService],
})
export class AutorizacionesTemporalesModule {}
