import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAutorizacionViaPublicaDto } from './dto/create-autorizacion_via_publica.dto';
import { UpdateAutorizacionViaPublicaDto } from './dto/update-autorizacion_via_publica.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutorizacionViaPublicaService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateAutorizacionViaPublicaDto) {
    const autoViaPublica = await this.prisma.autorizacionViaPublica.create({ data: dto });
    return autoViaPublica;
  }

  async findAll() {
    return this.prisma.autorizacionViaPublica.findMany({ orderBy: { id_auto_viapublica: 'desc' } });
  }

  async findOne(id: number) {
    const autoViaPublica = await this.prisma.autorizacionViaPublica.findUnique({ where: { id_auto_viapublica: id } });
    if (!autoViaPublica) throw new NotFoundException('No encontrado');
    return autoViaPublica;
  }

  async update(id: number, updateEventoRequisitoDto: UpdateAutorizacionViaPublicaDto) {
    return this.prisma.autorizacionViaPublica.update({
      where: { id_auto_viapublica: id },
      data: updateEventoRequisitoDto,
    });
  }

  async remove(id: number) {
    await this.prisma.autorizacionViaPublica.delete({ where: { id_auto_viapublica: id } });
    return { ok: true };
  }

}
