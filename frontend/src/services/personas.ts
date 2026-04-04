import { http, httpList, toQuery } from "../lib/http";
import { Personas, PersonaCreate } from "@/types/persona";
const BASE_PATH = "/personas";

export const personasApi = {
  list: (q = "", page = 1, limit = 10) =>
    httpList<Personas>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  get: (id: number) => http<Personas>(`${BASE_PATH}/${id}`),

  create: (payload: PersonaCreate) =>
    http<Personas>(`${BASE_PATH}`, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: number, payload: Partial<PersonaCreate>) =>
    http<Personas>(`${BASE_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  remove: (id: number) => http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),
};