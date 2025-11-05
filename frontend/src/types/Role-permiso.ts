export interface RolePermiso {
  id: number;
  roleId: number;
  permisoId: number;
}

export type RolePermisoCreate = Omit<RolePermiso, "id">;