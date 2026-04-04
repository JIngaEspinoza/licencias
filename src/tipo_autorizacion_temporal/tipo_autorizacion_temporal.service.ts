import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTipoAutorizacionTemporalDto } from './dto/create-tipo_autorizacion_temporal.dto';
import { UpdateTipoAutorizacionTemporalDto } from './dto/update-tipo_autorizacion_temporal.dto';

@Injectable()
export class TipoAutorizacionTemporalService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_tipo: number,
    nombre_tipo?: string,
    descripcion?: string
  }) {
    //return this.prisma.tipoAutorizacionTemporal.create({data:dto});
  }

  findAll() {
    //return this.prisma.tipoAutorizacionTemporal.findMany({orderBy: {id_tipo: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoAutorizacionTemporal`;
  }

  update(id: number, updateTipoAutorizacionTemporalDto: UpdateTipoAutorizacionTemporalDto) {
    return `This action updates a #${id} tipoAutorizacionTemporal`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoAutorizacionTemporal`;
  }
}
