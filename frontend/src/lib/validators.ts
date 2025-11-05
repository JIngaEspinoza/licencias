// RUC (Perú): 11 dígitos, prefijo válido y dígito verificador (módulo 11)
export function isValidRUC(ruc: string): boolean {
  const clean = (ruc || "").replace(/\D/g, "");
  if (!/^\d{11}$/.test(clean)) return false;
  if (!/^(10|15|17|20)/.test(clean)) return false; // prefijos más comunes

  const digits = clean.split("").map(Number);
  const weights = [5,4,3,2,7,6,5,4,3,2]; // para los 10 primeros
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const remainder = sum % 11;
  let check = 11 - remainder;
  if (check === 10) check = 0;
  if (check === 11) check = 1;
  return check === digits[10];
}

export function isValidDNI(dni: string): boolean {
  const clean = (dni || "").replace(/\D/g, "");
  return /^\d{8}$/.test(clean);
}

// Email: simple y suficiente para UI
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email || "");
}

// Teléfono Perú:
// - Celular: 9 dígitos y empieza con 9  => ^9\d{8}$
// - (Opcional) fijo: entre 6 y 9 dígitos => ^\d{6,9}$
export function isValidPhone(pePhone: string): boolean {
  const clean = (pePhone || "").replace(/\D/g, "");
  return /^9\d{8}$/.test(clean) || /^\d{6,9}$/.test(clean);
}