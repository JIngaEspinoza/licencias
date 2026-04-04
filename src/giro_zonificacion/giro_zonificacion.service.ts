import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGiroZonificacionDto } from './dto/create-giro_zonificacion.dto';
import { UpdateGiroZonificacionDto } from './dto/update-giro_zonificacion.dto';
import { FindGirosZonificacionesDto } from './dto/find-giro-zonificacion.dto';
import { Prisma } from '@prisma/client';
import { contains } from 'class-validator';
import { MatrixResponse } from './interfaces/matrix-response.interface';

// Interfaces para mantener la claridad del código
export interface GiroRelacion {
  id_giro: number; // Mapea a id_giro
  codigo: string;
  nombre: string;
}

export interface ZonificacionRelacion {
  id_zonificacion: number; // Mapea a id_zonificacion
  codigo: string;
  descripcion: string | null;
}

export interface GiroZonificacionRelacion {
  id_giro: number;
  id_zonificacion: number;
  codigo: string | null;
}

export interface AsignacionesMatrix {
  [id_giro: number]: {
    [id_zonificacion: number]: string; // 'A', 'C', 'I', o ""
  };
}


@Injectable()
export class GiroZonificacionService {
  constructor(private readonly prisma: PrismaService){}
  
  async create(dto: CreateGiroZonificacionDto) {
    return this.prisma.giroZonificacion.create({data : dto});
  }

  async findAll(query: FindGirosZonificacionesDto) {
    //return this.prisma.giroZonificacion.findMany({ orderBy: { estado_codigo: 'asc' } });
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const q = query.q?.trim() ?? '';

    const where: Prisma.GiroZonificacionWhereInput = q 
    ? {
        OR: [
          // por estado (si quieres buscar también X/H/O/R)
          { codigo: { equals: q.toUpperCase() } },

          // por GIRO (relación)
          { giro: { is: { codigo: { contains: q, mode: 'insensitive' } } } },
          { giro: { is: { nombre: { contains: q, mode: 'insensitive' } } } },

          // por ZONIFICACION (relación)
          { zonificacion: { is: { codigo: { contains: q, mode: 'insensitive' } } } },
          { zonificacion: { is: { descripcion: { contains: q, mode: 'insensitive' } } } },
        ]
      }
    : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.giroZonificacion.count({ where }),
      this.prisma.giroZonificacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_giro: "asc" },
        // opcional: trae datos de las relaciones para mostrarlos en la lista
        include: {
          giro: { select: { codigo: true, nombre: true } },
          zonificacion: { select: { codigo: true, descripcion: true } },
          estado_uso: { select: { codigo: true, descripcion: true } }, // si tienes el catálogo EstadoUso
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /*async findOne(cod_giro: number, cod_zonificaion: number) {
    const giro_zonificacion = await this.prisma.giroZonificacion.findUnique({ 
      where: { //id_giro_zonificacion: cod_giro
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificaion
        }
      }
    });
    if (!giro_zonificacion) throw new NotFoundException('Giro zonificación no encontrado');
    return giro_zonificacion;
  }*/

  /*async findByCodigo(cod_giro: number) {
    const giro_zonificacion = await this.prisma.giroZonificacion.findMany({ 
      where: { 
        id_giro: cod_giro
      }
    });
    if (!giro_zonificacion) throw new NotFoundException('Giro zonificación no encontrado');
    return giro_zonificacion;
  }*/

  async update(cod_giro: number, cod_zonificacion: number, dto: UpdateGiroZonificacionDto) {
    const giro_zonificacion = await this.prisma.giroZonificacion.findUnique({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificacion
        }
      }
    });
    
    if (!giro_zonificacion){
      throw new NotFoundException(`Giro Zonificacicón con código ${cod_giro}${cod_zonificacion} no encontrado`);
    }

