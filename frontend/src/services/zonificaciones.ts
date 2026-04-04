import { http, httpList, toQuery } from "../lib/http";

export type Zonificacion = {
  id_zonificacion: number;
  codigo: string;
  descripcion: string; 
};

export type ZonificacionCreate = Omit<Zonificacion, "id_zonificacion">;
export type ZonificacionUpdate = Partial<ZonificacionCreate>;
const BASE_PATH = "/zonificacion";

export const zonificacionesApi = {
  list: (q = "", page = 1, limit = 10) =>
    httpList<Zonificacion>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  get: (id: number) => http<Zonificacion>(`${BASE_PATH}/${id}`),

  create: (payload: ZonificacionCreate) =>
    http<Zonificacion>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: number, payload: Partial<ZonificacionCreate>) =>
    http<Zonificacion>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: number) => http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),

  listWithoutPagination: () => http<Zonificacion[]>(`${BASE_PATH}/list`, { method: "GET", auth: true }),
};