import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TramiteService } from './tramite.service';
import { TramiteController } from './tramite.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000, // Si la API externa no responde en 5s, cortamos (Ligereza)
    }),
  ],
  controllers: [TramiteController],
  providers: [TramiteService],
})
export class TramiteModule {}
