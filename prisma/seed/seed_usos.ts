/* prisma/seed.ts */
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function seedUsos() {
  type ZonaRow = { codigo: string; descripcion?: string | null };
  type GiroRow = { codigo: string; nombre: string };
  type GZRow   = { codigo: string; zona: string; estado: 'X'|'H'|'O'|'R' | null };

  async function loadJson<T>(filename: string): Promise<T> {
    const p = path.join(process.cwd(), 'prisma', 'seed', 'data', filename);
    const txt = await fs.readFile(p, 'utf-8');
    return JSON.parse(txt) as T;
  }

  async function upsertEstadosUsoBase() {
    const base = [
      { codigo: 'X', descripcion: 'Permitido' },
      { codigo: 'H', descripcion: 'Condicionado / Restringido' },
      { codigo: 'O', descripcion: 'Prohibido' },
      { codigo: 'R', descripcion: 'Regulado / Autorización especial' },
    ];
    for (const e of base) {
      await prisma.estadoUso.upsert({
        where: { codigo: e.codigo },
        update: { descripcion: e.descripcion },
        create: e,
      });
    }
  }

  async function seed() {
    // 1) Catálogo de estados
    await upsertEstadosUsoBase();

    // 2) Catálogo de zonificación
    const zonas = await loadJson<ZonaRow[]>('zonificacion.json');
    for (const z of zonas) {
      await prisma.zonificacion.upsert({
        where: { codigo: z.codigo },
        update: { descripcion: z.descripcion ?? null },
        create: { codigo: z.codigo, descripcion: z.descripcion ?? null },
      });
    }

    // 3) Catálogo de giros
    const giros = await loadJson<GiroRow[]>('giros.json');
    // createMany con skipDuplicates acelera mucho si la lista es grande
    await prisma.giro.createMany({
      data: giros.map(g => ({ codigo: g.codigo, nombre: g.nombre })),
      skipDuplicates: true,
    });

    // 4) Mapas de código → id para cruce rápido
    const [allZ, allG] = await Promise.all([
      prisma.zonificacion.findMany(),
      prisma.giro.findMany(),
    ]);
    const zMap = new Map(allZ.map(z => [z.codigo, z.id_zonificacion]));
    const gMap = new Map(allG.map(g => [g.codigo, g.id_giro]));

    // 5) Matriz Giro_Zonificación
    const gzRows = await loadJson<GZRow[]>('giro_zonificacion.json');

    // Para PK compuesta, haremos upsert “manual”: deleteMany + create
    // (seguro e idempotente, útil si hay miles de filas variadas)
    for (const row of gzRows) {
      const id_giro = gMap.get(row.codigo);
      const id_zon  = zMap.get(row.zona);
      if (!id_giro || !id_zon) {
        console.warn(`Saltando par no mapeado -> giro: ${row.codigo}, zona: ${row.zona}`);
        continue;
      }

      // Si hay estado nuevo que no esté en EstadoUso, lo creamos
      if (row.estado && !['X','H','O','R'].includes(row.estado)) {
        await prisma.estadoUso.upsert({
          where: { codigo: row.estado },
          update: { descripcion: 'Estado adicional' },
          create: { codigo: row.estado, descripcion: 'Estado adicional' },
        });
      }

      await prisma.giroZonificacion.deleteMany({
        where: { id_giro, id_zonificacion: id_zon },
      });

      await prisma.giroZonificacion.create({
        data: {
          id_giro,
          id_zonificacion: id_zon,
          codigo: row.estado ?? null, // respeta nulls
        },
      });
    }

    console.log('Seed completado.');
  }

  seed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
}