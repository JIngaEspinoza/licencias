import { IsBoolean, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class UserDto {
    @IsInt()
    id: number;

    @IsEmail()
    email: string;

    // Debe venir ya hasheado (coincide con el campo del modelo Prisma)
    @IsString()
    passwordHash: string;

}