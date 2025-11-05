import { http, httpList, toQuery } from "../lib/http";
import { Permiso, PermisoCreate, PermisoUpdate } from "../types/Permiso";

const BASE_PATH = "/permiso";

export const permisosApi = {
  list: (q = "", page = 1, limit = 10) => 
    httpList<Permiso>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),
  
  listWithoutPagination: () => http<Permiso[]>(`${BASE_PATH}/list`, { method: "GET", auth: true }),

  create: (payload: PermisoCreate) =>
    http<Permiso>(`${BASE_PATH}`, {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    }),
  update: (id: number, payload: PermisoUpdate) =>
    http<Permiso>(`${BASE_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      auth: true,
    }),
  remove: (id: number) =>
    http<void>(`${BASE_PATH}/${id}`, { method: "DELETE", auth: true }),
};
