import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventoRequisitoDto } from './dto/create-evento_requisito.dto';
import { UpdateEventoRequisitoDto } from './dto/update-evento_requisito.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventoRequisitoService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateEventoRequisitoDto) {
    const eventRequisito = await this.prisma.eventoRequisito.create({ data: dto });
    return eventRequisito;
  }

  async findAll() {
    return this.prisma.eventoRequisito.findMany({ orderBy: { id_evento_req: 'desc' } });
  }

  async findOne(id: number) {
    const eventRequisito = await this.prisma.eventoRequisito.findUnique({ where: { id_evento_req: id } });
    if (!eventRequisito) throw new NotFoundException('No encontrado');
    return eventRequisito;
  }

  async update(id: number, updateEventoRequisitoDto: UpdateEventoRequisitoDto) {
    return this.prisma.eventoRequisito.update({
      where: { id_evento_req: id },
      data: updateEventoRequisitoDto,
    });
  }

  async remove(id: number) {
    await this.prisma.eventoRequisito.delete({ where: { id_evento_req: id } });
    return { ok: true };
  }

}
