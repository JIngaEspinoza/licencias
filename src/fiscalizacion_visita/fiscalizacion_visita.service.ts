import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFiscalizacionVisitaDto } from './dto/create-fiscalizacion_visita.dto';
import { UpdateFiscalizacionVisitaDto } from './dto/update-fiscalizacion_visita.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FiscalizacionVisitaService {
  constructor(private readonly prisma: PrismaService){}

  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateFiscalizacionVisitaDto) {
    const fiscaVisita = await this.prisma.fiscalizacionVisita.create({ data: dto });
    return fiscaVisita;
  }

  async findAll() {
    return this.prisma.fiscalizacionVisita.findMany({ orderBy: { id_visita: 'desc' } });
  }

  async findOne(id: number) {
    const fiscaVisita = await this.prisma.fiscalizacionVisita.findUnique({ where: { id_visita: id } });
    if (!fiscaVisita) throw new NotFoundException('No encontrado');
    return fiscaVisita;
  }

  async update(id: number, updateFiscalizacionVisitaDto: UpdateFiscalizacionVisitaDto) {
    return this.prisma.fiscalizacionVisita.update({
      where: { id_visita: id },
      data: updateFiscalizacionVisitaDto,
    });
  }

  async remove(id: number) {
    await this.prisma.fiscalizacionVisita.delete({ where: { id_visita: id } });
    return { ok: true };
  }
}
