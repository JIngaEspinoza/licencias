export function asDate(dateStr: string): Date {
  // yyyy-mm-dd -> Date a medianoche local
  return new Date(`${dateStr}T00:00:00`);
}

export function asTime(timeStr: string): Date {
  // hh:mm[:ss] -> usamos 1970-01-01 como día dummy
  const t = /^\d{2}:\d{2}(:\d{2})?$/.test(timeStr) ? timeStr : `${timeStr}:00`;
  return new Date(`1970-01-01T${t}`);
}