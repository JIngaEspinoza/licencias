import { http, httpList, toQuery } from "../lib/http";

export type Ciudadano = {
  id_ciudadano: number;
  tipo_persona: string;
  nombre_razon_social: string; 
  ruc: string;
  dni_ce: string;
  direccion: string;
  correo: string;
  telefono: string;
};

export type CiudadanoCreate = Omit<Ciudadano, "id_ciudadano">;
export type CiudadanoUpdate = Partial<CiudadanoCreate>;
const BASE_PATH = "/ciudadano";

export const ciudadanosApi = {
  /*list: (q?: string, page?: number, limit?: number) =>
    http<Ciudadano[]>(
      `${BASE_PATH}${toQuery({ q, page, limit })}`,
      { method: "GET" }
    ),*/

  list: (q = "", page = 1, limit = 10) =>
    httpList<Ciudadano>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  /*get: (id: number) =>
    http<Ciudadano>(`${BASE_PATH}/${id}`, { method: "GET" }),*/
  get: (id: number) => http<Ciudadano>(`${BASE_PATH}/${id}`),

  /*create: (payload: CiudadanoCreate) =>
    http<Ciudadano>(`${BASE_PATH}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),*/
  create: (payload: CiudadanoCreate) =>
    http<Ciudadano>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  /*update: (id: number, payload: CiudadanoUpdate) =>
    http<Ciudadano>(`${BASE_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),*/
  update: (id: number, payload: Partial<CiudadanoCreate>) =>
    http<Ciudadano>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  /*remove: (id: number) =>
    http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),*/
  remove: (id: number) => http<void>(`${BASE_PATH}${id}`, { method: "DELETE" }),
};

/*function toQuery(obj: Record<string, any>) {
  const s = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return s ? `?${s}` : "";
}*/