import { http, httpList, toQuery } from "../lib/http";
import type { VistaDTO } from "@/types/autorizaciones";
const BASE_PATH = '/autorizaciones-temporales';

export const autorizacionesApi = {
  /** Lista agregada para la vista (lo que hoy renderizas) */
  list: () => http<VistaDTO[]>(`${BASE_PATH}`),

  /** Opcional: obtener un tipo por key (si agregas ese endpoint) */
  getByKey: (key: string) => http(`${BASE_PATH}/${encodeURIComponent(key)}`),

  /** Opcional: filtrar por categoría (si agregas ese endpoint) */
  listByCategoria: (slug: string) =>
    http<VistaDTO[]>(`${BASE_PATH}?categoria=${encodeURIComponent(slug)}`),
};