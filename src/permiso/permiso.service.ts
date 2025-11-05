import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindPermisoDto } from './dto/find-permiso.dto';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PermisoService {
  constructor(private readonly prisma: PrismaService){}

  async create(dto: CreatePermisoDto) {
    try {
      const permisoExistente = await this.prisma.permiso.findUnique({
        where: {
          nombre: dto.nombre,
        }
      });

      if (permisoExistente) {
        throw new Error("Este permiso ya existe.");
      }

      const permiso = await this.prisma.permiso.create({
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error("Este permiso ya existe.");
      }
      throw error;
    }
  }

  async findAll(query: FindPermisoDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.PermisoWhereInput = q
  ? {
      OR: [
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
      this.prisma.permiso.count({ where }),
      this.prisma.permiso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findAllWithoutPagination(){
    return this.prisma.permiso.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const permiso = await this.prisma.permiso.findUnique({ where: { id: id } });
    if (!permiso) throw new NotFoundException('Permiso no encontrado');
    return permiso;
  }

  async update(id: number, updatePermisoDto: UpdatePermisoDto) {
    const permiso = await this.prisma.permiso.findUnique({
      where: { id: id },
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    try {
      return await this.prisma.permiso.update({
        where: { id: id },
        data: updatePermisoDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`El permiso con el nombre '${updatePermisoDto.nombre}' ya existe.`);
        }
      }

      throw new Error('Error desconocido al actualizar el permiso.');
    }
  }

  async remove(id: number) {
    const permiso = await this.prisma.permiso.findUnique({ where: { id: id } });
    if (!permiso) throw new NotFoundException('Permiso no encontrado');

    // Validar si existe en rolePermiso
    const [count] = await this.prisma.$transaction([
      this.prisma.rolePermiso.count({ where: { permisoId: id } }),
    ]);

    if (count > 0) {
      const partes: string[] = [];
      if (count > 0) partes.push(`${count} roles(s)`);
      throw new ConflictException(`No se puede eliminar: tiene ${partes} vinculados.`);
    }

    try {
      await this.prisma.permiso.delete({ where: { id: id } });
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
