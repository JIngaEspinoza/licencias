export type RoleName = 'ADMIN' | 'OPERADOR' | 'CONSULTA';

export interface AuthUser {
  id: number;
  email: string;
  roles: RoleName[];
}

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
