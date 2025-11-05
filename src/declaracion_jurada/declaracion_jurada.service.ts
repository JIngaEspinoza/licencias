import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeclaracionJuradaDto } from './dto/create-declaracion_jurada.dto';
import { UpdateDeclaracionJuradaDto } from './dto/update-declaracion_jurada.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeclaracionJuradaService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateDeclaracionJuradaDto) {
    const decJurada = await this.prisma.declaracionJurada.create({ data: dto });
    return decJurada;
  }

  async findAll() {
    return this.prisma.declaracionJurada.findMany({ orderBy: { id_declaracion: 'desc' } });
  }

  async findOne(id: number) {
    const decJurada = await this.prisma.declaracionJurada.findUnique({ where: { id_declaracion: id } });
    if (!decJurada) throw new NotFoundException('No encontrado');
    return decJurada;
  }

  async update(id: number, updateDeclaracionJuradaDto: UpdateDeclaracionJuradaDto) {
    return this.prisma.declaracionJurada.update({
      where: { id_declaracion: id },
      data: updateDeclaracionJuradaDto,
    });
  }

  async remove(id: number) {
    await this.prisma.declaracionJurada.delete({ where: { id_declaracion: id } });
    return { ok: true };
  }
}