import { IsNumber } from "class-validator"

export class CreateUserRoleDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    roleId: number;
}
