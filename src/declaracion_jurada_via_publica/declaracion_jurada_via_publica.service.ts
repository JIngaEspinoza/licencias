import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeclaracionJuradaViaPublicaDto } from './dto/create-declaracion_jurada_via_publica.dto';
import { UpdateDeclaracionJuradaViaPublicaDto } from './dto/update-declaracion_jurada_via_publica.dto';

@Injectable()
export class DeclaracionJuradaViaPublicaService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_declaracion: number,
    id_autorizacion: number,
    fecha?: string,
    compromisos?: string
  }) {
    //return this.prisma.declaracionJuradaViaPublica.create({data: dto});
  }

  findAll() {
    //return this.prisma.declaracionJuradaViaPublica.findMany({orderBy: {id_declaracion: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} declaracionJuradaViaPublica`;
  }

  update(id: number, updateDeclaracionJuradaViaPublicaDto: UpdateDeclaracionJuradaViaPublicaDto) {
    return `This action updates a #${id} declaracionJuradaViaPublica`;
  }

  remove(id: number) {
    return `This action removes a #${id} declaracionJuradaViaPublica`;
  }
}
