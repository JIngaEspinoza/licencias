import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventoArchivoDto } from './dto/create-evento_archivo.dto';
import { UpdateEventoArchivoDto } from './dto/update-evento_archivo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventoArchivoService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateEventoArchivoDto) {
    const eventArchivo = await this.prisma.eventoArchivo.create({ 
      data: {
        id_evento_req: dto.id_evento_req,
        nombre_archivo: dto.nombre_archivo,
        ruta_almacen: dto.ruta_almacen,
        extension: dto.extension,
        tamano_bytes: dto.tamano_bytes != null ? BigInt(dto.tamano_bytes) : null,
        hash_archivo: dto.hash_archivo,
        fecha_subida: dto.fecha_subida
      }
     });
    return eventArchivo;
  }

  async findAll() {
    return this.prisma.eventoArchivo.findMany({ orderBy: { id_archivo: 'desc' } });
  }

  async findOne(id: number) {
    const eventArchivo = await this.prisma.eventoArchivo.findUnique({ where: { id_archivo: id } });
    if (!eventArchivo) throw new NotFoundException('No encontrado');
    return eventArchivo;
  }

  async update(id: number, dto: UpdateEventoArchivoDto) {
    return this.prisma.eventoArchivo.update({
      where: { id_archivo: id },
      data: {
        ...(dto.id_evento_req !== undefined ? { id_evento_req: dto.id_evento_req } : {}),
        ...(dto.nombre_archivo !== undefined ? { nombre_archivo: dto.nombre_archivo } : {}),
        ...(dto.ruta_almacen !== undefined ? { ruta_almacen: dto.ruta_almacen } : {}),
        ...(dto.extension !== undefined ? { extension: dto.extension } : {}),
        ...(dto.tamano_bytes !== undefined
          ? { tamano_bytes: dto.tamano_bytes === null
              ? null
              : BigInt(dto.tamano_bytes) }
          : {}),
        ...(dto.hash_archivo !== undefined ? { hash_archivo: dto.hash_archivo } : {}),
        ...(dto.fecha_subida !== undefined ? { fecha_subida: dto.fecha_subida } : {})
      }
    });
  }

  async remove(id: number) {
    await this.prisma.eventoArchivo.delete({ where: { id_archivo: id } });
    return { ok: true };
  }

}
