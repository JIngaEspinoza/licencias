import { Module } from '@nestjs/common';
import { PideService } from './pide.service';
import { PideController } from './pide.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PideController],
  providers: [PideService],
})
export class PideModule {}
