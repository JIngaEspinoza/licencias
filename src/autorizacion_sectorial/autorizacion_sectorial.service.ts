import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAutorizacionSectorialDto } from './dto/create-autorizacion_sectorial.dto';
import { UpdateAutorizacionSectorialDto } from './dto/update-autorizacion_sectorial.dto';

@Injectable()
export class AutorizacionSectorialService {
  constructor(private readonly prisma: PrismaService){}
  create(dto: {
    id_autorizacion: number,
    id_licencia: number,
    entidad_otorgante?: string,
    denominacion?: string,
    numero_autorizacion?: string,
    fecha_autorizacion?: string
  }) {
    //return this.prisma.autorizacionSectorial.create({data:dto})
  }

  findAll() {
    //return this.prisma.autorizacionSectorial.findMany({orderBy: {id_autorizacion: 'desc'}});
  }

  findOne(id: number) {
    return `This action returns a #${id} autorizacionSectorial`;
  }

  update(id: number, updateAutorizacionSectorialDto: UpdateAutorizacionSectorialDto) {
    return `This action updates a #${id} autorizacionSectorial`;
  }

  remove(id: number) {
    return `This action removes a #${id} autorizacionSectorial`;
  }
}
