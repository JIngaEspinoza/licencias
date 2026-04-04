import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAutorizacionEstablecimientoDto } from './dto/create-autorizacion_establecimiento.dto';
import { UpdateAutorizacionEstablecimientoDto } from './dto/update-autorizacion_establecimiento.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutorizacionEstablecimientoService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateAutorizacionEstablecimientoDto) {
    const autEstable = await this.prisma.autorizacionEstablecimiento.create({ data: dto });
    return autEstable;
  }

  async findAll() {
    return this.prisma.autorizacionEstablecimiento.findMany({ orderBy: { id_auto_establecimiento: 'desc' } });
  }

  async findOne(id: number) {
    const autEstable = await this.prisma.autorizacionEstablecimiento.findUnique({ where: { id_auto_establecimiento: id } });
    if (!autEstable) throw new NotFoundException('No encontrado');
    return autEstable;
  }

  async update(id: number, updateAutorizacionEstablecimientoDto: UpdateAutorizacionEstablecimientoDto) {
    return this.prisma.autorizacionEstablecimiento.update({
      where: { id_auto_establecimiento: id },
      data: updateAutorizacionEstablecimientoDto,
    });
  }

  async remove(id: number) {
    await this.prisma.autorizacionEstablecimiento.delete({ where: { id_auto_establecimiento: id } });
    return { ok: true };
  }

}
