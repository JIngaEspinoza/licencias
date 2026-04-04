import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEvaluacionTecnicaDto } from './dto/create-evaluacion_tecnica.dto';
import { UpdateEvaluacionTecnicaDto } from './dto/update-evaluacion_tecnica.dto';

@Injectable()
export class EvaluacionTecnicaService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_evaluacion: number,
    id_licencia: number,
    area_responsable?: string,
    resultado?: string,
    fecha_evaluacion?: string,
    observaciones?: string
  }) {
    //return this.prisma.evaluacionTecnica.create({data:dto});
  }

  findAll() {
    //return this.prisma.evaluacionTecnica.findMany({orderBy: {id_evaluacion: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} evaluacionTecnica`;
  }

  update(id: number, updateEvaluacionTecnicaDto: UpdateEvaluacionTecnicaDto) {
    return `This action updates a #${id} evaluacionTecnica`;
  }

  remove(id: number) {
    return `This action removes a #${id} evaluacionTecnica`;
  }
}
