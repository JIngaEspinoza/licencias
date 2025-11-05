import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEstadoUsoDto } from './dto/create-estado_uso.dto';
import { UpdateEstadoUsoDto } from './dto/update-estado_uso.dto';
import { FindUsosDto } from './dto/find-estado_uso.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EstadoUsoService {
  constructor(private readonly prisma: PrismaService){}

  async create(dto: CreateEstadoUsoDto) {
    return this.prisma.estadoUso.create({data : dto});
  }

  /*async findAll() {
    return this.prisma.estadoUso.findMany({ orderBy: { codigo: 'asc' } });
  }*/

  async findAll(query: FindUsosDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.EstadoUsoWhereInput = q
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
          },
        }
      ],
    }
  : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.estadoUso.count({ where }),
      this.prisma.estadoUso.findMany({
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
    const estado_uso = await this.prisma.estadoUso.findUnique({ where: { codigo: id } });
    if (!estado_uso) throw new NotFoundException('Estado uso no encontrado');
    return estado_uso;
  }

  async update(id: string, dto: UpdateEstadoUsoDto) {
    const estado_uso = await this.prisma.estadoUso.findUnique({ 
      where: { codigo: id }
    });
    
    if (!estado_uso){
      throw new NotFoundException(`Estado uso con código ${id} no encontrado`);
    }

    return await this.prisma.estadoUso.update({ where: { codigo: id }, data : dto});
  }

  async remove(id: string) {
    const estado_uso = await this.prisma.estadoUso.findUnique({ where: { codigo: id } });
    if (!estado_uso) throw new NotFoundException('Estado uso no encontrado');

    await this.prisma.estadoUso.delete({ where: {codigo: id}});
    return { ok: true};
  }
}
