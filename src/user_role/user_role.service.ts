import { Injectable } from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { UpdateUserRoleDto } from './dto/update-user_role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRoleService {
  constructor(private readonly prisma: PrismaService){}

  async create(dto: CreateUserRoleDto) {
    const userRole = await this.prisma.userRole.create({ data : dto });
    return userRole;
  }

  async findAll() {
    return this.prisma.userRole.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} userRole`;
  }

  update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    return `This action updates a #${id} userRole`;
  }

  async remove(id: number) {
    return await this.prisma.userRole.delete({where: {id}});
  }

  async removeByComposite(userId: number, roleId: number) {
    const { count } = await this.prisma.userRole.deleteMany({
      where: { userId, roleId },
    });
    return { count };
  }

}
