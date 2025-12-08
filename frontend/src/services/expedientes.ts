import { http, httpList, toQuery } from "../lib/http";

export type Expedientes = {
  id_expediente: number;
  id_persona: number;
  fecha: string; 
  numero_expediente: string;
  estado?: string | null;
  codigo_qr?: string | null;
  persona?: Persona;
};

export type ExpedienteCreate = Omit<Expedientes, "id_expediente">;
export type ExpedienteUpdate = Partial<ExpedienteCreate>;
const BASE_PATH = "/expedientes";

// Reutiliza tu interface del backend (si la compartes) o declara una mínima para el response:
export type CrearDesdeDemoResponse = { ok: boolean; id_expediente?: number };

import { NuevaDJTransaccionalRequest } from "@/types/declaracionJurada";

/*
export type NuevaDJTransaccionalRequest = {
  // Expediente
  expediente: {
    numero_expediente: string;
    fecha: string;               // YYYY-MM-DD
    estado?: string | null;
    id_persona?: number | null;  // si ya existe, opcional
  };

  // Persona (si necesitas crearla/actualizarla desde el formulario)
  persona_upsert?: {
    tipo_persona: "NATURAL" | "JURIDICA";
    nombre_razon_social: string;
    tipo_documento?: string | null;
    numero_documento?: string | null;
    ruc?: string | null;
    telefono?: string | null;
    correo?: string | null;
    via_tipo?: string | null;
    via_nombre?: string | null;
    numero?: string | null;
    interior?: string | null;
    mz?: string | null;
    lt?: string | null;
    otros?: string | null;
    urb_aa_hh_otros?: string | null;
    distrito?: string | null;
    provincia?: string | null;
    // Si quieres guardar vigencia de poder a nivel persona:
    vigencia_poder?: boolean | null;
    vigencia_poder_archivo?: string | null;
  };

  // Representante (si persona jurídica)
  representante_upsert?: {
    nombres?: string | null;
    tipo_documento?: string | null;
    numero_documento?: string | null;
    sunarp_partida_asiento?: string | null;
  };

  // ExpedienteLicencia
  expediente_licencia: {
    id_representante?: number | null; // si ya existe en BD y lo conoces
    numero_licencia_origen?: string | null;
    fecha_recepcion: string;          // YYYY-MM-DD
    tipo_tramite?: string | null;     // "NUEVA" | cambios...
    modalidad?: string | null;        // "INDETERMINADA" | "TEMPORAL"
    fecha_inicio_plazo?: string | null;
    fecha_fin_plazo?: string | null;
    numero_resolucion?: string | null;
    resolucion_fecha?: string | null;
    nueva_denominacion?: string | null;
    numero_certificado?: string | null;
    qr_certificado?: string | null;
    detalle_otros?: string | null;
  };

  // DeclaracionJurada
  declaracion_jurada: {
    fecha?: string | null;
    aceptacion?: boolean;
    nombre_comercial?: string | null;
    codigo_ciiu?: string | null;
    actividad?: string | null;
    zonificacion?: string | null;
    via_tipo?: string | null;
    via_nombre?: string | null;
    numero?: string | null;
    interior?: string | null;
    mz?: string | null;
    lt?: string | null;
    otros?: string | null;
    urb_aa_hh_otros?: string | null;
    provincia?: string | null;
    tiene_aut_sectorial?: boolean;
    aut_entidad?: string | null;
    aut_denominacion?: string | null;
    aut_fecha?: string | null;
    aut_numero?: string | null;
    monumento?: boolean;
    aut_ministerio_cultura?: boolean;
    num_aut_ministerio_cultura?: string | null;
    fecha_aut_ministerio_cultura?: string | null;
    area_total_m2?: number | null;
    firmante_tipo?: string | null;
    firmante_nombre?: string | null;
    firmante_doc_tipo?: string | null;
    firmante_doc_numero?: string | null;
    vigencia_poder?: boolean;
    condiciones_seguridad?: boolean;
    titulo_profesional?: boolean;
    observaciones?: string | null;
  };

  // SeguridadItse
  seguridad_itse?: {
    nivel?: string | null;                 // BAJO|MEDIO|ALTO|MUY_ALTO
    condiciones_seguridad?: boolean;
    modal_itse?: string | null;            // PREVIA | POSTERIOR
    numero_itse?: string | null;
    archivo_itse?: string | null;
    editable?: boolean;
    calificador_nombre?: string | null;
    fecha?: string | null;
  };

  // Opciones (ExpedienteOpciones[])
  opciones?: { codigo: string; valor_json?: any }[];

  // Giros (para DeclaracionJuradaGiro — el backend debe resolver id_giro_zonificacion)
  giros_nombres?: string[];

  // Anexos
  anexos?: { nombre?: string | null; ruta: string; extension?: string | null }[];
};
*/


