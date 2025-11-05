import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FindRoleDto } from './dto/find-role.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService){}
  
  async create(dto: CreateRoleDto) {

    const exists = await this.prisma.role.findUnique({
      where: { nombre: dto.nombre },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('El nombre del rol ya existe');
    }

    try {
      return await this.prisma.role.create({
        data: { nombre: dto.nombre },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('El nombre del rol ya existe');
      }
      throw e;
    }
  }

  async findAll(query: FindRoleDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.RoleWhereInput = q
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
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
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

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id: id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: id },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    try {
      return await this.prisma.role.update({
        where: { id: id },
        data: updateRoleDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`El rol con el nombre '${updateRoleDto.nombre}' ya existe.`);
        }
      }

      throw new Error('Error desconocido al actualizar el rol.');
    }
  }

  async remove(id: number) {
     const role = await this.prisma.role.findUnique({ where: { id: id } });
    if (!role) throw new NotFoundException('Permiso no encontrado');

    // Validar si existe en userRole
    const [count] = await this.prisma.$transaction([
      this.prisma.userRole.count({ where: { roleId: id } }),
    ]);

    if (count > 0) {
      const partes: string[] = [];
      if (count > 0) partes.push(`${count} usuario(s)`);
      throw new ConflictException(`No se puede eliminar: tiene ${partes} vinculados.`);
    }

    try {
      await this.prisma.role.delete({ where: { id: id } });
      return { ok: true };
    } catch (e: any) {
      if (e?.code === 'P2003') {
        throw new ConflictException(
          'No se puede eliminar: existen registros relacionados (restricción de clave foránea).'
        );
      }
      throw e;
    }
  }
}
