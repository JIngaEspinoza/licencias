import { Module } from '@nestjs/common';
import { GiroService } from './giro.service';
import { GiroController } from './giro.controller';

@Module({
  controllers: [GiroController],
  providers: [GiroService],
})
export class GiroModule {}
