// utils/paths.ts
const API_URL = import.meta.env.VITE_API_URL as string;
const BACKEND_BASE = API_URL.replace('/api', '');

export const getPdfUrl = (fileName: string | null | undefined): string | null => {
  if (!fileName) return null;
  return `${BACKEND_BASE}/archivos-servidor/expedientes/${fileName}`;
};