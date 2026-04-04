import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCiudadanoDto } from './dto/create-ciudadano.dto';
import { UpdateCiudadanoDto } from './dto/update-ciudadano.dto';
import { FindCiudadanosDto } from "./dto/find-ciudadanos.dto";
import { Prisma } from '@prisma/client';

@Injectable()
export class CiudadanoService {
  constructor(private readonly prisma: PrismaService){}

  create(dto: {
    tipo_persona: string;
    nombre_razon_social: string;
    ruc: string;
    dni_ce?: string;
    direccion?: string;
    correo?: string;
    telefono?: string;
  }) {
    //return this.prisma.ciudadano.create({ data: dto });    
  }

  /*findAll() {
    return this.prisma.ciudadano.findMany({ orderBy: { id_ciudadano: 'desc' } });
  }*/
  /*async findAll(query: FindCiudadanosDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.CiudadanoWhereInput = q
  ? {
      OR: [
        {
          nombre_razon_social: {
            contains: q,
            mode: 'insensitive' as const, // literal
          },
        },
        {
          ruc: {
            contains: q,
            // (si quieres case-insensitive aquí también y tu DB lo soporta)
            // mode: 'insensitive' as const,
          },
        },
        {
          dni_ce: {
            contains: q,
            // mode: 'insensitive' as const,
          },
        },
      ],
    }
  : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.ciudadano.count({ where }),
      this.prisma.ciudadano.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_ciudadano: "desc" },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }*/

  /*async findOne(id: number) {
    const ciudadano = await this.prisma.ciudadano.findUnique({ where: { id_ciudadano: id } });
    if (!ciudadano) throw new NotFoundException('Ciudadano no encontrado');
    return ciudadano;
  }*/

  /*async update(id: number, updateCiudadanoDto: UpdateCiudadanoDto) {
    const ciudadano = await this.prisma.ciudadano.findUnique({
      where: { id_ciudadano: id },
    });

    if (!ciudadano) {
      throw new NotFoundException(`Ciudadano con ID ${id} no encontrado`);
    }

    if (updateCiudadanoDto.ruc) {
      const existing = await this.prisma.ciudadano.findFirst({
        where: {
          ruc: updateCiudadanoDto.ruc,
          NOT: { id_ciudadano: id },
        },
      });

      if (existing) {
        throw new ConflictException('El RUC ya está en uso por otro ciudadano');
      }
    }

    return this.prisma.ciudadano.update({
      where: { id_ciudadano: id },
      data: updateCiudadanoDto,
    });
  }*/

  /*update(id: number, updateCiudadanoDto: UpdateCiudadanoDto) {
    return `This action updates a #${id} ciudadano`;
  }*/

  /*async remove(id: number) {
    // 1) Verifica existencia
    const ciudadano = await this.prisma.ciudadano.findUnique({ where: { id_ciudadano: id } });
    if (!ciudadano) throw new NotFoundException('Ciudadano no encontrado');

    // 2) Cuenta referencias (ejemplo con licencias)
    const refs = await this.prisma.licenciaFuncionamiento.count({
      where: { id_ciudadano: id },
    });
    if (refs > 0) {
      throw new ConflictException(`No se puede eliminar: tiene ${refs} licencia(s) vinculada(s).`);
    }

    // 3) Elimina
    await this.prisma.ciudadano.delete({ where: { id_ciudadano: id } });
    return { ok: true };
  }*/

  /*remove(id: number) { 
    return this.prisma.ciudadano.delete({ where: { id_ciudadano: id } });
  }*/
}
