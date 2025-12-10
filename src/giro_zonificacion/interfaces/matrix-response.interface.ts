import { Giro, Zonificacion } from '@prisma/client';

// 1. Define la estructura simplificada de los Giros y Zonificaciones
// (Ajusta estos tipos si usas DTOs de respuesta específicos en tu backend)
interface GiroResponse extends Pick<Giro, 'id_giro' | 'codigo' | 'nombre'> {}
interface ZonificacionResponse extends Pick<Zonificacion, 'id_zonificacion' | 'codigo' | 'descripcion'> {}

// 2. Define la interfaz de respuesta final que incluye el total para la paginación
export interface MatrixResponse {
    /** Lista de Giros de la página actual. */
    girosData: GiroResponse[];

    /** Lista completa de Zonificaciones (no paginada). */
    zonificacionesData: ZonificacionResponse[];

    /** Mapa de asignaciones { giroId: { zonificacionId: estadoCodigo } }. 
     * Solo incluye los giros de la página actual.
     */
    initialAsignaciones: Record<number, Record<number, string | null>>;
    
    /** Número total de Giros en la base de datos (clave para la paginación). */
    totalGiros: number;
}