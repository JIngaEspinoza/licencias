export interface Role {
  id: number;
  nombre: string;
  permisos: { id: number; nombre: string }[];
}

export type RoleCreate = Omit<Role, "id" | "permisos"> & {
  permisoIds?: number[];
};
export type RoleUpdate = Partial<RoleCreate>;
