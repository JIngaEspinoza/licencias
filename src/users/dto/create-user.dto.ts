import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    // Debe venir ya hasheado (coincide con el campo del modelo Prisma)
    @IsString()
    passwordHash: string;

    // En el modelo tiene default(true); aquí es opcional
    @IsOptional()
    @IsBoolean()
    activo?: boolean;

}
