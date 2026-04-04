export interface User {
  id: number;
  email: string;
  passwordHash: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  email: string;
  passwordHash: string;
};
export type UserUpdate = Partial<UserCreate>;
