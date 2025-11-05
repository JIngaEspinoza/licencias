import { Module } from '@nestjs/common';
import { CatTipoRequisitoService } from './cat_tipo_requisito.service';
import { CatTipoRequisitoController } from './cat_tipo_requisito.controller';

@Module({
  controllers: [CatTipoRequisitoController],
  providers: [CatTipoRequisitoService],
})
export class CatTipoRequisitoModule {}
