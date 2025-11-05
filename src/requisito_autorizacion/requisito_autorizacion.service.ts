import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRequisitoAutorizacionDto } from './dto/create-requisito_autorizacion.dto';
import { UpdateRequisitoAutorizacionDto } from './dto/update-requisito_autorizacion.dto';

@Injectable()
export class RequisitoAutorizacionService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_requisito: number,
    id_autorizacion: number,
    tipo_requisito?: string,
    descripcion?: string,
    fecha_presentacion?: string,
    cumplido?: boolean
  }) {
    //return this.prisma.requisitoAutorizacion.create({data: dto});
  }

  findAll() {
    //return this.prisma.requisitoAutorizacion.findMany({orderBy: {id_requisito : 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} requisitoAutorizacion`;
  }

  update(id: number, updateRequisitoAutorizacionDto: UpdateRequisitoAutorizacionDto) {
    return `This action updates a #${id} requisitoAutorizacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} requisitoAutorizacion`;
  }
}
