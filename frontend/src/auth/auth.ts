import { authApi, ResetPasswordPayload } from "../services/authService";

const USER_KEY = 'user';
const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

function decodeJwt<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

export function hasValidToken(): boolean {
  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) return false;
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return true;       // si por algo no firmaste exp
  return payload.exp * 1000 > Date.now();
}

export async function tryRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  try {
    const { accessToken } = await authApi.refresh(refresh);
    localStorage.setItem(ACCESS_KEY, accessToken);
    return true;
  } catch {
    return false;
  }
}

export const auth = {
  current(): any | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async login(email: string, password: string) {
    const data = await authApi.login({ email, password });
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return data.user;
  },

  logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },

  async forgotPassword(email: string): Promise<void> {
    // 1. Verifica si el email es válido (opcional, pero buena práctica)
    if (!email) {
        throw new Error("El correo electrónico es requerido.");
    }

    // 2. Llama al endpoint de la API para solicitar el restablecimiento.
    // Este método solo necesita enviar el email. 
    // El backend se encarga de:
    // a) Verificar si el email existe.
    // b) Generar un token de restablecimiento.
    // c) Enviar el correo al usuario.

    try {
      await authApi.forgotPassword({ email }); 
      return; 
    } catch (error) {
      throw error;
    }
  },

  /**
   * Completa el proceso de restablecimiento de contraseña usando el token.
   * @param token El token de restablecimiento extraído de la URL.
   * @param newPassword La nueva contraseña establecida por el usuario.
   * @returns Promise<void>
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new Error("Token y nueva contraseña son requeridos.");
    }

    try {

      const payload: ResetPasswordPayload = {
        token: token,
        password: newPassword,
      };

      await authApi.resetPassword(payload);
    } catch (error) {
      throw error;
    }
  },

};
