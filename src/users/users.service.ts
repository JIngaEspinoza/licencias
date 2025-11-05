import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService){}

  async create(dto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({ data: dto });
      return user; // { id, email, name, createAt }
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
        throw new ConflictException('Email ya registrado');
      }
      throw e;
    }
  }

  /*async findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      include: {
        roles: {
          select: {
            role: {   // Aquí estás seleccionando solo los roles
              select: {
                id: true,    // Seleccionas los campos que necesitas del rol
                nombre: true // Puedes incluir más campos según lo necesites
              }
            }
          }
        }
      }
    });
  }*/
  async findAll(query: FindUserDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.UserWhereInput = q
  ? {
      OR: [
        {
          email: {
            contains: q,
            mode: 'insensitive' as const,
          },
        }
      ],
    }
  : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
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
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({ where: { id }, data: dto });
      return user;
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Usuario no encontrado');
      if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
        throw new ConflictException('Email ya registrado');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Usuario no encontrado');
      throw e;
    }
  }
}
