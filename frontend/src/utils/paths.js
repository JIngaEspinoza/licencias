const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_BASE = API_URL.replace('/api', '');

export const getPdfUrl = (fileName) => {
  if (!fileName) return null;
  
  // Usamos el prefijo que definiste y la subcarpeta exacta
  return `${BACKEND_BASE}/archivos-servidor/expedientes/${fileName}`;
};