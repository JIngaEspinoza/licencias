import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RolePermisoService } from './role_permiso.service';
import { CreateRolePermisoDto } from './dto/create-role_permiso.dto';
import { UpdateRolePermisoDto } from './dto/update-role_permiso.dto';

@Controller('role-permiso')
export class RolePermisoController {
  constructor(private readonly rolePermisoService: RolePermisoService) {}

  @Post()
  create(@Body() createRolePermisoDto: CreateRolePermisoDto) {
    return this.rolePermisoService.create(createRolePermisoDto);
  }

  @Get()
  findAll() {
    return this.rolePermisoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolePermisoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolePermisoDto: UpdateRolePermisoDto) {
    return this.rolePermisoService.update(+id, updateRolePermisoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolePermisoService.remove(+id);
  }

  @Delete('roles/:roleId/permisos/:permisoId')
  async removeByComposite(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number,
  ) {
    return this.rolePermisoService.removeByComposite(roleId, permisoId);
  }
}
