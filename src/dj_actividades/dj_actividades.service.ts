import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDjActividadeDto } from './dto/create-dj_actividade.dto';
import { UpdateDjActividadeDto } from './dto/update-dj_actividade.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DjActividadesService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateDjActividadeDto) {
    const djActividad = await this.prisma.djActividades.create({ data: dto });
    return djActividad;
  }

  async findAll() {
    return this.prisma.djActividades.findMany({ orderBy: { id_dj_actividad: 'desc' } });
  }

  async findOne(id: number) {
    const djActividad = await this.prisma.djActividades.findUnique({ where: { id_dj_actividad: id } });
    if (!djActividad) throw new NotFoundException('No encontrado');
    return djActividad;
  }

  async update(id: number, updateDjActividadeDto: UpdateDjActividadeDto) {
    return this.prisma.djActividades.update({
      where: { id_dj_actividad: id },
      data: updateDjActividadeDto,
    });
  }

  async remove(id: number) {
    await this.prisma.djActividades.delete({ where: { id_dj_actividad: id } });
    return { ok: true };
  }

}
