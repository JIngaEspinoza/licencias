import { Module } from '@nestjs/common';
import { RolePermisoService } from './role_permiso.service';
import { RolePermisoController } from './role_permiso.controller';

@Module({
  controllers: [RolePermisoController],
  providers: [RolePermisoService],
})
export class RolePermisoModule {}