    return await this.prisma.giroZonificacion.update({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificacion
        }
      },
      data : dto
    });
  }

  async remove(cod_giro: number, cod_zonificacion: number) {
    const giro_zonificacion = await this.prisma.giroZonificacion.findUnique({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificacion
        }
      }
    });

    if (!giro_zonificacion) throw new NotFoundException('Giro Zonificacicón no encontrado');

    await this.prisma.giroZonificacion.delete({ 
      where: {
        uq_gz_giro_zon: {
          id_giro: cod_giro,
          id_zonificacion: cod_zonificacion
        }
      }
    });
    return { ok: true};
  }

  /**
   * Obtiene todos los catálogos y las relaciones GiroZonificacion existentes.
   */
  async getMatrixRawData(): Promise<{
      giros: GiroRelacion[];
      zonificaciones: ZonificacionRelacion[];
      relaciones: GiroZonificacionRelacion[];
    }> 
  {
    // Ejecutamos las consultas de forma concurrente
    const [girosDb, zonificacionesDb, relacionesDb] = await this.prisma.$transaction([
      // 1. Obtener Giros
      this.prisma.giro.findMany({
        select: { id_giro: true, codigo: true, nombre: true }
      }),
      // 2. Obtener Zonificaciones
      this.prisma.zonificacion.findMany({
        select: { id_zonificacion: true, codigo: true, descripcion: true }
      }),
      // 3. Obtener Relaciones Existentes
      this.prisma.giroZonificacion.findMany({
        select: {
          id_giro: true,
          id_zonificacion: true,
          codigo: true, // Esto es el EstadoUso.codigo (puede ser NULL)
        },
      }),
    ]);

    // Mapeamos a interfaces simples para el uso en el frontend
    const giros = girosDb.map(g => ({ id_giro: g.id_giro, codigo: g.codigo, nombre: g.nombre }));
    const zonificaciones = zonificacionesDb.map(z => ({ 
      id_zonificacion: z.id_zonificacion, 
      codigo: z.codigo, 
      descripcion: z.descripcion 
    }));
    const relaciones: GiroZonificacionRelacion[] = relacionesDb.map(r => ({
      id_giro: r.id_giro,
      id_zonificacion: r.id_zonificacion,
      codigo: r.codigo,
    }));

    return { giros, zonificaciones, relaciones };
  }

  /**
   * Transforma la data plana en la estructura de matriz ASIGNACIONES_INICIALES.
   */
  private buildAsignacionesMatrix(
    giros: GiroRelacion[],
    zonificaciones: ZonificacionRelacion[],
    relaciones: GiroZonificacionRelacion[]
  ): AsignacionesMatrix {
      
    const relacionesMap = new Map<string, string | null>();
    relaciones.forEach(r => {
      relacionesMap.set(`${r.id_giro}-${r.id_zonificacion}`, r.codigo);
    });

    const matrix: AsignacionesMatrix = {};
    
    // Iteramos sobre todas las combinaciones posibles (CROSS JOIN virtual)
    giros.forEach(giro => {
      const idGiro = giro.id_giro;
      matrix[idGiro] = {};

      zonificaciones.forEach(zona => {
        const idZona = zona.id_zonificacion;
        const key = `${idGiro}-${idZona}`;
        
        const codigoEstado = relacionesMap.get(key);

        // Si es null o undefined, enviamos cadena vacía ("")
        matrix[idGiro][idZona] = codigoEstado || ""; 
      });
    });

    return matrix;
  }

  /**
   * Función principal para obtener todos los datos necesarios para la vista de asignación de usos.
   */
  /*public async getMatrixViewData() {
    const { giros, zonificaciones, relaciones } = await this.getMatrixRawData();
    
    const asignaciones = this.buildAsignacionesMatrix(giros, zonificaciones, relaciones);

    return {
      girosData: giros,
      zonificacionesData: zonificaciones,
      initialAsignaciones: asignaciones,
    };
  }*/

  async getMatrixViewData(query: FindGirosZonificacionesDto): Promise<MatrixResponse> {
    // 1. Manejo de Paginación y Búsqueda
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;
    const q = query.q?.trim() ?? '';

    // 2. Definición del Filtro (WHERE) para los Giros
    const giroWhere: Prisma.GiroWhereInput = q
      ? {
          OR: [
            { codigo: { contains: q, mode: 'insensitive' as const } },
            { nombre: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // 3. Ejecutar Transacciones de Base de Datos
    const [totalGiros, girosPaginados, zonificacionesData] = await this.prisma.$transaction([
      this.prisma.giro.count({ where: giroWhere }),
      this.prisma.giro.findMany({
        where: giroWhere,
        skip: skip,
        take: limit,
        orderBy: { codigo: 'asc' },
      }),
      this.prisma.zonificacion.findMany({
        orderBy: { codigo: 'asc' },
      }),
    ]);

    // 4. Obtener ASIGNACIONES SÓLO para los Giros PAGINADOS
    // (Asegúrate de que el campo 'id' de tu modelo Giro sea el correcto)
    const giroIds = girosPaginados.map(g => g.id_giro); 
    
    // NOTA: Renombré 'codigo' a 'estado_codigo' para claridad, si ese es el campo correcto
    // que tiene el código 'P', 'A', 'N'. Si no, déjalo como 'codigo'.
    const asignacionesRaw = await this.prisma.giroZonificacion.findMany({
      where: { id_giro: { in: giroIds } },
      select: { 
        id_giro: true, 
        id_zonificacion: true, 
        codigo: true // Usar el nombre de campo real que contiene 'P', 'A', 'N'
      }
    });

    // 5. REEMPLAZO DE LA LÓGICA MANUAL POR LA FUNCIÓN EXISTENTE
    // Asumo que 'this.buildAsignacionesMatrix' acepta la lista de relaciones crudas.
    //const initialAsignaciones = this.buildAsignacionesMatrix(asignacionesRaw); 
    
    // Si tu función buildAsignacionesMatrix requería los giros y zonificaciones:
    const initialAsignaciones = this.buildAsignacionesMatrix(girosPaginados, zonificacionesData, asignacionesRaw);
    
    // Si tu buildAsignacionesMatrix ya hacía el trabajo de filtrado y mapeo:
    // **OPCIÓN MÁS SEGURA (Usando el mapeo que ya has escrito)**

    const asignacionesMap: Record<number, Record<number, string | null>> = {};
    asignacionesRaw.forEach(a => {
        const giroId = a.id_giro;
        const zonificacionId = a.id_zonificacion;
        
        if (!asignacionesMap[giroId]) {
            asignacionesMap[giroId] = {};
        }
        // Usamos ?? '' para manejar nulls si 'estado_codigo' lo permite, 
        // o si el campo se llama 'codigo', úsalo directamente.
        asignacionesMap[giroId][zonificacionId] = a.codigo ?? '';
    });
    

    // 6. Construir y devolver la respuesta final (MatrixResponse)
    return {
      girosData: girosPaginados,
      zonificacionesData: zonificacionesData,
      // Usamos la matriz formateada
      initialAsignaciones: asignacionesMap as Record<number, Record<number, string | null>>, 
      totalGiros: totalGiros,
    };
  }



  /**
   * Lógica para manejar la actualización de un solo registro de asignación (el guardado del Input).
   */
  public async updateAsignacion(id_giro: number, id_zonificacion: number, codigo_estado: string | null) {
    /*
    // 1. Validar el código de estado (opcional si la validación se hace en el controlador)    
    if (codigo_estado && !['H', 'O', 'R', 'X'].includes(codigo_estado.toUpperCase())) {
      throw new Error("Código de estado de uso inválido.");
    }    
    // El código puede ser NULL (si se envía una cadena vacía desde el frontend)
    const estadoFinal = (codigo_estado === "") ? null : codigo_estado;
    */

    // --- 1. Obtener la lista dinámica de códigos válidos ---
    // Esto asegura que la aplicación usa los datos de la DB
    const codigosValidos = await this.getCodigosUsoValidos();  
    // --- 2. Validar el código de estado (si no es nulo o vacío) ---
    const estadoFinal = (codigo_estado === "") ? null : codigo_estado;
    if (estadoFinal !== null && !codigosValidos.includes(estadoFinal.toUpperCase())) {
      //  Ahora lanzamos un error si el código NO está en la DB
      throw new Error(`Código de estado de uso inválido: ${estadoFinal}. Los códigos permitidos son: ${codigosValidos.join(', ')}.`);
    }

    // 2. Usar upsert: Crea el registro si no existe, o lo actualiza si ya existe.
    const result = await this.prisma.giroZonificacion.upsert({
      where: {
        // Clave compuesta definida en el modelo: @@unique([id_giro, id_zonificacion])
        uq_gz_giro_zon: {
          id_giro: id_giro,
          id_zonificacion: id_zonificacion,
        },
      },
      update: {
        codigo: estadoFinal,
      },
      create: {
        id_giro: id_giro,
        id_zonificacion: id_zonificacion,
        codigo: estadoFinal,
      },
    });

    return result;
  }

  private async getCodigosUsoValidos(): Promise<string[]> {
    // Usando Prisma para consultar la tabla de estados de uso
    const estados = await this.prisma.estadoUso.findMany({
      select: {
        codigo: true, // Solo necesitamos el campo 'codigo'
      },
    });

    // Mapear el resultado a un array simple de strings (Ej: ['H', 'O', 'R', 'X'])
    return estados.map(e => e.codigo.toUpperCase());
  }



}