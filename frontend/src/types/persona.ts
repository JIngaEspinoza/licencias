export type Personas = {
  id_persona: number;
  tipo_persona: string;
  nombre_razon_social: string;
  ruc?: string;
  telefono?: string;
  correo?: string;
  via_tipo?: string;
  via_nombre?: string;
  numero?: string;
  interior?: string;
  mz?: string;
  lt?: string;
  otros?: string;
  urb_aa_hh_otros?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
};

export type PersonaCreate = Omit<Personas, "id_persona">;
export type PersonasUpdate = Partial<PersonaCreate>;