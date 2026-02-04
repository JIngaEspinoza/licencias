import { http, httpList, toQuery } from "../lib/http";
import type { AutorizacionViaPublicaList } from "@/types/autorizacionesViaPublicaList";
import type { AutorizacionViaPublica, AutorizacionViaPublicaCreate } from "@/types/autorizacionesViaPublica";
const BASE_PATH = '/autorizacion-via-publica';

export const autorizacionesViaPublicaApi = {
  /**
   * Crea una nueva Autorización de Vía Pública.
   * @param payload Los datos para la creación, incluyendo relaciones anidadas.
   * @returns La Autorización creada (la respuesta completa del backend).
   */
    create: (payload: AutorizacionViaPublicaCreate) => 
    http<AutorizacionViaPublica>(`${BASE_PATH}`, {
        method: 'POST',
        body: JSON.stringify(payload), // El payload con datos anidados
    }),

    /**
   * Actualiza una Autorización de Vía Pública existente.
   * @param id El ID de la autorización a actualizar.
   * @param payload Los datos parciales para la actualización.
   */
    /*update: (id: number, payload: AutorizacionViaPublicaUpdate) => 
    http<AutorizacionViaPublica>(`${BASE_PATH}/${id}`, {
      method: 'PUT', // o 'PATCH' dependiendo de tu backend
      body: JSON.stringify(payload),
    }),*/

  //list: () => http<AutorizacionViaPublica[]>(`${BASE_PATH}`),
  list: (params = {}) => {
    const defaultParams = { page: 1, limit: 10 };
    const finalParams = { ...defaultParams, ...params };
    
    // Asumo que 'toQuery' toma un objeto y lo convierte en "?key1=value1&key2=value2"
    return httpList<AutorizacionViaPublicaList>(`${BASE_PATH}${toQuery(finalParams)}`, finalParams.page, finalParams.limit);
  },

  /** Opcional: obtener un tipo por key (si agregas ese endpoint) */
  getByKey: (key: string) => http(`${BASE_PATH}/${encodeURIComponent(key)}`),

  /** Opcional: filtrar por categoría (si agregas ese endpoint) */
  listByCategoria: (slug: string) =>
    http<AutorizacionViaPublicaList[]>(`${BASE_PATH}?categoria=${encodeURIComponent(slug)}`),
};