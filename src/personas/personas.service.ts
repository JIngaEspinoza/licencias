import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindPersonasDto } from './dto/find-personas.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService){}

  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  // B) Para columnas NOT NULL donde quieres guardar vacío como "" (string vacío)
  private normEmpty = (v?: string | null) => (v ?? "").trim(); // siempre string (posible "")

  async create(dto: CreatePersonaDto) {
    /*const persona = await this.prisma.persona.create({ data: createPersonaDto });
    return persona;*/
    const tipo_persona = dto.tipo_persona;
    const nombre_razon_social = this.normEmpty(dto.nombre_razon_social);
    const ruc = this.norm(dto.ruc);
    const telefono = this.norm(dto.telefono);
    const correo = this.norm(dto.correo);
    const via_tipo = this.norm(dto.via_tipo);
    const via_nombre = this.norm(dto.via_nombre);
    const numero = this.norm(dto.numero);
    const interior = this.norm(dto.interior);
    const mz = this.norm(dto.mz);
    const lt = this.norm(dto.lt);
    const otros = this.norm(dto.otros);
    const urb_aa_hh_otros = this.norm(dto.urb_aa_hh_otros);
    const distrito = this.norm(dto.distrito);
    const provincia = this.norm(dto.provincia);
    const departamento = this.norm(dto.departamento);

    // validación de duplicado global por número de documento (si viene)
    if (ruc) {
      const existing = await this.prisma.persona.findFirst({
        where: { ruc },
      });
      if (existing) {
        throw new ConflictException('El número documento ya está en uso por otro representante');
      }
    }

    return this.prisma.persona.create({
      data: {
        //id_persona: dto.id_persona,
        tipo_persona,
        nombre_razon_social,
        ruc,
        telefono,
        correo,
        via_tipo,
        via_nombre,
        numero,
        interior,
        mz,
        lt,
        otros,
        urb_aa_hh_otros,
        distrito,
        provincia,
        departamento
      }
    });

  }

  async findAll(query: FindPersonasDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.PersonaWhereInput = q
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
            contains: q
          },
        },
        {
          numero_documento: {
            contains: q
          },
        },
      ],
    }
  : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.persona.count({ where }),
      this.prisma.persona.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_persona: "desc" },
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
    const persona = await this.prisma.persona.findUnique({ where: { id_persona: id } });
    if (!persona) throw new NotFoundException('Persona no encontrado');
    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    const persona = await this.prisma.persona.findUnique({
      where: { id_persona: id },
    });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrado`);
    }

    if (updatePersonaDto.ruc) {
      const existing = await this.prisma.persona.findFirst({
        where: {
          ruc: updatePersonaDto.ruc,
          NOT: { id_persona: id },
        },
      });

      if (existing) {
        throw new ConflictException('El RUC ya está en uso por otra persona');
      }
    }

    return this.prisma.persona.update({
      where: { id_persona: id },
      data: updatePersonaDto,
    });
  }

  async remove(id: number) {
    const persona = await this.prisma.persona.findUnique({ where: { id_persona: id } });
    if (!persona) throw new NotFoundException('Persona no encontrado');

    // 2) Cuenta referencias (ejemplo con expediente)
    const [expCount, repCount] = await this.prisma.$transaction([
      this.prisma.expediente.count({ where: { id_persona: id } }),
      this.prisma.representante.count({ where: { id_persona: id } }),
    ]);

    if (expCount > 0 || repCount > 0) {
      const partes: string[] = [];
      if (expCount > 0) partes.push(`${expCount} expediente(s)`);
      if (repCount > 0) partes.push(`${repCount} representante(s)`);
      const detalle = partes.join(' y ');
      throw new ConflictException(`No se puede eliminar: tiene ${detalle} vinculados.`);
    }

    // 3) Intenta eliminar (con captura de FK por si acaso)
    try {
      await this.prisma.persona.delete({ where: { id_persona: id } });
      return { ok: true };
    } catch (e: any) {
      // Prisma: error de restricción FK
      if (e?.code === 'P2003') {
        throw new ConflictException(
          'No se puede eliminar: existen registros relacionados (restricción de clave foránea).'
        );
      }
      throw e;
    }
  }
}
