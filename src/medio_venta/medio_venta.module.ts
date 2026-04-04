import { Module } from '@nestjs/common';
import { MedioVentaService } from './medio_venta.service';
import { MedioVentaController } from './medio_venta.controller';

@Module({
  controllers: [MedioVentaController],
  providers: [MedioVentaService],
})
export class MedioVentaModule {}
