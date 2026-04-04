import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeclaracionJuradaGiroDto } from './dto/create-declaracion_jurada_giro.dto';
import { UpdateDeclaracionJuradaGiroDto } from './dto/update-declaracion_jurada_giro.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeclaracionJuradaGiroService {
  constructor(private readonly prisma: PrismaService){}
      
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }
  
  async create(dto: CreateDeclaracionJuradaGiroDto) {
    const decJuradaGiro = await this.prisma.declaracionJuradaGiro.create({ data: dto });
    return decJuradaGiro;
  }

  async findAll() {
    return this.prisma.declaracionJuradaGiro.findMany({ orderBy: { id_dj_giro: 'desc' } });
  }

  async findOne(id: number) {
    const decJuradaGiro = await this.prisma.declaracionJuradaGiro.findUnique({ where: { id_dj_giro: id } });
    if (!decJuradaGiro) throw new NotFoundException('No encontrado');
    return decJuradaGiro;
  }

  async update(id: number, updateDeclaracionJuradaGiroDto: UpdateDeclaracionJuradaGiroDto) {
    return this.prisma.declaracionJuradaGiro.update({
      where: { id_dj_giro: id },
      data: updateDeclaracionJuradaGiroDto,
    });
  }

  async remove(id: number) {
    await this.prisma.declaracionJuradaGiro.delete({ where: { id_dj_giro: id } });
    return { ok: true };
  }
}