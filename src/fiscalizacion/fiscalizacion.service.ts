import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFiscalizacionDto } from './dto/create-fiscalizacion.dto';
import { UpdateFiscalizacionDto } from './dto/update-fiscalizacion.dto';

@Injectable()
export class FiscalizacionService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_fiscalizacion: number,
    id_licencia: number,
    fecha_visita?: string,
    infraccion_detectada?: string,
    resultado?: string
  }) {
    //return this.prisma.fiscalizacion.create({data:dto});
  }

  findAll() {
    //return this.prisma.fiscalizacion.findMany({orderBy:{id_fiscalizacion: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} fiscalizacion`;
  }

  update(id: number, updateFiscalizacionDto: UpdateFiscalizacionDto) {
    return `This action updates a #${id} fiscalizacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} fiscalizacion`;
  }
}
