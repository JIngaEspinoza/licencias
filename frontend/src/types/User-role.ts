export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
}

export type UserRoleCreate = Omit<UserRole, "id">;