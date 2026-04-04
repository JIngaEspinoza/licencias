import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeclaracionJuradaLicenciaDto } from './dto/create-declaracion_jurada_licencia.dto';
import { UpdateDeclaracionJuradaLicenciaDto } from './dto/update-declaracion_jurada_licencia.dto';

@Injectable()
export class DeclaracionJuradaLicenciaService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_licencia: number;
    tipo_declaracion?: string;
    fecha?: string;
    observaciones?: string;
  }) {
    //return this.prisma.declaracionJuradaLicencia.create({data:dto});
  }

  findAll() {
    //return this.prisma.declaracionJuradaLicencia.findMany({ orderBy: {id_declaracion: 'desc'} });
    //return this.prisma.licenciaFuncionamiento.findMany({ orderBy: {id_licencia: 'desc'} });
  }

  findOne(id: number) {
    return `This action returns a #${id} declaracionJuradaLicencia`;
  }

  update(id: number, updateDeclaracionJuradaLicenciaDto: UpdateDeclaracionJuradaLicenciaDto) {
    return `This action updates a #${id} declaracionJuradaLicencia`;
  }

  remove(id: number) {
    return `This action removes a #${id} declaracionJuradaLicencia`;
  }
}
