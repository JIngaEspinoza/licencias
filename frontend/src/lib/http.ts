// Pequeño wrapper sobre fetch con baseURL y JSON por defecto
const BASE = import.meta.env.VITE_API_URL as string;

type Options = RequestInit & { auth?: true }; //boolean
export type Paginated<T> = { data: T[]; total: number; page: number; limit: number };

function getToken() {
  // Si más adelante guardas JWT al hacer login, léelo aquí:
  const raw = localStorage.getItem("auth_token");
  return raw || null;
}

async function httpRaw(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const isJSON = res.headers.get("content-type")?.includes("application/json");
  const body = isJSON ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const message = (body as any)?.message || res.statusText || "Request error";
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return { res, body };
}

export async function http<T = any>(path: string, opts: Options = {}) {
  const headers = new Headers(opts.headers || {});

  if (!headers.has("Content-Type") && opts.body) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  
  const isJSON = res.headers.get("content-type")?.includes("application/json");
  if (!res.ok) {
    const errBody = isJSON ? await res.json().catch(() => ({})) : await res.text();
    const message = (errBody as any)?.message || res.statusText;
    throw new Error(`${res.status} ${message}`);
  }
  return (isJSON ? res.json() : (null as unknown)) as T;
}

// Helper para mapear respuestas de lista a un shape común
export async function httpList<T = any>(path: string, page: number, limit: number) {
  const { res, body } = await httpRaw(path, { method: "GET" });

  // Opción A: backend devuelve { data, total, page?, limit? }
  if (typeof body === "object" && body && "data" in body && "total" in body) {
    const { data, total, page: p, limit: l } = body as any;
    return { data: data as T[], total: Number(total), page: p ?? page, limit: l ?? limit };
  }

  // Opción B: backend devuelve array y total por header 'X-Total-Count'
  const totalHeader = res.headers.get("x-total-count");
  if (Array.isArray(body) && totalHeader) {
    return { data: body as T[], total: Number(totalHeader), page, limit };
  }

  // Fallback: array sin total (estimado)
  return { data: (body as T[]) ?? [], total: (body as T[])?.length ?? 0, page, limit };
}

// Utilidad para querystring
export function toQuery(obj: Record<string, any>) {
  const s = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return s ? `?${s}` : "";
}