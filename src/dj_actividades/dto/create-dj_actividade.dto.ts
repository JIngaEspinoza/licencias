import { IsString, IsOptional, IsInt} from 'class-validator';
export class CreateDjActividadeDto {
  @IsInt()
  id_declaracion : number;

  @IsInt()
  id_actividad : number;
}