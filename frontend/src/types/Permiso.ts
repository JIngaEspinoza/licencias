export interface Permiso {
  id: number;
  nombre: string;
}
export type PermisoCreate = Omit<Permiso, "id">;
export type PermisoUpdate = Partial<PermisoCreate>;