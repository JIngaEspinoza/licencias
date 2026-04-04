import { IsString, IsOptional, IsEmail, Length, Matches } from 'class-validator';
import { IsRUC } from '../../common/validators/ruc.validator';

export class CreateCiudadanoDto {
    @IsString() @Length(1, 20) tipo_persona: 'JURIDICA' | 'NATURAL';
    @IsString() @Length(1, 150) nombre_razon_social: string;

    @IsRUC({ message: 'RUC inválido'}) ruc: string;

    @IsOptional() 
    @Matches(/^\d{8}$/, { message: 'DNI debe tener 8 dígitos' })
    dni_ce?: string;
    
    @IsOptional() @IsString() direccion?: string;
    @IsOptional() @IsEmail({}, { message: 'Correo inválido' }) correo?: string;
    @IsOptional() @Matches(/^(9\d{8}|\d{6,9})$/, { message: 'Teléfono inválido' }) telefono?: string;
}