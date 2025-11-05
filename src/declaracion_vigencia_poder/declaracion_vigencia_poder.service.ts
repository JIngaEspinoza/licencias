import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeclaracionVigenciaPoderDto } from './dto/create-declaracion_vigencia_poder.dto';
import { UpdateDeclaracionVigenciaPoderDto } from './dto/update-declaracion_vigencia_poder.dto';

@Injectable()
export class DeclaracionVigenciaPoderService {
  constructor(private readonly prisma: PrismaService){}
  
  create(dto: {
    id_vigencia: number,
    id_licencia: number,
    representante_legal?: string,
    partida_sunarp?: string,
    asiento?: string,
    fecha?: string
  }) {
    //return this.prisma.declaracionVigenciaPoder.create({data:dto});
  }

  findAll() {
    //return this.prisma.declaracionVigenciaPoder.findMany({orderBy: {id_vigencia: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} declaracionVigenciaPoder`;    
  }

  update(id: number, updateDeclaracionVigenciaPoderDto: UpdateDeclaracionVigenciaPoderDto) {
    return `This action updates a #${id} declaracionVigenciaPoder`;
  }

  remove(id: number) {
    return `This action removes a #${id} declaracionVigenciaPoder`;
  }
}
