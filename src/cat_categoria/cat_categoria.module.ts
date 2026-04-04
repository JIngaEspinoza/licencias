import { Module } from '@nestjs/common';
import { CatCategoriaService } from './cat_categoria.service';
import { CatCategoriaController } from './cat_categoria.controller';

@Module({
  controllers: [CatCategoriaController],
  providers: [CatCategoriaService],
})
export class CatCategoriaModule {}
