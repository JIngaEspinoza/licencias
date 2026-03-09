import { IsString, Length, Matches } from 'class-validator';

export class ConsultaCarneExtDto {
  @IsString()
  @Length(9, 9, { message: 'El Carne de Extranjería debe tener exactamente 9 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El Carne de Extranjería solo debe contener números' })
  carneExtranjeria: string;
}