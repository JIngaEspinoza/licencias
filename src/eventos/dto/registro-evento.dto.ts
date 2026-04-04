export type EventoArchivoDTO = {
  nombre_archivo: string;
  ruta_almacen: string;
  extension?: string | null;
  tamano_bytes?: bigint | number | null;
  hash_archivo?: string | null;
};

export type EventoRequisitoDTO = {
  id_requisito: number;
  obligatorio?: boolean;
  estado?: "PENDIENTE" | "APROBADO" | "OBSERVADO" | string;
  observacion?: string | null;
  archivos?: EventoArchivoDTO[];
};

export type EventoHorarioDTO = {
  fecha_inicio: string; // "YYYY-MM-DD"
  fecha_fin: string;    // "YYYY-MM-DD"
  hora_inicio: string;  // "HH:mm" o "HH:mm:ss"
  hora_fin: string;     // "HH:mm" o "HH:mm:ss"
};

export type EventoCreateDTO = {
  id_tipo: number;
  id_expediente: number;
  actividad: string;
  ubicacion?: string | null;
  numero_licencia?: string | null;
  numero_certificado?: string | null;

  horarios?: EventoHorarioDTO[];
  requisitos?: EventoRequisitoDTO[];
};