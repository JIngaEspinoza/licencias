import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGiroDto } from './dto/create-giro.dto';
import { UpdateGiroDto } from './dto/update-giro.dto';
import { FindGirosDto } from './dto/find-giro.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GiroService {
  constructor(private readonly prisma: PrismaService){}
  
  async create(dto: CreateGiroDto) {
    return this.prisma.giro.create({data : dto});
  }

  /*async findAll() {
    return this.prisma.giro.findMany({ orderBy: { codigo: 'asc' } });
  }*/
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

  async update(id: string, dto: UpdateGiroDto) {
    const giro = await this.prisma.giro.findUnique({ 
      where: { codigo: id }
    });
    
    if (!giro){
      throw new NotFoundException(`Giro con código ${id} no encontrado`);
    }

    return await this.prisma.giro.update({ where: { codigo: id }, data : dto});
  }

  async remove(id: string) {
    const giro = await this.prisma.giro.findUnique({ where: { codigo: id } });
    if (!giro) throw new NotFoundException('Giro no encontrado');

    await this.prisma.giro.delete({ where: {codigo: id}});
    return { ok: true};
  }
}
