import { Module } from '@nestjs/common';
import { AutorizacionSectorialService } from './autorizacion_sectorial.service';
import { AutorizacionSectorialController } from './autorizacion_sectorial.controller';

@Module({
  controllers: [AutorizacionSectorialController],
  providers: [AutorizacionSectorialService],
})
export class AutorizacionSectorialModule {}
