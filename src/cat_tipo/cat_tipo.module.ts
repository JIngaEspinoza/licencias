import { Module } from '@nestjs/common';
import { CatTipoService } from './cat_tipo.service';
import { CatTipoController } from './cat_tipo.controller';

@Module({
  controllers: [CatTipoController],
  providers: [CatTipoService],
})
export class CatTipoModule {}