/*export type Persona = {
  id_persona: number;
  tipo_persona?: string | null;
  nombre_razon_social: string;
  ruc?: string | null;
};*/

export type Persona = {
  id_persona: number;
  tipo_persona: string;
  nombre_razon_social: string;
  tipo_documento: string;
  numero_documento: string;
  ruc: string;
};

export type Expediente = {
  id_expediente: number;
  id_persona: number;
  fecha: string; // ISO
  numero_expediente: string;
  estado?: string | null;
  codigo_qr?: string | null;
  persona?: Persona; // incluir con include en tu backend
};

export type Paged<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

// ===== Payload para crear =========
export type NuevaDJCompletaInput = {
  // Datos mínimos del expediente (en muchos backends se generan server-side)
  id_persona: number;

  expedienteLicencia: {
    id_representante: number;
    numero_licencia_origen?: string;
    fecha_recepcion: string; // YYYY-MM-DD
    tipo_tramite?: string | null;
    modalidad?: string | null;
    fecha_inicio_plazo?: string | null; // YYYY-MM-DD
    fecha_fin_plazo?: string | null;    // YYYY-MM-DD
    numero_resolucion?: string | null;
    resolucion_fecha?: string | null;   // YYYY-MM-DD
    nueva_denominacion?: string | null;
    numero_certificado?: string | null;
    qr_certificado?: string | null;
    detalle_otros?: string | null;
  };

  declaracionJurada: {
    fecha?: string | null; // YYYY-MM-DD
    aceptacion?: boolean;
    nombre_comercial?: string | null;
    codigo_ciiu?: string | null;
    actividad?: string | null;
    zonificacion?: string | null;

    via_tipo?: string | null;
    via_nombre?: string | null;
    numero?: string | null;
    interior?: string | null;
    mz?: string | null;
    lt?: string | null;
    otros?: string | null;
    urb_aa_hh_otros?: string | null;
    provincia?: string | null;

    tiene_aut_sectorial?: boolean;
    aut_entidad?: string | null;
    aut_denominacion?: string | null;
    aut_fecha?: string | null; // YYYY-MM-DD
    aut_numero?: string | null;
    monumento?: boolean;
    aut_ministerio_cultura?: boolean;
    num_aut_ministerio_cultura?: string | null;
    fecha_aut_ministerio_cultura?: string | null; // YYYY-MM-DD
    area_total_m2?: number | null; // 2 decimales en DB
    firmante_tipo?: string | null;
    firmante_nombre?: string | null;
    firmante_doc_tipo?: string | null;
    firmante_doc_numero?: string | null;
    vigencia_poder?: boolean;
    condiciones_seguridad?: boolean;
    titulo_profesional?: boolean;
    observaciones?: string | null;
  };
};

export type NuevaDJInput = {
  // Min set para ejemplo. En tu backend puedes crear:
  // 1) Expediente (con persona y fecha)
  // 2) DeclaracionJurada vinculada al expediente creado
  id_persona: number;
  nombre_comercial?: string;
  actividad?: string;
  codigo_ciiu?: string;
  zonificacion?: string;
};

