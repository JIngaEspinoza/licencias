import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpedienteOpcioneDto } from './dto/create-expediente_opcione.dto';
import { UpdateExpedienteOpcioneDto } from './dto/update-expediente_opcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpedienteOpcionesService {

  constructor(private readonly prisma: PrismaService){}
    
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateExpedienteOpcioneDto) {
    const expOpciones = await this.prisma.expedienteOpciones.create({ data: dto });
    return expOpciones;
  }

  async findAll() {
    return this.prisma.expedienteOpciones.findMany({ orderBy: { id_expediente_opcion: 'desc' } });
  }

  async findOne(id: number) {
    const expOpciones = await this.prisma.expedienteOpciones.findUnique({ where: { id_expediente_opcion: id } });
    if (!expOpciones) throw new NotFoundException('No encontrado');
    return expOpciones;
  }

  async update(id: number, updateExpedienteOpcioneDto: UpdateExpedienteOpcioneDto) {
    return this.prisma.expedienteOpciones.update({
      where: { id_expediente_opcion: id },
      data: updateExpedienteOpcioneDto,
    });
  }

  async remove(id: number) {
    await this.prisma.expedienteOpciones.delete({ where: { id_expediente_opcion: id } });
    return { ok: true };
  }
}