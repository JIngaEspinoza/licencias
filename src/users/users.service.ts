import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { FindUserDto } from './dto/find-user.dto';
import * as crypto from 'crypto';
import { UserDto } from './dto/user-dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService){}

  public hashPassword(plain: string): string {
    return crypto.createHash('sha256').update(plain).digest('hex');
  }

  async create(dto: CreateUserDto ) {
    try {
      const user = await this.prisma.user.create({ data: {
        email: dto.email,
        passwordHash: this.hashPassword(dto.passwordHash),
        ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
      } });
      return user;
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

    // Quita passwordHash del data
    const safe = data.map(({ /*passwordHash,*/ ...rest }) => rest);

    return {
      data: safe,
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

  async changePassword(id: number, dto: { password: string }): Promise<void> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { passwordHash: this.hashPassword(dto.password) },
    }).catch((e) => {
      if (e.code === 'P2025') throw new NotFoundException('Usuario no encontrado');
      throw e;
    });
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param email El correo electrónico a buscar.
   * @returns El objeto User o null si no se encuentra.
   */
  async findOneByEmail(email: string): Promise<UserDto | null> {
    // Usamos el método `findOne` del repositorio de TypeORM.
    // Aquí podrías agregar relaciones si las necesitas (ej: roles)
    return this.prisma.user.findUnique({ 
      where: { email },
      // Opcional: Si necesitas las relaciones para el login o validación
      // relations: ['roles', 'roles.role'],
    });
  }

  // user.service.ts (parte del UserService)
  /*async updatePasswordResetToken(userId: number, token: string): Promise<void> {
    // Asume que tu entidad User tiene un campo 'passwordResetToken' (string) 
    // y 'passwordResetExpiresAt' (Date)
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15); // 15 minutos de vigencia

    // 2. Definir los datos a actualizar (Payload)
    const updatePayload = {
      passwordResetToken: token,
      passwordResetExpiresAt: expiration,
    };

    try {
      await this.prisma.user.update({
        where: {
          id: userId
        },
        data: updatePayload
      });
    } catch (error) {
      console.error(`Error al actualizar el token para el usuario ${userId}:`, error);
      throw new InternalServerErrorException('Error al guardar el token de restablecimiento en la base de datos.');
    }


  }*/

  async updatePasswordResetToken(userId: number, plainToken: string): Promise<void> {    
    // 1. GENERAR EL HASH DEL TOKEN (El valor que se guardará)
    // Usamos hashing simple con SHA256 o similar para no guardar el JWT en texto plano.
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

    // 2. Calcular la expiración 
    const expiration = new Date();
    // 15 minutos de vigencia para el token
    expiration.setMinutes(expiration.getMinutes() + 2); 

    try {
      // 3. EL PASO CRUCIAL: CREAR el token en la tabla PasswordResetToken
      await this.prisma.passwordResetToken.create({
        data: {
          userId: userId, // Enlaza el token al usuario
          tokenHash: tokenHash, // Guarda el HASH del token
          expiresAt: expiration, // Guarda la fecha de expiración
          // usedAt y createdAt se gestionan por @default(now()) y la lógica
        },
      });

      // Opcional: Si quieres borrar tokens antiguos/expirados para este usuario
      // await this.prisma.passwordResetToken.deleteMany({
      //     where: { 
      //         userId: userId, 
      //         expiresAt: { lt: new Date() } // Borra expirados
      //     }
      // });

    } catch (error) {
        console.error(`Error al crear el token de restablecimiento para el usuario ${userId}:`, error);
        throw new InternalServerErrorException('Error al guardar el token de restablecimiento en la base de datos.');
    }
  }

}
