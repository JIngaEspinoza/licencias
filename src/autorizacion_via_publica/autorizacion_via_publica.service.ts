import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAutorizacionViaPublicaDto } from './dto/create-autorizacion_via_publica.dto';
import { UpdateAutorizacionViaPublicaDto } from './dto/update-autorizacion_via_publica.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AutorizacionViaPublica } from '@prisma/client';
import { FindAutorizacionViaPublicaDto } from './dto/find-autorizacion_via_publica.dto';

@Injectable()
export class AutorizacionViaPublicaService {
  constructor(private readonly prisma: PrismaService){}
  
  private norm(v?: string | null) {
    const s = (v ?? '').trim();
    return s === '' ? null : s;
  }

  /*async create(dto: CreateAutorizacionViaPublicaDto) {
    const autoViaPublica = await this.prisma.autorizacionViaPublica.create({ data: dto });
    return autoViaPublica;
  }*/

  async create(createDto: CreateAutorizacionViaPublicaDto) {
    
    // Desestructurar las relaciones anidadas del DTO
    const { 
      autorizacion_establecimiento, 
      autorizacion_anexo, 
      ...autorizacionData // Campos directos (id_expediente, modalidad, etc.)
    } = createDto;

    // Mapear los datos del establecimiento para el 'create' anidado
    const establecimientoCreate = {
      // Usamos el campo 'create' de Prisma para crear el establecimiento
      create: {
        ...autorizacion_establecimiento,
        // Si el campo lat/lng es Decimal en Prisma, se maneja automáticamente
        // si se recibe como 'number' en el DTO.
      },
    };

    // Mapear los datos de los anexos para el 'createMany' o 'create' anidado
    // Nota: Como 'AutorizacionEstablecimiento' es 1:N en Prisma, usamos 'createMany'
    // si queremos insertar múltiples registros relacionados en una sola operación.
    
    const anexosCreateMany = autorizacion_anexo.length > 0
      ? {
          createMany: {
            data: autorizacion_anexo.map(anexo => ({
              ...anexo,
              // Convertir tamano_bytes de string (del DTO) a BigInt para Prisma
              tamano_bytes: anexo.tamano_bytes ? BigInt(anexo.tamano_bytes) : null,
              // id_auto_viapublica se establece automáticamente por la anidación
            })),
            skipDuplicates: true, // Opcional, dependiendo de la lógica de negocio
          },
        }
      : {}; // Si no hay anexos, pasamos un objeto vacío

    // Ejecutar la creación anidada
    const nuevaAutorizacion = await this.prisma.autorizacionViaPublica.create({
      data: {
        ...autorizacionData,
        // Relaciones
        autorizacion_establecimiento: establecimientoCreate,
        autorizacion_anexo: anexosCreateMany,
      },
      // Opcional: Incluir las relaciones en la respuesta
      include: {
        autorizacion_establecimiento: true,
        autorizacion_anexo: true,
      },
    });

    return nuevaAutorizacion;
  }

  /*async findAll() {
    return this.prisma.autorizacionViaPublica.findMany({ orderBy: { id_auto_viapublica: 'desc' } });
  }*/

  /*async findAll() {
    return this.prisma.autorizacionViaPublica.findMany({
      orderBy: { 
        id_auto_viapublica: 'desc' 
      },
      include: {
        expediente: true, 
        autorizacion_establecimiento: true, 
        autorizacion_anexo: true, 
      },
    });
  }*/

  /*async findAll() {
    return this.prisma.autorizacionViaPublica.findMany({
      orderBy: { 
        id_auto_viapublica: 'desc' 
      },
      include: {
        expediente: {
          select: {
            id_expediente: true,
            numero_expediente: true, // Por ejemplo, solo el nombre
            // ... otros campos esenciales
          },
        },
        autorizacion_establecimiento: true, 
        autorizacion_anexo: {
          select: {
            id_autorizacion_anexo: true,
            ruta_almacen: true,
            // Si tamano_bytes es BigInt y ya tienes el fix global, puedes incluirlo
            tamano_bytes: true, 
          },
        },
      },
    });
  }*/

  async findAll(query: FindAutorizacionViaPublicaDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    // 1. Obtener los datos completos de Prisma
    const autorizaciones = await this.prisma.autorizacionViaPublica.findMany({
      orderBy: { 
        id_auto_viapublica: 'desc' 
      },
      include: {
        expediente: {
          select: {
            id_expediente: true,
            numero_expediente: true,
            id_persona: true,
            persona: {
              select: {
                nombre_razon_social: true,
              }
            }
          },
        },
        autorizacion_establecimiento: true, 
        autorizacion_anexo: {
          select: {
            id_autorizacion_anexo: true,
            ruta_almacen: true,
            // Incluimos el BigInt
            tamano_bytes: true, 
          },
        },
      },
    }) as (AutorizacionViaPublica & { 
      autorizacion_anexo: { tamano_bytes: bigint | null }[]; 
      // Añade los tipos de tus otras relaciones si usas tipado estricto
    })[];

    // 2. Mapear la respuesta para convertir los BigInt anidados a string
    const data = autorizaciones.map(autorizacion => ({
      ...autorizacion,
      
      // Mapeo anidado: Iterar sobre el array de anexos
      autorizacion_anexo: autorizacion.autorizacion_anexo.map(anexo => ({
        ...anexo,
        
        // Aplicar la conversión de BigInt a String aquí
        tamano_bytes: anexo.tamano_bytes !== null 
          ? anexo.tamano_bytes.toString() 
          : null,
      })),
    }));

    const total = await this.prisma.autorizacionViaPublica.count();
  
    return {
      total,
      page,
      limit,
      data,
    };
  }

  async findOne(id: number) {
    const autoViaPublica = await this.prisma.autorizacionViaPublica.findUnique({ where: { id_auto_viapublica: id } });
    if (!autoViaPublica) throw new NotFoundException('No encontrado');
    return autoViaPublica;
  }

  /*async update(id: number, updateEventoRequisitoDto: UpdateAutorizacionViaPublicaDto) {
    return this.prisma.autorizacionViaPublica.update({
      where: { id_auto_viapublica: id },
      data: updateEventoRequisitoDto,
    });
  }*/

  async remove(id: number) {
    await this.prisma.autorizacionViaPublica.delete({ where: { id_auto_viapublica: id } });
    return { ok: true };
  }

}
