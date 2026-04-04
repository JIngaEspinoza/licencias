import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFiscalizacionAutorizacionDto } from './dto/create-fiscalizacion_autorizacion.dto';
import { UpdateFiscalizacionAutorizacionDto } from './dto/update-fiscalizacion_autorizacion.dto';

@Injectable()
export class FiscalizacionAutorizacionService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_fiscalizacion: number,
    id_autorizacion: number,
    fecha_visita?: string,
    observaciones?: string,
    resultado?: string
  }) {
    //return this.prisma.fiscalizacionAutorizacion.create({data: dto});
  }

  findAll() {
    //return this.prisma.fiscalizacionAutorizacion.findMany({orderBy: {id_fiscalizacion : 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} fiscalizacionAutorizacion`;
  }

  update(id: number, updateFiscalizacionAutorizacionDto: UpdateFiscalizacionAutorizacionDto) {
    return `This action updates a #${id} fiscalizacionAutorizacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} fiscalizacionAutorizacion`;
  }
}
