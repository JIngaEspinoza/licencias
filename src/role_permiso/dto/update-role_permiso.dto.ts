import { PartialType } from '@nestjs/mapped-types';
import { CreateRolePermisoDto } from './create-role_permiso.dto';

export class UpdateRolePermisoDto extends PartialType(CreateRolePermisoDto) {}
