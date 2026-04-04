import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGiroDto } from './dto/create-giro.dto';
import { UpdateGiroDto } from './dto/update-giro.dto';
import { FindGirosDto } from './dto/find-giro.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GiroService {
  constructor(private readonly prisma: PrismaService){}

  private selectGiroCompleto() {
    return {
      select: {
        id_giro: true,
        codigo: true,
        nombre: true,
        riesgo_base: true,
        giro_zonificacion: {
          select: {
            id_giro_zonificacion: true,
            id_zonificacion: true,
            zonificacion: { select: { codigo: true } },
            estado_uso: { select: { codigo: true, descripcion: true } },
          },
        },
      },
    };
  }
  
  async create(dto: CreateGiroDto) {
    return this.prisma.giro.create({data : dto});
  }

  async findAll(query: FindGirosDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.GiroWhereInput = q
  ? {
      OR: [
        {
          codigo: {
            contains: q,
            mode: 'insensitive' as const,
          },
        },
        {
          nombre: {
            contains: q,
            mode: 'insensitive' as const,
          },
        }
      ],
    }
  : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.giro.count({ where }),
      this.prisma.giro.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigo: "asc" },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const giro = await this.prisma.giro.findUnique({ where: { codigo: id } });
    if (!giro) throw new NotFoundException('Giro no encontrado');
    return giro;
  }

  async update(id: number, dto: UpdateGiroDto) {
    const giro = await this.prisma.giro.findUnique({ 
      where: { id_giro: id }
    });
    
    if (!giro){
      throw new NotFoundException(`Giro con código ${id} no encontrado`);
    }

    return await this.prisma.giro.update({ where: { id_giro: id }, data : dto});
  }

  async remove(id: number) {
    const giro = await this.prisma.giro.findUnique({ where: { id_giro: id } });
    if (!giro) throw new NotFoundException('Giro no encontrado');

    await this.prisma.giro.delete({ where: {id_giro: id}});
    return { ok: true};
  }

  async findAllWithoutPagination(){
    return this.prisma.giro.findMany({ orderBy: { id_giro: 'asc' } });
  }

  async buscarGirosParaModal(termino?: string) {
    console.log(termino);
    return this.prisma.giro.findMany({
      // Inyectamos el molde aquí
      ...this.selectGiroCompleto(), 
      
      // Aplicamos la lógica de búsqueda para miles de registros      
      where: termino ? {
        OR: [
          { nombre: { contains: termino, mode: 'insensitive' } },
          { codigo: { contains: termino, mode: 'insensitive' } }
        ]
      } : {},
      
      // Importante para no saturar el Front con miles de datos de golpe
      take: 50, 
      orderBy: { nombre: 'asc' }
    });
  }


}
