import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService){}

  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateAuditoriaDto) {
    const auditoria = await this.prisma.auditoria.create({ data: dto });
    return auditoria;
  }

  async findAll() {
    return this.prisma.auditoria.findMany({ orderBy: { id_auditoria: 'desc' } });
  }

  async findOne(id: number) {
    const auditoria = await this.prisma.auditoria.findUnique({ where: { id_auditoria: id } });
    if (!auditoria) throw new NotFoundException('No encontrado');
    return auditoria;
  }

  async update(id: number, updateSeguridadItseDto: UpdateAuditoriaDto) {
    return this.prisma.auditoria.update({
      where: { id_auditoria: id },
      data: updateSeguridadItseDto,
    });
  }

  async remove(id: number) {
    await this.prisma.auditoria.delete({ where: { id_auditoria: id } });
    return { ok: true };
  }
}
