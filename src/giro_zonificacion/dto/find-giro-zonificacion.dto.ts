import { IsOptional, IsString, IsInt, Min, Max, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class FindGirosZonificacionesDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}