import { Module } from '@nestjs/common';
import { PideService } from './pide.service';
import { PideController } from './pide.controller';

@Module({
  controllers: [PideController],
  providers: [PideService],
})
export class PideModule {}
