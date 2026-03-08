import { IsString, Length, Matches } from 'class-validator';

export class ConsultaDniDto {
  @IsString()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El DNI solo debe contener números' })
  dni: string;
}