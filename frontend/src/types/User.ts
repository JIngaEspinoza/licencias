export interface User {
  id: number;
  email: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  //roles: { role: { id: number; nombre: string } }[];
  //roles: { id: number; nombre: string }[];
}

export type UserCreate = Omit<User, "id" | "roles"> & {
  password: string;
  roleIds?: number[];
};
export type UserUpdate = Partial<UserCreate>;
