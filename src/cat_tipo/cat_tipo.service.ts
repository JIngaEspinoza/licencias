import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatTipoDto } from './dto/create-cat_tipo.dto';
import { UpdateCatTipoDto } from './dto/update-cat_tipo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatTipoService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateCatTipoDto) {
    const catTipo = await this.prisma.catTipo.create({ data: dto });
    return catTipo;
  }

  async findAll() {
    return this.prisma.catTipo.findMany({ orderBy: { id_categoria: 'desc' } });
  }

  async findOne(id: number) {
    const catTipo = await this.prisma.catTipo.findUnique({ where: { id_tipo: id } });
    if (!catTipo) throw new NotFoundException('No encontrado');
    return catTipo;
  }

  async update(id: number, updateCatTipoDto: UpdateCatTipoDto) {
    return this.prisma.catTipo.update({
      where: { id_tipo: id },
      data: updateCatTipoDto,
    });
  }

  async remove(id: number) {
    await this.prisma.catTipo.delete({ where: { id_tipo: id } });
    return { ok: true };
  }

}
