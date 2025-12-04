import { http } from "../lib/http";
const BASE_PATH = "/auth";

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    roles: string[];
  };
}

interface ForgotPasswordPayload {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

// Define el tipo de datos que se enviarán al endpoint de restablecimiento
export interface ResetPasswordPayload {
  token: string;
  password: string; // La nueva contraseña
}

// Define el tipo de la respuesta (usualmente solo un mensaje de éxito)
export interface ResetPasswordResponse {
  message: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    http<AuthResponse>(`${BASE_PATH}/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: (refreshToken: string) =>
    http<{ accessToken: string }>(`${BASE_PATH}/refresh`, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  
  forgotPassword: (payload: ForgotPasswordPayload) =>
    http<ForgotPasswordResponse>(`${BASE_PATH}/forgot-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * Completa el proceso de restablecimiento de contraseña usando el token.
   * @param payload El token y la nueva contraseña.
   * @returns Una promesa que resuelve con la respuesta del servidor (ej: { message: "..." }).
   */
  resetPassword: (payload: ResetPasswordPayload) =>
    http<ResetPasswordResponse>(`${BASE_PATH}/reset-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

/*const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  const data = (await res.json()) as import('../types/auth').AuthLoginResponse;
  return data;
}

export async function refreshToken(): Promise<string> {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) throw new Error('No hay refresh token');
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) throw new Error('Sesión expirada');
  const data = (await res.json()) as { accessToken: string };
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

export async function getProfile() {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const newToken = await refreshToken();
    const res2 = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    if (!res2.ok) throw new Error('Sesión expirada');
    return (await res2.json()) as import('../types/auth').AuthUser;
  }
  if (!res.ok) throw new Error('No se pudo obtener el perfil');
  return (await res.json()) as import('../types/auth').AuthUser;
}
*/