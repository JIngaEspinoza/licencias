import { UserRole, UserRoleCreate } from "@/types/User-role";
import { http, httpList, toQuery } from "../lib/http";

const BASE_PATH = "/user-role";

export const userRoleApi = {
  list: () => http<UserRole[]>(`${BASE_PATH}`, { method: "GET", auth: true }),

  create: (payload: UserRoleCreate) =>
    http<UserRoleCreate>(`${BASE_PATH}`, {
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