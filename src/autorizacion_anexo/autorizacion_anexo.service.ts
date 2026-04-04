import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAutorizacionAnexoDto } from './dto/create-autorizacion_anexo.dto';
import { UpdateAutorizacionAnexoDto } from './dto/update-autorizacion_anexo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutorizacionAnexoService {

  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  async create(dto: CreateAutorizacionAnexoDto) {
    const autEstable = await this.prisma.autorizacionAnexo.create({ 
      data: {
        id_auto_viapublica: dto.id_auto_viapublica,
        id_requisito: dto.id_requisito,
        nombre_archivo: dto.nombre_archivo,
        ruta_almacen: dto.ruta_almacen,
        extension: dto.extension,
        tamano_bytes: dto.tamano_bytes != null ? BigInt(dto.tamano_bytes) : null,
        hash_archivo: dto.hash_archivo,
        fecha_subida: dto.fecha_subida
      }
     });
    return autEstable;
  }

  async findAll() {
    const anexos = await this.prisma.autorizacionAnexo.findMany({ 
      orderBy: { id_autorizacion_anexo: 'desc' } 
    });

    // Mapear los resultados para convertir el BigInt a String
    return anexos.map(anexo => ({
      ...anexo,
      // ¡Aquí es donde ocurre la magia manual!
      tamano_bytes: anexo.tamano_bytes !== null 
        ? anexo.tamano_bytes.toString() 
        : null,
    }));
  }

  async findOne(id: number) {
    const autEstable = await this.prisma.autorizacionAnexo.findUnique({ where: { id_autorizacion_anexo: id } });
    if (!autEstable) throw new NotFoundException('No encontrado');
    return autEstable;
  }

  async update(id: number, dto: UpdateAutorizacionAnexoDto) {
    return this.prisma.autorizacionAnexo.update({
      where: { id_autorizacion_anexo: id },
      data: {
        ...(dto.id_auto_viapublica !== undefined ? { id_auto_viapublica: dto.id_auto_viapublica } : {}),
        ...(dto.id_requisito !== undefined ? { id_requisito: dto.id_requisito } : {}),
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
      },
    });
  }

  async remove(id: number) {
    await this.prisma.autorizacionAnexo.delete({ where: { id_autorizacion_anexo: id } });
    return { ok: true };
  }

}
