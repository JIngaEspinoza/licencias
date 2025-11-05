import { Injectable } from '@nestjs/common';
import { CreateCatRequisitoDto } from './dto/create-cat_requisito.dto';
import { UpdateCatRequisitoDto } from './dto/update-cat_requisito.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatRequisitoService {
  constructor(private readonly prisma: PrismaService){}
  create(createCatRequisitoDto: CreateCatRequisitoDto) {
    return 'This action adds a new catRequisito';
  }

  async findAll() {
    return this.prisma.catRequisito.findMany({ orderBy: { id_requisito: 'desc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} catRequisito`;
  }

  update(id: number, updateCatRequisitoDto: UpdateCatRequisitoDto) {
    return `This action updates a #${id} catRequisito`;
  }

  remove(id: number) {
    return `This action removes a #${id} catRequisito`;
  }
}
