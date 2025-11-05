import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLicenciaFuncionamientoDto } from './dto/create-licencia_funcionamiento.dto';
import { UpdateLicenciaFuncionamientoDto } from './dto/update-licencia_funcionamiento.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LicenciaFuncionamientoService {
  constructor(private readonly prisma: PrismaService){}

  create(dto: {
    id_ciudadano: number,
    numero_expediente?: string,
    numero_resolucion?: string,
    numero_certificado?: string,
    fecha_solicitud?: string,
    fecha_emision?: string,
    fecha_vencimiento?: string,
    nombre_comercial?: string,
    giro_actividad?: string,
    zonificacion?: string,
    area_total_m2?: Decimal,
    riesgo?: string,
    estado?: string,
    codigo_qr?: string
  }) {
    //return this.prisma.licenciaFuncionamiento.create({data:dto})
  }

  findAll() {
    //return this.prisma.licenciaFuncionamiento.findMany({ orderBy: {id_licencia: 'desc'} });
  }

  findOne(id: number) {
    return `This action returns a #${id} licenciaFuncionamiento`;
  }

  update(id: number, updateLicenciaFuncionamientoDto: UpdateLicenciaFuncionamientoDto) {
    return `This action updates a #${id} licenciaFuncionamiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} licenciaFuncionamiento`;
  }
}
