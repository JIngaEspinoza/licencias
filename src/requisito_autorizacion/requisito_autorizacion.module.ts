import { Module } from '@nestjs/common';
import { RequisitoAutorizacionService } from './requisito_autorizacion.service';
import { RequisitoAutorizacionController } from './requisito_autorizacion.controller';

@Module({
  controllers: [RequisitoAutorizacionController],
  providers: [RequisitoAutorizacionService],
})
export class RequisitoAutorizacionModule {}
