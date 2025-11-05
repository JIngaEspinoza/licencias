import { Module } from '@nestjs/common';
import { FiscalizacionService } from './fiscalizacion.service';
import { FiscalizacionController } from './fiscalizacion.controller';

@Module({
  controllers: [FiscalizacionController],
  providers: [FiscalizacionService],
})
export class FiscalizacionModule {}
