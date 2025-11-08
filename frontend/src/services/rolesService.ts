import { http, httpList, toQuery } from "../lib/http";
import { Role, RoleCreate, RoleUpdate } from "@/types/Role";

const BASE_PATH = "/role";

export const rolesApi = {
  list: (q = "", page = 1, limit = 10) => 
    httpList<Role>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),

  listWithoutPagination: () => http<Role[]>(`${BASE_PATH}/list`, { method: "GET", auth: true }),
  
  create: (payload: RoleCreate) =>
    http<Role>(`${BASE_PATH}`, {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    }),
    
  update: (id: number, payload: RoleUpdate) =>
    http<Role>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      auth: true,
    }),
  remove: (id: number) =>
    http(`${BASE_PATH}/${id}`, { method: "DELETE", auth: true }),
};
