import { Module } from '@nestjs/common';
import { CatRequisitoService } from './cat_requisito.service';
import { CatRequisitoController } from './cat_requisito.controller';

@Module({
  controllers: [CatRequisitoController],
  providers: [CatRequisitoService],
})
export class CatRequisitoModule {}
