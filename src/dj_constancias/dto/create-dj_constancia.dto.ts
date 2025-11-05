import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601, Min, IsNotEmpty, Matches, IsEmail } from 'class-validator';
export class CreateDjConstanciaDto {
    @IsInt()
    id_declaracion : number;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe ser YYYY-MM-DD' })
    fecha!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    firma_nombre?: string;

    @IsOptional()
    @Matches(/^\d{8}$/, { message: 'firma_dni debe tener 8 dígitos' })
    firma_dni?: string;


    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    firma_correo?: string;


    @IsOptional()
    @Matches(/^\d{9}$/, { message: 'firma_celular debe tener 9 dígitos' })
    firma_celular?: string;


    @IsOptional()
    @IsString()
    observaciones?: string;


    @IsOptional()
    @IsString()
    @MaxLength(255)
    archivo?: string;
}