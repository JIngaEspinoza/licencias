import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatCategoriaDto } from './dto/create-cat_categoria.dto';
import { UpdateCatCategoriaDto } from './dto/update-cat_categoria.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatCategoriaService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateCatCategoriaDto) {
    const catCategoria = await this.prisma.catCategoria.create({ data: dto });
    return catCategoria;
  }

  async findAll() {
    return this.prisma.catCategoria.findMany({ orderBy: { id_categoria: 'desc' } });
  }

  async findOne(id: number) {
    const catCategoria = await this.prisma.catCategoria.findUnique({ where: { id_categoria: id } });
    if (!catCategoria) throw new NotFoundException('No encontrado');
    return catCategoria;
  }

  async update(id: number, updateCatCategoriaDto: UpdateCatCategoriaDto) {
    return this.prisma.catCategoria.update({
      where: { id_categoria: id },
      data: updateCatCategoriaDto,
    });
  }

  async remove(id: number) {
    await this.prisma.catCategoria.delete({ where: { id_categoria: id } });
    return { ok: true };
  }

}
