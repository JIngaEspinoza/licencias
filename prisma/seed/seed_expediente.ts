// prisma/seed_expediente.ts
import { PrismaClient, Prisma } from '@prisma/client';

/** Estados posibles; algunos registros quedarán sin estado (null) */
const ESTADOS = ['PENDIENTE', 'OBSERVADO', 'APROBADO', 'ANULADO'] as const;

/** Random determinista por semilla (reproducible) */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20250927);

function randInt(min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

/** Asegura date-only (00:00:00 UTC) compatible con @db.Date */
function dateOnly(isoYYYYMMDD: string) {
  const [y, m, d] = isoYYYYMMDD.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

/** EXP-AAAA-000123 */
function genNumeroExpediente(year: number, n: number) {
  return `EXP-${year}-${String(n).padStart(6, '0')}`;
}

/** Fecha distribuida en 2025 */
function genFecha(index: number) {
  const dayOfYear = 1 + (index % 365);
  const base = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));
  base.setUTCDate(base.getUTCDate() + dayOfYear - 1);
  const y = base.getUTCFullYear();
  const m = String(base.getUTCMonth() + 1).padStart(2, '0');
  const d = String(base.getUTCDate()).padStart(2, '0');
  return dateOnly(`${y}-${m}-${d}`);
}

function genEstado(): (typeof ESTADOS)[number] | null {
  const roll = rnd();
  if (roll < 0.15) return null; // 15% sin estado
  return ESTADOS[randInt(0, ESTADOS.length - 1)];
}

function genQR(numero: string, idPersona: number, estado: string | null) {
  if (rnd() < 0.3) return null; // 30% sin QR
  return `${numero}|PERSONA:${idPersona}|${estado ?? 'SIN_ESTADO'}`;
}

/**
 * Inserta expedientes (elige id_persona entre 1..50 existentes).
 * Crea y cierra su propio PrismaClient. No recibe parámetros (como tú quieres).
 */
export async function seedExpedientes(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const TOTAL = Number(process.env.SEED_EXPEDIENTES ?? 120);
    const year = 2025;

    const data: Prisma.ExpedienteCreateManyInput[] = Array.from(
      { length: TOTAL },
      (_, i) => {
        const correl = i + 1;
        const idPersona = randInt(1, 50);
        const numero = genNumeroExpediente(year, correl);
        const estado = genEstado();

        return {
          id_persona: idPersona,
          fecha: genFecha(i),
          numero_expediente: numero,
          estado,
          codigo_qr: genQR(numero, idPersona, estado),
        };
      }
    );

    // Inserta en bloques
    const chunkSize = 200;
    let inserted = 0;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const result = await prisma.expediente.createMany({
        data: chunk,
        // Nota: para que `skipDuplicates` funcione, `numero_expediente` debe ser UNIQUE
        skipDuplicates: true,
      });
      inserted += result.count;
    }

    const totalDB = await prisma.expediente.count();
    console.log(`Seed de Expediente OK. Insertados ahora: ${inserted}. Total en BD: ${totalDB}.`);
  } catch (e) {
    console.error('Seed Expediente error:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}
