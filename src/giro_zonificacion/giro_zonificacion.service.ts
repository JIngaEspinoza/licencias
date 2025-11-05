import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGiroZonificacionDto } from './dto/create-giro_zonificacion.dto';
import { UpdateGiroZonificacionDto } from './dto/update-giro_zonificacion.dto';
import { FindGirosZonificacionesDto } from './dto/find-giro-zonificacion.dto';
import { Prisma } from '@prisma/client';
import { contains } from 'class-validator';

@Injectable()
export class GiroZonificacionService {
  constructor(private readonly prisma: PrismaService){}
  
  async create(dto: CreateGiroZonificacionDto) {
    return this.prisma.giroZonificacion.create({data : dto});
  }

  async findAll(query: FindGirosZonificacionesDto) {
    //return this.prisma.giroZonificacion.findMany({ orderBy: { estado_codigo: 'asc' } });
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.GiroZonificacionWhereInput = q 
    ? {
        OR: [
          // por estado (si quieres buscar también X/H/O/R)
          { codigo: { equals: q.toUpperCase() } },

          // por GIRO (relación)
          { giro: { is: { codigo: { contains: q, mode: 'insensitive' } } } },
          { giro: { is: { nombre: { contains: q, mode: 'insensitive' } } } },

          // por ZONIFICACION (relación)
          { zonificacion: { is: { codigo: { contains: q, mode: 'insensitive' } } } },
          { zonificacion: { is: { descripcion: { contains: q, mode: 'insensitive' } } } },
        ]
      }
    : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.giroZonificacion.count({ where }),
      this.prisma.giroZonificacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_giro: "asc" },
        // opcional: trae datos de las relaciones para mostrarlos en la lista
        include: {
          giro: { select: { codigo: true, nombre: true } },
          zonificacion: { select: { codigo: true, descripcion: true } },
          estado_uso: { select: { codigo: true, descripcion: true } }, // si tienes el catálogo EstadoUso
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(cod_giro: number, cod_zonificaion: number) {
    const giro_zonificacion = await this.prisma.giroZonificacion.findUnique({ 
      where: { //id_giro_zonificacion: cod_giro
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificaion
        }
      }
    });
    if (!giro_zonificacion) throw new NotFoundException('Giro zonificación no encontrado');
    return giro_zonificacion;
  }

  async update(cod_giro: number, cod_zonificaion: number, dto: UpdateGiroZonificacionDto) {
    const giro_zonificacion = await this.prisma.giroZonificacion.findUnique({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificaion
        }
      }
    });
    
    if (!giro_zonificacion){
      throw new NotFoundException(`Giro Zonificacicón con código ${cod_giro}${cod_zonificaion} no encontrado`);
    }

    return await this.prisma.giroZonificacion.update({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificaion
        }
      },
      data : dto
    });
  }

  async remove(cod_giro: number, cod_zonificaion: number) {
    const giro_zonificacion = await this.prisma.giroZonificacion.findUnique({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificaion
        }
      }
    });

    if (!giro_zonificacion) throw new NotFoundException('Giro Zonificacicón no encontrado');

    await this.prisma.giroZonificacion.delete({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificaion
        }
      }
    });
    return { ok: true};
  }
}