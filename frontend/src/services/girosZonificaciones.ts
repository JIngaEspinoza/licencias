import { http, httpList, toQuery } from "../lib/http";

export type GiroZonificacion = {
  id_giro_zonificacion: number;
  id_giro: number;
  id_zonificacion: number; 
  estado_codigo: string;
  giro: { codigo: string; nombre: string };
  zonificacion: { codigo: string; descripcion?: string | null };
};

export interface MatrixQueryParams {
    q?: string;
    page?: number;
    limit?: number;
    // Permite que pasemos otros parámetros si son necesarios en el futuro
    [key: string]: any; 
}

export type MatrixResponse = {
  girosData: {id: number, codigo: string, nombre:string};
  zonificacionesData: {id: number, codigo: string, descripcion:string};
  initialAsignaciones: Record<number, Record<number, string>>;
};

export type GiroZonificacionCreate = Omit<GiroZonificacion, "id_giro_zonificacion">;
export type GiroZonificacionUpdate = Partial<GiroZonificacionCreate>;
const BASE_PATH = "/giro-zonificacion";

export const giroszonificacionesApi = {
  list: (q = "", page = 1, limit = 10) =>
    httpList<GiroZonificacion>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  get: (id: number) => http<GiroZonificacion>(`${BASE_PATH}/${id}`),

  create: (payload: GiroZonificacionCreate) =>
    http<GiroZonificacion>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: number, payload: Partial<GiroZonificacionCreate>) =>
    http<GiroZonificacion>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: string) => http<void>(`${BASE_PATH}${id}`, { method: "DELETE" }),

  //matrix: () => http<MatrixResponse>(`${BASE_PATH}/matrix`),
  matrix: (params: MatrixQueryParams = { page: 1, limit: 50 }) => 
        // toQuery convierte { page: 1, limit: 50 } a "?page=1&limit=50"
    http<MatrixResponse>(`${BASE_PATH}/matrix${toQuery(params)}`),

  updateAsignacion: (giroId: number, zonificacionId: number, estado: string) => 
    http<void>(`${BASE_PATH}/asignacion`, {
      method: 'PUT', // O 'POST', dependiendo de tu backend
      body: JSON.stringify({ giroId, zonificacionId, estado_codigo: estado }),
    }),
};
