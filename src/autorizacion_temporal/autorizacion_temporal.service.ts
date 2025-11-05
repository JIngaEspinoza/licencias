import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAutorizacionTemporalDto } from './dto/create-autorizacion_temporal.dto';
import { UpdateAutorizacionTemporalDto } from './dto/update-autorizacion_temporal.dto';

@Injectable()
export class AutorizacionTemporalService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_autorizacion: number,
    id_ciudadano: number,
    id_tipo: number,
    numero_autorizacion?: string,
    fecha_solicitud?: string,
    fecha_emision?: string,
    fecha_inicio?: string,
    fecha_fin?: string,
    ubicacion?: string,
    aforo?: number,
    estado?: string,
    codigo_qr?: string
  }) {
    //return this.prisma.autorizacionTemporal.create({data:dto});
  }

  findAll() {
    //return this.prisma.autorizacionTemporal.findMany({ orderBy: { id_autorizacion: 'desc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} autorizacionTemporal`;
  }

  update(id: number, updateAutorizacionTemporalDto: UpdateAutorizacionTemporalDto) {
    return `This action updates a #${id} autorizacionTemporal`;
  }

  remove(id: number) {
    return `This action removes a #${id} autorizacionTemporal`;
  }
}
