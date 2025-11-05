import { http, httpList, toQuery } from "../lib/http";

export type GiroZonificacion = {
  id_giro: number;
  id_zonificacion: number; 
  estado_codigo: string;
  giro: { codigo: string; nombre: string };
  zonificacion: { codigo: string; descripcion?: string | null };
};

export type GiroZonificacionCreate = Omit<GiroZonificacion, "codigo">;
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
};