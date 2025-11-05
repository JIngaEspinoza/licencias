import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMedioVentaDto } from './dto/create-medio_venta.dto';
import { UpdateMedioVentaDto } from './dto/update-medio_venta.dto';

@Injectable()
export class MedioVentaService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_medio: number,
    id_autorizacion: number,
    tipo_medio?: string,
    descripcion?: string,
    foto_url?: string,
    croquis_url?: string;
  }) {
    //return this.prisma.medioVenta.create({data: dto});
  }

  findAll() {
    //return this.prisma.medioVenta.findMany({orderBy: {id_medio: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} medioVenta`;
  }

  update(id: number, updateMedioVentaDto: UpdateMedioVentaDto) {
    return `This action updates a #${id} medioVenta`;
  }

  remove(id: number) {
    return `This action removes a #${id} medioVenta`;
  }
}
