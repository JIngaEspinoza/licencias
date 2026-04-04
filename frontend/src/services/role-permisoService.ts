import { http, httpList, toQuery } from "../lib/http";
import { RolePermiso, RolePermisoCreate } from "@/types/Role-permiso";

const BASE_PATH = "/role-permiso";

export const rolePermisoApi = {
  list: () => http<RolePermiso[]>(`${BASE_PATH}`, { method: "GET", auth: true }),

  create: (payload: RolePermisoCreate) =>
    http<RolePermiso>(`${BASE_PATH}`, {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
    }),

  remove: (id: number) => http(`${BASE_PATH}/${id}`, { method: "DELETE", auth: true }),

  removeByComposite: ({ roleId, permisoId }: { roleId: number; permisoId: number }) =>
    http<void>(`${BASE_PATH}/roles/${roleId}/permisos/${permisoId}`, {
      method: "DELETE",
      auth: true,
    }),

};