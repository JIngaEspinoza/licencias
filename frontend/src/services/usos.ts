import { http, httpList, toQuery } from "../lib/http";

export type Uso = {
  codigo: string;
  descripcion: string; 
};

export type UsoCreate = Omit<Uso, "codigo">;
export type UsoUpdate = Partial<UsoCreate>;
const BASE_PATH = "/estado-uso";

export const usosApi = {
  list: (q = "", page = 1, limit = 10) =>
    httpList<Uso>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  get: (id: number) => http<Uso>(`${BASE_PATH}/${id}`),

  create: (payload: UsoCreate) =>
    http<Uso>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: Partial<UsoCreate>) =>
    http<Uso>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: string) => http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),

  listWithoutPagination: () => http<Uso[]>(`${BASE_PATH}/list`, { method: "GET", auth: true }),
};