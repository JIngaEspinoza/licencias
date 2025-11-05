import { http } from "../lib/http";

export type Licencia = {
  id_licencia: number;
  numero_expediente: string;
  fecha_solicitud: string; // ISO string: "yyyy-mm-dd" o full ISO
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
};

export type LicenciaCreate = Omit<Licencia, "id_licencia">;
export type LicenciaUpdate = Partial<LicenciaCreate>;
const BASE_PATH = "/licencia-funcionamiento";

export const licenciasApi = {
  list: (q?: string, page?: number, limit?: number) =>
    http<Licencia[]>(
      `${BASE_PATH}${toQuery({ q, page, limit })}`,
      { method: "GET" } // , auth: true
    ),

  get: (id: number) =>
    http<Licencia>(`${BASE_PATH}/${id}`, { method: "GET" }),

  create: (payload: LicenciaCreate) =>
    http<Licencia>(`${BASE_PATH}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: LicenciaUpdate) =>
    http<Licencia>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    http<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),
};

// helper para querystring limpio
function toQuery(obj: Record<string, any>) {
  const s = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return s ? `?${s}` : "";
}
