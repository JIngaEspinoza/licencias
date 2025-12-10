import { http, httpList, toQuery } from "../lib/http";

export type Giro = {
  id_giro: number;
  codigo: string;
  nombre: string; 
};

export type GiroCreate = Omit<Giro, "id_giro">;
export type GiroUpdate = Partial<GiroCreate>;
const BASE_PATH = "/giro";

export const girosApi = {
  list: (q = "", page = 1, limit = 10) =>
    httpList<Giro>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  get: (id: number) => http<Giro>(`${BASE_PATH}/${id}`),

  create: (payload: GiroCreate) =>
    http<Giro>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: number, payload: Partial<GiroCreate>) =>
    http<Giro>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: number) => http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),

  listWithoutPagination: () => http<Giro[]>(`${BASE_PATH}/list`, { method: "GET", auth: true }),
};