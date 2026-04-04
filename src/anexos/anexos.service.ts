import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnexoDto } from './dto/create-anexo.dto';
import { UpdateAnexoDto } from './dto/update-anexo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnexosService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateAnexoDto) {
    const anexo = await this.prisma.anexos.create({
      data: {
        id_expediente: dto.id_expediente,
        nombre: dto.nombre ?? null,
        ruta: dto.ruta,
        extension: dto.extension ?? null,
        // ✅ convertir string → BigInt (o dejar null)
        tamano_bytes: dto.tamano_bytes != null ? BigInt(dto.tamano_bytes) : null,
        hash_archivo: dto.hash_archivo ?? null,
        ...(dto.fecha_subida ? { fecha_subida: new Date(dto.fecha_subida) } : {}),
        tipo_anexo: dto.tipo_anexo ?? null,
      },
    });
    return anexo;
  }

  async findAll() {
    return this.prisma.anexos.findMany({ orderBy: { id_anexo: 'desc' } });
  }

  async findOne(id: number) {
    const anexo = await this.prisma.anexos.findUnique({ where: { id_anexo: id } });
    if (!anexo) throw new NotFoundException('No encontrado');
    return anexo;
  }

  async update(id: number, dto: UpdateAnexoDto) {
    return this.prisma.anexos.update({
      where: { id_anexo: id },
      data: {
        ...(dto.id_expediente !== undefined ? { id_expediente: dto.id_expediente } : {}),
        ...(dto.nombre        !== undefined ? { nombre: dto.nombre } : {}),
        ...(dto.ruta          !== undefined ? { ruta: dto.ruta } : {}),
        ...(dto.extension     !== undefined ? { extension: dto.extension } : {}),
        ...(dto.tamano_bytes !== undefined
          ? { tamano_bytes: dto.tamano_bytes === null
              ? null
              : BigInt(dto.tamano_bytes) }
          : {}),
        ...(dto.hash_archivo  !== undefined ? { hash_archivo: dto.hash_archivo } : {}),
        ...(dto.fecha_subida  !== undefined
          ? { fecha_subida: dto.fecha_subida
              ? new Date(dto.fecha_subida)
              : undefined }
          : {}),
        ...(dto.tipo_anexo    !== undefined ? { tipo_anexo: dto.tipo_anexo } : {}),
      }
    });
  }

  async remove(id: number) {
    await this.prisma.anexos.delete({ where: { id_anexo: id } });
    return { ok: true };
  }
}