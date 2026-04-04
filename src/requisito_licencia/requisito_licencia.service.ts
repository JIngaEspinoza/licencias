import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRequisitoLicenciaDto } from './dto/create-requisito_licencia.dto';
import { UpdateRequisitoLicenciaDto } from './dto/update-requisito_licencia.dto';

@Injectable()
export class RequisitoLicenciaService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_requisito: number,
    id_licencia: number,
    tipo_requisito?: string,
    descripcion?: string,
    fecha_presentacion?: string,
    cumplido?: boolean
  }) {
    //return this.prisma.requisitoLicencia.create({data:dto});
  }

  findAll() {
    //return this.prisma.requisitoLicencia.findMany({ orderBy: { id_requisito: 'desc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} requisitoLicencia`;
  }

  update(id: number, updateRequisitoLicenciaDto: UpdateRequisitoLicenciaDto) {
    return `This action updates a #${id} requisitoLicencia`;
  }

  remove(id: number) {
    return `This action removes a #${id} requisitoLicencia`;
  }
}
