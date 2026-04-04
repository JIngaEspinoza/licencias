import { IsNumber } from 'class-validator';
export class CreateRolePermisoDto {
    @IsNumber()
    roleId: number;

    @IsNumber()
    permisoId: number;
}
