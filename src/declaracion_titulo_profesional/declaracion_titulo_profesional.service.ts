import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeclaracionTituloProfesionalDto } from './dto/create-declaracion_titulo_profesional.dto';
import { UpdateDeclaracionTituloProfesionalDto } from './dto/update-declaracion_titulo_profesional.dto';

@Injectable()
export class DeclaracionTituloProfesionalService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_titulo: number,
    id_licencia: number,
    nombre_titulo?: string,
    institucion?: string,
    fecha_emision?: string,
    colegio_profesional?: string,
    nro_colegiatura?: string
  }) {
    //return this.prisma.declaracionTituloProfesional.create({data:dto});
  }

  findAll() {
    return `This action returns all declaracionTituloProfesional`;
  }

  findOne(id: number) {
    return `This action returns a #${id} declaracionTituloProfesional`;
  }

  update(id: number, updateDeclaracionTituloProfesionalDto: UpdateDeclaracionTituloProfesionalDto) {
    return `This action updates a #${id} declaracionTituloProfesional`;
  }

  remove(id: number) {
    return `This action removes a #${id} declaracionTituloProfesional`;
  }
}
