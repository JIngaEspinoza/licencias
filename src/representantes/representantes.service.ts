import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindRepresentantesDto } from './dto/find-representantes.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RepresentantesService {
  constructor(private readonly prisma: PrismaService){}

  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateRepresentanteDto) {
    /*const representante = await this.prisma.representante.create({ data: createRepresentanteDto });
    return representante;*/
    
    // normalizar campos relevantes
    const numero_documento = this.norm(dto.numero_documento);
    const tipo_documento = this.norm(dto.tipo_documento);
    const nombres = this.norm(dto.nombres);
    const sunarp_partida_asiento = this.norm(dto.sunarp_partida_asiento);

    // validación de duplicado global por número de documento (si viene)
    if (numero_documento) {
      const existing = await this.prisma.representante.findFirst({
        where: { numero_documento },
      });
      if (existing) {
        throw new ConflictException('El número documento ya está en uso por otro representante');
      }
    }

    return this.prisma.representante.create({
      data: {
        id_persona: dto.id_persona,
        nombres,
        tipo_documento,
        numero_documento,
        sunarp_partida_asiento,
      }
    });
  }

  async findAll(query: FindRepresentantesDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.RepresentanteWhereInput = q
  ? {
      OR: [
        {
          nombres: {
            contains: q,
            mode: 'insensitive' as const, // literal
          },
        },
        {
          numero_documento: {
            contains: q
          },
        },
        {
          sunarp_partida_asiento : {
            contains: q
          },
        },
      ],
    }
  : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.representante.count({ where }),
      this.prisma.representante.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_representante: "desc" },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const representante = await this.prisma.representante.findUnique({ where: { id_representante: id } });
    if (!representante) throw new NotFoundException('Persona no encontrado');
    return representante;
  }

  async findManyByPersona(id_persona: number) {
    const reps = await this.prisma.representante.findMany({
      where: { id_persona },
      orderBy: { id_representante: 'asc' },
    });
    if (reps.length === 0) {
      throw new NotFoundException('No hay representantes para esta persona');
    }
    return reps;
  }

  async update(id: number, updateRepresentanteDto: UpdateRepresentanteDto) {
    const representante = await this.prisma.representante.findUnique({
      where: { id_representante: id },
    });

    if (!representante) {
      throw new NotFoundException(`Representante con ID ${id} no encontrado`);
    }

    if (updateRepresentanteDto.numero_documento) {
      const existing = await this.prisma.representante.findFirst({
        where: {
          numero_documento: updateRepresentanteDto.numero_documento,
          NOT: { id_representante: id },
        }
      });

      if (existing) {
        throw new ConflictException('El número documento ya está en uso por otro representante');
      }
    }

    return this.prisma.representante.update({
      where: { id_representante: id },
      data: updateRepresentanteDto,
    });
  }

  async remove(id: number) {
    // 1) Verifica existencia
    const ciudadano = await this.prisma.representante.findUnique({ where: { id_representante: id } });
    if (!ciudadano) throw new NotFoundException('Representante no encontrado');

    // 2) Cuenta referencias (ejemplo con licencias)
    const refs = await this.prisma.expedienteLicencia.count({
      where: { id_representante: id },
    });
    if (refs > 0) {
      throw new ConflictException(`No se puede eliminar: tiene ${refs} Declaraciones Juarada(s) vinculada(s).`);
    }

    // 3) Elimina
    await this.prisma.representante.delete({ where: { id_representante: id } });
    return { ok: true };
  }

}
