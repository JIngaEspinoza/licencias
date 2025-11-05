import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePagoTramiteDto } from './dto/create-pago_tramite.dto';
import { UpdatePagoTramiteDto } from './dto/update-pago_tramite.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PagoTramiteService {
  constructor(private readonly prisma: PrismaService){}

  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreatePagoTramiteDto) {
    const pagoTramite = await this.prisma.pagoTramite.create({ data: dto });
    return pagoTramite;
  }

  async findAll() {
    return this.prisma.pagoTramite.findMany({ orderBy: { id_pago: 'desc' } });
  }

  async findOne(id: number) {
    const pagoTramite = await this.prisma.pagoTramite.findUnique({ where: { id_pago: id } });
    if (!pagoTramite) throw new NotFoundException('No encontrado');
    return pagoTramite;
  }

  async update(id: number, updatePagoTramiteDto: UpdatePagoTramiteDto) {
    return this.prisma.pagoTramite.update({
      where: { id_pago: id },
      data: updatePagoTramiteDto,
    });
  }

  async remove(id: number) {
    await this.prisma.pagoTramite.delete({ where: { id_pago: id } });
    return { ok: true };
  }
}
