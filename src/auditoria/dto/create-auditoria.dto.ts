import { Prisma } from '@prisma/client';
import { IsString, IsOptional, IsInt, IsDateString, IsObject, MaxLength, IsIn, IsISO8601 } from 'class-validator';

export const ACCIONES_AUDITORIA = ['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] as const;
type AccionAuditoria = (typeof ACCIONES_AUDITORIA)[number];

export class CreateAuditoriaDto {   
    @IsString()
    @MaxLength(60)
    tabla_afectada!: string;
    
    @IsString()
    @MaxLength(60)
    id_registro!: string;
    
    @IsString()
    @IsIn(ACCIONES_AUDITORIA as unknown as string[])
    accion!: AccionAuditoria;
    
    @IsOptional()
    @IsString()
    @MaxLength(100)
    usuario?: string;
    
    @IsOptional()
    @IsISO8601()
    fecha?: string;

    @IsOptional()
    cambios?: Prisma.InputJsonValue;
}