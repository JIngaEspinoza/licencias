import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRequisitoAutorizacionTemporalDto } from './dto/create-requisito_autorizacion_temporal.dto';
import { UpdateRequisitoAutorizacionTemporalDto } from './dto/update-requisito_autorizacion_temporal.dto';

@Injectable()
export class RequisitoAutorizacionTemporalService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_requisito: number;
    id_autorizacion: number;
    tipo_requisito?: string;
    descripcion?: string;
    fecha_presentacion?: string;
    cumplido?: boolean;
  }) {
    //return this.prisma.requisitoAutorizacionTemporal.create({data: dto});
  }

  findAll() {
    //return this.prisma.requisitoAutorizacionTemporal.findMany({orderBy: {id_requisito: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} requisitoAutorizacionTemporal`;
  }

  update(id: number, updateRequisitoAutorizacionTemporalDto: UpdateRequisitoAutorizacionTemporalDto) {
    return `This action updates a #${id} requisitoAutorizacionTemporal`;
  }

  remove(id: number) {
    return `This action removes a #${id} requisitoAutorizacionTemporal`;
  }
}
