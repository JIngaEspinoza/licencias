import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActividadCatalogoDto } from './dto/create-actividad_catalogo.dto';
import { UpdateActividadCatalogoDto } from './dto/update-actividad_catalogo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActividadCatalogoService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateActividadCatalogoDto) {
    const actCatalogo = await this.prisma.actividadCatalogo.create({ data: dto });
    return actCatalogo;
  }

  async findAll() {
    return this.prisma.actividadCatalogo.findMany({ orderBy: { id_actividad: 'desc' } });
  }

  async findOne(id: number) {
    const actCatalogo = await this.prisma.actividadCatalogo.findUnique({ where: { id_actividad: id } });
    if (!actCatalogo) throw new NotFoundException('No encontrado');
    return actCatalogo;
  }

  async update(id: number, updateActividadCatalogoDto: UpdateActividadCatalogoDto) {
    return this.prisma.actividadCatalogo.update({
      where: { id_actividad: id },
      data: updateActividadCatalogoDto,
    });
  }

  async remove(id: number) {
    await this.prisma.actividadCatalogo.delete({ where: { id_actividad: id } });
    return { ok: true };
  }
}
