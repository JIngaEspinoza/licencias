import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventoHorarioDto } from './dto/create-evento_horario.dto';
import { UpdateEventoHorarioDto } from './dto/update-evento_horario.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventoHorarioService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateEventoHorarioDto) {
    const eventHorario = await this.prisma.eventoHorario.create({ data: dto });
    return eventHorario;
  }

  async findAll() {
    return this.prisma.eventoHorario.findMany({ orderBy: { id_horario: 'desc' } });
  }

  async findOne(id: number) {
    const eventHorario = await this.prisma.eventoHorario.findUnique({ where: { id_horario: id } });
    if (!eventHorario) throw new NotFoundException('No encontrado');
    return eventHorario;
  }

  async update(id: number, updateEventoHorarioDto: UpdateEventoHorarioDto) {
    return this.prisma.eventoHorario.update({
      where: { id_horario: id },
      data: updateEventoHorarioDto,
    });
  }

  async remove(id: number) {
    await this.prisma.eventoHorario.delete({ where: { id_horario: id } });
    return { ok: true };
  }
  
}
