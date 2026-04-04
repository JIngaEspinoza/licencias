import { IsString } from "class-validator";

export class CreatePermisoDto {
    @IsString()
    nombre: string;
}
