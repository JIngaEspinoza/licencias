import { http, httpList, toQuery } from "../lib/http";
//import type { AutorizacionEmprendedores } from "@/types/autorizacionesViaPublica";
const BASE_PATH = '/autorizaciones-temporales';

export const autorizacionesApi = {  
  //list: () => http<AutorizacionEmprendedores[]>(`${BASE_PATH}`),

  /** Opcional: obtener un tipo por key (si agregas ese endpoint) */
  getByKey: (key: string) => http(`${BASE_PATH}/${encodeURIComponent(key)}`),

  /** Opcional: filtrar por categoría (si agregas ese endpoint) */
  //listByCategoria: (slug: string) =>
    //http<AutorizacionEmprendedores[]>(`${BASE_PATH}?categoria=${encodeURIComponent(slug)}`),
};