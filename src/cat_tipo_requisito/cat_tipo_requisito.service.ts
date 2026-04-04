import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatTipoRequisitoDto } from './dto/create-cat_tipo_requisito.dto';
import { UpdateCatTipoRequisitoDto } from './dto/update-cat_tipo_requisito.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatTipoRequisitoService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateCatTipoRequisitoDto) {
    const catTipoRequisito = await this.prisma.catTipoRequisito.create({ data: dto });
    return catTipoRequisito;
  }

  async findAll() {
    return this.prisma.catTipoRequisito.findMany({ orderBy: { orden: 'desc' } });
  }

  async findOne(id: number, id2: number) {
    const catTipoRequisito = await this.prisma.catTipoRequisito.findUnique({ where: { id_tipo_id_requisito: { id_tipo: id, id_requisito: id2 } } });
    if (!catTipoRequisito) throw new NotFoundException('No encontrado');
    return catTipoRequisito;
  }

  async update(id: number, id2: number, updateCatTipoDto: UpdateCatTipoRequisitoDto) {
    return this.prisma.catTipoRequisito.update({
      where: { id_tipo_id_requisito: { id_tipo: id, id_requisito: id2 } },
      data: updateCatTipoDto,
    });
  }

  async remove(id: number, id2: number) {
    await this.prisma.catTipoRequisito.delete({ where: { id_tipo_id_requisito: { id_tipo: id, id_requisito: id2 } } });
    return { ok: true };
  }

}
