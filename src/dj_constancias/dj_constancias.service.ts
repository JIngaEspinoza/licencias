import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDjConstanciaDto } from './dto/create-dj_constancia.dto';
import { UpdateDjConstanciaDto } from './dto/update-dj_constancia.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DjConstanciasService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateDjConstanciaDto) {
    const djCesionario = await this.prisma.djConstancias.create({ data: dto });
    return djCesionario;
  }

  async findAll() {
    return this.prisma.djConstancias.findMany({ orderBy: { id_constancia: 'desc' } });
  }

  async findOne(id: number) {
    const djCesionario = await this.prisma.djConstancias.findUnique({ where: { id_constancia: id } });
    if (!djCesionario) throw new NotFoundException('No encontrado');
    return djCesionario;
  }

  async update(id: number, updateDjConstanciaDto: UpdateDjConstanciaDto) {
    return this.prisma.djConstancias.update({
      where: { id_constancia: id },
      data: updateDjConstanciaDto,
    });
  }

  async remove(id: number) {
    await this.prisma.djConstancias.delete({ where: { id_constancia: id } });
    return { ok: true };
  }

}
