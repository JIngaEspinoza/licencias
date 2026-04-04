import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDjCesionarioDto } from './dto/create-dj_cesionario.dto';
import { UpdateDjCesionarioDto } from './dto/update-dj_cesionario.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DjCesionarioService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateDjCesionarioDto) {
    const djCesionario = await this.prisma.djCesionario.create({ data: dto });
    return djCesionario;
  }

  async findAll() {
    return this.prisma.djCesionario.findMany({ orderBy: { id_cesionario: 'desc' } });
  }

  async findOne(id: number) {
    const djCesionario = await this.prisma.djCesionario.findUnique({ where: { id_cesionario: id } });
    if (!djCesionario) throw new NotFoundException('No encontrado');
    return djCesionario;
  }

  async update(id: number, updateDjCesionarioDto: UpdateDjCesionarioDto) {
    return this.prisma.djCesionario.update({
      where: { id_cesionario: id },
      data: updateDjCesionarioDto,
    });
  }

  async remove(id: number) {
    await this.prisma.djCesionario.delete({ where: { id_cesionario: id } });
    return { ok: true };
  }

}
