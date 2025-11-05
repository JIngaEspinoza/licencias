export interface NuevaDJTransaccionalRequest {
  expediente: {
    numero_expediente: string;
    fecha: string | Date;
    estado?: string | null;
  };
  persona_upsert: {
    tipo_persona?: string | null;
    nombre_razon_social?: string | null;
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
    vigencia_poder?: boolean | null;
    vigencia_poder_archivo?: string | null;
  };
  representante_upsert?: {
    nombres?: string | null;
    tipo_documento?: string | null;
    numero_documento?: string | null;
    sunarp_partida_asiento?: string | null;
  };
  expediente_licencia: {
    numero_licencia_origen?: string | null;
    fecha_recepcion: string | Date;
    tipo_tramite?: string | null;
    modalidad?: string | null;
    fecha_inicio_plazo?: string | Date | null;
    fecha_fin_plazo?: string | Date | null;
    nueva_denominacion?: string | null;
    detalle_otros?: string | null;
    numero_resolucion?: string | null;
    resolucion_fecha?: string | Date | null;
    numero_certificado?: string | null;
    qr_certificado?: string | null;
  };
  declaracion_jurada: {
    fecha?: string | Date | null;
    aceptacion: boolean;
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

    tiene_aut_sectorial: boolean;
    aut_entidad?: string | null;
    aut_denominacion?: string | null;
    aut_fecha?: string | Date | null;
    aut_numero?: string | null;

    monumento: boolean;
    aut_ministerio_cultura: boolean;
    num_aut_ministerio_cultura?: string | null;
    fecha_aut_ministerio_cultura?: string | Date | null;

    area_total_m2?: number | string | null;

    firmante_tipo?: string | null;
    firmante_nombre?: string | null;
    firmante_doc_tipo?: string | null;
    firmante_doc_numero?: string | null;

    vigencia_poder: boolean;
    condiciones_seguridad: boolean;
    titulo_profesional: boolean;

    observaciones?: string | null;
  };
  seguridad_itse: {
    nivel?: string | null;
    condiciones_seguridad: boolean;
    modal_itse?: string | null;
    numero_itse?: string | null;
    archivo_itse?: string | null;
    editable: boolean;
    calificador_nombre?: string | null;
    fecha?: string | Date | null;
  };
  opciones: Array<{ codigo: string; valor_json?: Record<string, any> | null }>;
  giros_nombres: string[]; // o ids si ya los tienes
  anexos: Array<{
    nombre?: string | null;
    ruta: string;
    extension?: string | null;
    tamano_bytes?: number | null;
    hash_archivo?: string | null;
    tipo_anexo?: string | null;
  }>;
}