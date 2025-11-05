import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeguridadItseDto } from './dto/create-seguridad_itse.dto';
import { UpdateSeguridadItseDto } from './dto/update-seguridad_itse.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeguridadItseService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateSeguridadItseDto) {
    const segItse = await this.prisma.seguridadItse.create({ data: dto });
    return segItse;
  }

  async findAll() {
    return this.prisma.seguridadItse.findMany({ orderBy: { id_seguridad: 'desc' } });
  }

  async findOne(id: number) {
    const segItse = await this.prisma.seguridadItse.findUnique({ where: { id_seguridad: id } });
    if (!segItse) throw new NotFoundException('No encontrado');
    return segItse;
  }

  async update(id: number, updateSeguridadItseDto: UpdateSeguridadItseDto) {
    return this.prisma.seguridadItse.update({
      where: { id_seguridad: id },
      data: updateSeguridadItseDto,
    });
  }

  async remove(id: number) {
    await this.prisma.seguridadItse.delete({ where: { id_seguridad: id } });
    return { ok: true };
  }
}
