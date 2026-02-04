export type AutorizacionViaPublicaList = {
  id_auto_viapublica?: number;
  id_expediente: number;
  fecha_solicitud: string | null;
  modalidad: string | null;
  fecha_inicio_temporal: string | null;
  fecha_fin_temporal: string | null;
  otras_referencia: string | null;

  expediente: {
    id_expediente: number;
    numero_expediente: string;
    id_persona: number;

    persona: {
      nombre_razon_social: string;
    }
  },

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

/*export type VistaDTO = {
  nombre: string;
  items: {
    key: string;
    titulo: string;
    vigencia?: string | null;
    presentacion?: string | null;
    tarifa?: string | null;
    nota?: string | null;
    base?: string | null;
    requisitos: string[];
  }[];
};*/
