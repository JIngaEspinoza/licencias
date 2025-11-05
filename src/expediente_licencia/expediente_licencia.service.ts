import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpedienteLicenciaDto } from './dto/create-expediente_licencia.dto';
import { UpdateExpedienteLicenciaDto } from './dto/update-expediente_licencia.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpedienteLicenciaService {
  constructor(private readonly prisma: PrismaService){}

  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateExpedienteLicenciaDto) {
    const expLicencia = await this.prisma.expedienteLicencia.create({ data: dto });
    return expLicencia;
  }

  async findAll() {
    return this.prisma.expedienteLicencia.findMany({ orderBy: { id_expediente_licencia: 'desc' } });
  }

  async findOne(id: number) {
    const expLicencia = await this.prisma.expedienteLicencia.findUnique({ where: { id_expediente_licencia: id } });
    if (!expLicencia) throw new NotFoundException('No encontrado');
    return expLicencia;
  }

  async update(id: number, updateExpedienteLicenciaDto: UpdateExpedienteLicenciaDto) {
    return this.prisma.expedienteLicencia.update({
      where: { id_expediente_licencia: id },
      data: updateExpedienteLicenciaDto,
    });
  }

  async remove(id: number) {
    await this.prisma.expedienteLicencia.delete({ where: { id_expediente_licencia: id } });
    return { ok: true };
  }
}