import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZonificacionDto } from './dto/create-zonificacion.dto';
import { UpdateZonificacionDto } from './dto/update-zonificacion.dto';
import { Prisma } from '@prisma/client';
import { FindZonificacionesDto } from './dto/find-zonificaciones.dto';

@Injectable()
export class ZonificacionService {
  constructor(private readonly prisma: PrismaService){}

  create(dto: CreateZonificacionDto) {
    return this.prisma.zonificacion.create({data:dto});
  }

  /*async findAll() {
    return this.prisma.zonificacion.findMany({orderBy: {codigo: 'asc'}});    
  }*/
  async findAll(query: FindZonificacionesDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.ZonificacionWhereInput = q
  ? {
      OR: [
        {
          codigo: {
            contains: q,
            mode: 'insensitive' as const,
          },
        },
        {
          descripcion: {
            contains: q,
            mode: 'insensitive' as const,
          }
        }
      ],
    }
  : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.zonificacion.count({ where }),
      this.prisma.zonificacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigo: "desc" },
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
    const zonificacion = await this.prisma.zonificacion.findUnique({ where: { codigo: id } });
    if (!zonificacion) throw new NotFoundException('Zonificación no encontrado');
    return zonificacion;
  }

  async update(id: number, dto: UpdateZonificacionDto) {
    const zonificacion = await this.prisma.zonificacion.findUnique({ 
      where: { id_zonificacion: id }
    });
    
    if (!zonificacion){
      throw new NotFoundException(`Zonificación con código ${id} no encontrado`);
    }

    return await this.prisma.zonificacion.update({ where: { id_zonificacion: id }, data : dto});
  }

  async remove(id: number) {
    const zonificacion = await this.prisma.zonificacion.findUnique({ where: { id_zonificacion: id } });
    if (!zonificacion) throw new NotFoundException('Zonificación no encontrado');

    await this.prisma.zonificacion.delete({ where: {id_zonificacion: id}});
    return { ok: true};
  }

  async findAllWithoutPagination(){
    return this.prisma.zonificacion.findMany({ orderBy: { id_zonificacion: 'asc' } });
  }
}
