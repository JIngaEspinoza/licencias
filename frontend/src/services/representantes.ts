import { http, httpList, toQuery } from "../lib/http";

export type Representantes = {
  id_representante: number;
  id_persona: number;
  nombres?: string;
  tipo_documento?: string;
  numero_documento?: string;
  sunarp_partida_asiento?: string;
};

export type RepresentanteCreate = Omit<Representantes, "id_representante">;
export type RepresentanteUpdate = Partial<RepresentanteCreate>;
const BASE_PATH = "/representantes";

export const representantesApi = {
  list: (q = "", page = 1, limit = 10) =>
    httpList<Representantes>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  get: (id: number) => http<Representantes>(`${BASE_PATH}/${id}`),

  getByPersona: (id_persona: number) => http<Representantes[]>(`${BASE_PATH}/persona/${id_persona}`),
  
  create: (payload: RepresentanteCreate) =>
    http<Representantes>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: number, payload: Partial<RepresentanteCreate>) =>
    http<Representantes>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: number) => http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),
};