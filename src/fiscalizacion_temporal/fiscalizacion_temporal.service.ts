import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFiscalizacionTemporalDto } from './dto/create-fiscalizacion_temporal.dto';
import { UpdateFiscalizacionTemporalDto } from './dto/update-fiscalizacion_temporal.dto';

@Injectable()
export class FiscalizacionTemporalService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_fiscalizacion: number,
    id_autorizacion: number,
    fecha_visita?: string,
    observaciones?: string,
    resultado?: string
  }) {
    //return this.prisma.fiscalizacionTemporal.create({data: dto});
  }

  findAll() {
    //return this.prisma.fiscalizacionTemporal.findMany({orderBy: {id_fiscalizacion: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} fiscalizacionTemporal`;
  }

  update(id: number, updateFiscalizacionTemporalDto: UpdateFiscalizacionTemporalDto) {
    return `This action updates a #${id} fiscalizacionTemporal`;
  }

  remove(id: number) {
    return `This action removes a #${id} fiscalizacionTemporal`;
  }
}
