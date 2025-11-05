import { Module } from '@nestjs/common';
import { SeguridadItseService } from './seguridad_itse.service';
import { SeguridadItseController } from './seguridad_itse.controller';

@Module({
  controllers: [SeguridadItseController],
  providers: [SeguridadItseService],
})
export class SeguridadItseModule {}
