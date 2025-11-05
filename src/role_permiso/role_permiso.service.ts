import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolePermisoDto } from './dto/create-role_permiso.dto';
import { UpdateRolePermisoDto } from './dto/update-role_permiso.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolePermisoService {
  constructor(private readonly prisma: PrismaService){}

  async create(dto: CreateRolePermisoDto) {
    const rolePermiso = await this.prisma.rolePermiso.create({ data: dto });
    return rolePermiso;
  }

  async findAll() {
    return this.prisma.rolePermiso.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} rolePermiso`;
  }

  update(id: number, updateRolePermisoDto: UpdateRolePermisoDto) {
    return `This action updates a #${id} rolePermiso`;
  }

  async remove(id: number){
    return await this.prisma.rolePermiso.delete({ where: {id}});
  }

  async removeByComposite(roleId: number, permisoId: number) {
    const { count } = await this.prisma.rolePermiso.deleteMany({
      where: { roleId, permisoId },
    });
    return { count };
  }
}