export const expedientesApi = {
  /*list: (q = "", page = 1, limit = 10) =>
    httpList<Expedientes>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),
  */
  list: (params = {}) => {
    const defaultParams = { page: 1, limit: 10 };
    const finalParams = { ...defaultParams, ...params };
    
    // Asumo que 'toQuery' toma un objeto y lo convierte en "?key1=value1&key2=value2"
    return httpList<Expedientes>(`${BASE_PATH}${toQuery(finalParams)}`, finalParams.page, finalParams.limit);
  },

  get: (id: number) => http<Expedientes>(`${BASE_PATH}/${id}`),

  create: (payload: ExpedienteCreate) =>
    http<Expedientes>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: number, payload: Partial<ExpedienteCreate>) =>
    http<Expedientes>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: number) => http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),

  // POST /api/declaraciones-juradas (crea expediente + DJ o solo DJ)
  /*async crearNuevaDJCompleta(payload: NuevaDJCompletaInput): Promise<{ ok: boolean; id_expediente?: number; id_declaracion?: number; id_expediente_licencia?: number; }> {
    return http(`/api/expedientes/nueva-dj`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },*/

  crearDesdeDemo: (payload: NuevaDJTransaccionalRequest) =>
    http<CrearDesdeDemoResponse>(`${BASE_PATH}/nueva-dj/full`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  

  /*async crearDesdeDemo(payload: NuevaDJTransaccionalRequest): Promise<{ ok: boolean; id_expediente?: number }> {
    // Ajusta esta ruta a tu controlador (NestJS/Nest + Prisma): ejecuta una sola transacción
    // que cree persona (si persona_upsert), representante (si aplica), expediente, expediente_licencia,
    // declaracion_jurada, seguridad_itse, opciones, anexos y dj_giros (resolviendo IDs).
    console.log(payload)
    return http(`/api/expedientes/nueva-dj/full`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },*/

  // Mapea el payload de la demo a un DTO transaccional alineado a tus modelos Prisma
  mapDemoPayloadToDTO(demo: any): NuevaDJTransaccionalRequest {
    // Persona
    const persona = demo.persona || {};
    const dir = persona.direccion || {};
    const representante = demo.representante || null;

    // Establecimiento / DJ
    const estable = demo.establecimiento || {};
    const estableDir = estable.direccion || {};
    const autSec = estable.autorizacion_sectorial || null;
    const declaracion = demo.declaracion || {};
    const firmante = declaracion.firmante || {};
    const decls = declaracion.declaraciones || {};
    const seguridad = demo.seguridad || {};
    const calif = demo.clasificacion_riesgo_municipal || {};

    const opciones = Array.isArray(demo.opciones) ? demo.opciones : [];
    const anexos = Array.isArray(demo.anexos)
      ? demo.anexos.map((n: string) => ({ nombre: n, ruta: `/uploads/${n}`, extension: n.split(".").pop() || null }))
      : [];

    const dto: NuevaDJTransaccionalRequest = {
      expediente: {
        numero_expediente: demo.numero_expediente,
        fecha: demo.fecha_recepcion,     // map a Date en backend
        estado: demo.estado || null,
        // id_persona: (si ya la tienes), sino usa persona_upsert
      },

      persona_upsert: {
        tipo_persona: persona.tipo_persona,
        nombre_razon_social: persona.nombre_razon_social,
        tipo_documento: persona.documentos?.tipo ?? null,
        numero_documento: persona.documentos?.numero ?? null,
        ruc: persona.documentos?.ruc ?? null,
        telefono: persona.contacto?.telefono ?? null,
        correo: persona.contacto?.correo ?? null,
        via_tipo: dir.via_tipo ?? null,
        via_nombre: dir.via_nombre ?? null,
        numero: dir.numero ?? null,
        interior: dir.interior ?? null,
        mz: dir.mz ?? null,
        lt: dir.lt ?? null,
        otros: dir.otros ?? null,
        urb_aa_hh_otros: dir.urb_aa_hh_otros ?? null,
        distrito: dir.distrito ?? null,
        provincia: dir.provincia ?? null,
        vigencia_poder: persona.poder_vigente ?? null,
        vigencia_poder_archivo: persona.vigencia_poder_archivo ?? null,
      },

      representante_upsert:
        representante
          ? {
              nombres: representante.nombres ?? null,
              tipo_documento: representante.documento?.tipo ?? null,
              numero_documento: representante.documento?.numero ?? null,
              sunarp_partida_asiento: representante.sunarp_partida_asiento ?? null,
            }
          : undefined,

      expediente_licencia: {
        numero_licencia_origen: demo.id_licencia_origen ?? null,
        fecha_recepcion: demo.fecha_recepcion,
        tipo_tramite: demo.tipo_tramite ?? null,             // "NUEVA" o la acción de modificación
        modalidad: demo.modalidad ?? null,                   // INDETERMINADA/TEMPORAL
        fecha_inicio_plazo: demo.fecha_inicio_plazo ?? null,
        fecha_fin_plazo: demo.fecha_fin_plazo ?? null,
        nueva_denominacion: demo.nueva_denominacion ?? null,
        detalle_otros: demo.detalle_otros ?? null,
        // estos se llenarán más adelante (resolución/certificado) si aplica:
        numero_resolucion: null,
        resolucion_fecha: null,
        numero_certificado: null,
        qr_certificado: null,
      },

      declaracion_jurada: {
        fecha: declaracion.fecha ?? null,
        aceptacion: !!declaracion.aceptacion,
        nombre_comercial: estable.nombre_comercial ?? null,
        codigo_ciiu: estable.codigo_ciiu ?? null,
        actividad: estable.activity ?? estable.actividad ?? null,
        zonificacion: estable.zonificacion ?? null,

        // Dirección del establecimiento
        via_tipo: estableDir.via_tipo ?? null,
        via_nombre: estableDir.via_nombre ?? null,
        numero: estableDir.numero ?? null,
        interior: estableDir.interior ?? null,
        mz: estableDir.mz ?? null,
        lt: estableDir.lt ?? null,
        otros: estableDir.otros ?? null,
        urb_aa_hh_otros: estableDir.urb_aa_hh_otros ?? null,
        provincia: estableDir.provincia ?? null,

        // Aut. sectorial
        tiene_aut_sectorial: !!autSec,
        aut_entidad: autSec?.entidad ?? null,
        aut_denominacion: autSec?.denominacion ?? null,
        aut_fecha: autSec?.fecha ?? null,
        aut_numero: autSec?.numero ?? null,

        // Ministerio de cultura (si en tu flujo aplica; aquí default)
        monumento: false,
        aut_ministerio_cultura: false,
        num_aut_ministerio_cultura: null,
        fecha_aut_ministerio_cultura: null,

        // Área
        area_total_m2: typeof estable.area_total_m2 === "number" ? estable.area_total_m2 : (demo.establecimiento?.area_total_m2 ?? null),

        // Firmante
        firmante_tipo: firmante.tipo ?? null,
        firmante_nombre: firmante.nombres ?? null,
        firmante_doc_tipo: firmante.doc?.tipo ?? null,
        firmante_doc_numero: firmante.doc?.numero ?? null,

        // Declaraciones
        vigencia_poder: !!decls.poder_vigente,
        condiciones_seguridad: !!decls.condiciones_seguridad,
        titulo_profesional: !!decls.titulo_profesional,

        observaciones: declaracion.observaciones ?? null,
      },

      seguridad_itse: {
        nivel: seguridad.nivel ?? null,
        condiciones_seguridad: !!seguridad.condiciones_seguridad,
        modal_itse: seguridad.itse_modalidad ?? null, // PREVIA/POSTERIOR
        numero_itse: seguridad.itse_numero ?? null,
        archivo_itse: seguridad.itse_archivo ?? null,
        editable: !!calif.editable,
        calificador_nombre: calif.calificador_nombre ?? null,
        fecha: calif.fecha ?? null,
      },

      opciones: opciones,
      giros_nombres: Array.isArray(estable.giros) ? estable.giros : [],
      anexos,
    };

    return dto;
  }





};