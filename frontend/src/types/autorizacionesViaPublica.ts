// --- Sub-tipos de Relación (Estructura de Escritura) ---

// Estructura para crear/actualizar un AutorizacionEstablecimiento
// (Nota: No incluye id_auto_viapublica, que se relaciona anidado)
export type AutorizacionEstablecimientoPayload = {
  id_auto_establecimiento?: number; // Para UPDATE
  modulo_movible?: boolean | null;
  modulo_estacionario?: boolean | null;
  triciclo?: boolean | null;
  vehiculo_motorizado?: boolean | null;
  medio_venta?: string | null;
  giro_actividad?: string | null;
  via_tipo?: string | null;
  via_nombre?: string | null;
  numero?: string | null;
  interior?: string | null;
  mz?: string | null;
  lt?: string | null;
  otros?: string | null;
  urb_aa_hh_otros?: string | null;
  ubicacion?: string | null;
  lat: number;
  lng: number;
  map_zoom?: number | null;
};

// Estructura para crear/actualizar un AutorizacionAnexo
// (Nota: tamano_bytes es BigInt en Prisma, se recibe como string)
export type AutorizacionAnexoPayload = {
  id_autorizacion_anexo?: number; // Para UPDATE
  id_requisito: number; // FK obligatoria
  nombre_archivo: string;
  ruta_almacen: string; // Campo obligatorio basado en tu modelo Prisma
  extension?: string | null;
  tamano_bytes?: string | null; // BigInt como string
  hash_archivo?: string | null;
  fecha_subida?: string;
};

// --- Tipo Principal: AutorizacionViaPublica (Objeto base completo) ---

/**
 * Representa la entidad completa de AutorizacionViaPublica tal como
 * la manipula el backend (incluye todas las relaciones como DTOs).
 */
export type AutorizacionViaPublica = {
  id_auto_viapublica?: number; // ID autoincremental (presente en lectura/update)
  id_expediente: number; // FK obligatoria
  fecha_solicitud?: string | null;
  modalidad?: string | null;
  fecha_inicio_temporal?: string | null;
  fecha_fin_temporal?: string | null;
  otras_referencia?: string | null;

  // Relaciones Anidadas: Usadas para POST/PUT
  autorizacion_establecimiento: AutorizacionEstablecimientoPayload;
  autorizacion_anexo: AutorizacionAnexoPayload[];
};

// --- Tipo Derivado: AutorizacionViaPublicaCreate (Payload de POST) ---

/**
 * Representa el payload de datos requerido para CREAR una nueva Autorización (POST).
 * Es AutorizacionViaPublica OMITIENDO el ID de la tabla principal.
 */
export type AutorizacionViaPublicaCreate = Omit<AutorizacionViaPublica, 
  "id_auto_viapublica" 
>;

// --- Tipo Derivado: AutorizacionViaPublicaUpdate (Payload de PUT/PATCH) ---

/**
 * Representa el payload de datos para ACTUALIZAR una Autorización (PUT/PATCH).
 * Todos los campos son opcionales, excepto el ID (si se incluye en el payload).
 */
export type AutorizacionViaPublicaUpdate = Partial<AutorizacionViaPublica>;

/*export type AutorizacionViaPublica = {
  id_auto_viapublica?: number;
  id_expediente: number;
  fecha_solicitud: string | null;
  modalidad: string | null;
  fecha_inicio_temporal: string | null;
  fecha_fin_temporal: string | null;
  otras_referencia: string | null;

  autorizacion_establecimiento: {
    id_auto_establecimiento: number;
    modulo_movible: boolean | null;
    modulo_estacionario: boolean | null;
    triciclo: boolean | null;
    vehiculo_motorizado: boolean | null;
    medio_venta: string | null;
    giro_actividad: string | null;
    via_tipo: string | null;
    via_nombre: string | null;
    numero: string | null;
    interior: string | null;
    mz: string | null;
    lt: string | null;
    otros: string | null;
    urb_aa_hh_otros: string | null;
    ubicacion: string | null;
    lat: number;
    lng: number;
    map_zoom: number | null;
  };

  autorizacion_anexo: {
    id_autorizacion_anexo: number;
    id_requisito: number;
    nombre_archivo: string;
    ruta_almacen: string;
    extension: string | null;
    tamano_bytes?: string | null;
    hash_archivo?: string | null;
    fecha_subida?: string; 
  };
};

export type AutorizacionViaPublicaCreate = Omit<AutorizacionViaPublica, "id_auto_viapublica">;
export type AutorizacionViaPublicaUpdate = Partial<AutorizacionViaPublicaCreate>;
*/