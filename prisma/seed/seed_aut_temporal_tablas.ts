// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type TipoKey = 'EPND' | 'EXPO_PP' | 'CAMP_PROMO' | 'FERIA_EP' | 'EVENTO_PARQUE' | 'ZONA_NO_URB' | 'VMP' | 'CONST_HORARIO';

const categorias = [
  { nombre: 'Propiedad Privada',  slug: 'propiedad-privada' },
  { nombre: 'Espacios Públicos',  slug: 'espacios-publicos' },
  { nombre: 'Constancia de Horarios', slug: 'constancia-horarios' },
];

const requisitos = [
  'Vigencia de Poder',
  'Plano + memoria descriptiva',
  'Informe ECSE',
  'Contrato de seguridad privada',
  'Póliza de responsabilidad civil',
  'Pago derecho S/.29',
  'Autorización DICSCAMEC (si aplica)',
  'ECSE previa',
  'Formato de Solicitud',
  'Croquis de ubicación y distribución de stands',
  'Pago en caja (previa calificación)',
  'Croquis de ubicación y módulos',
  'Plano de ubicación',
  'Plano perimétrico',
  'Permisos sectoriales (si aplica)',
  'Pago en caja',
  'Formato de Solicitud con # de VMP',
  'Plano de puntos de parada y máximo VMP por punto',
  'Pólizas de seguro (accidentes + RC)',
  'DJ de cumplimiento de condiciones',
  'Copia de Licencia de Funcionamiento',
  'Copia del Certificado ITSE',
];

/** 3) cat_tipo (usa nombre de categoría para resolver id_categoria) */
type TipoSeed = {
  categoriaNombre: string;
  key: string;
  titulo: string;
  vigencia_text?: string | null;
  presentacion_text?: string | null;
  tarifa_text?: string | null;
  nota?: string | null;
  base_legal?: string | null;
  vigencia_dias?: number | null;
  presentacion_min_dh?: number | null;
  presentacion_es_hab?: boolean | null;
};

const tipos: TipoSeed[] = [
  // 5.3 Tipos de "Propiedad Privada"
  {
    categoriaNombre: 'Propiedad Privada',
    key: 'EPND',
    titulo: 'Espectáculos Públicos No Deportivos',
    vigencia_text: '3 días',
    presentacion_text: '7 días hábiles antes',
    vigencia_dias: 3,
    presentacion_min_dh: 7,
    presentacion_es_hab: true,
  },
  {
    categoriaNombre: 'Propiedad Privada',
    key: 'EXPO_PP',
    titulo: 'Exposiciones',
    vigencia_text: '15 días',
    presentacion_text: '7 días hábiles antes',
    vigencia_dias: 15,
    presentacion_min_dh: 7,
    presentacion_es_hab: true,
  },
  {
    categoriaNombre: 'Propiedad Privada',
    key: 'CAMP_PROMO',
    titulo: 'Campañas y Promociones',
    vigencia_text: '15 días',
    presentacion_text: '7 días hábiles antes',
    vigencia_dias: 15,
    presentacion_min_dh: 7,
    presentacion_es_hab: true,
  },

  // 5.4 Tipos de "Espacios Públicos"
  {
    categoriaNombre: 'Espacios Públicos',
    key: 'FERIA_EP',
    titulo: 'Ferias / Exposiciones precalificadas',
    tarifa_text: 'Jurídica: S/60 stand/día • Educativas: S/30 • No lucrativas: hasta S/20',
    nota: null,
  },
  {
    categoriaNombre: 'Espacios Públicos',
    key: 'EVENTO_PARQUE',
    titulo: 'Eventos en parques (≤60 m²)',
    tarifa_text: 'Jurídica: S/1200/día • Vecinos: S/200/día • Educativas: S/300/día',
    nota: null,
  },
  {
    categoriaNombre: 'Espacios Públicos',
    key: 'ZONA_NO_URB',
    titulo: 'Zonas no urbanas / recreación',
    tarifa_text: 'Hasta 1000 m²: S/5/m²/día • 1000–3000 m²: S/4/m²/mes • 3000–5000 m²: S/3/m²/mes • >5000 m²: S/3/m²/mes',
    nota: 'Luego, solicitar Autorización Temporal según Ord. 411/MDSM',
  },
  {
    categoriaNombre: 'Espacios Públicos',
    key: 'VMP',
    titulo: 'VMP (Vehículos de Movilidad Personal)',
    tarifa_text: 'S/3 por VMP por día',
    nota: 'Sujeto a evaluación y calificación',
  },

  // 5.5 Tipos de "Constancia de Horarios"
  {
    categoriaNombre: 'Constancia de Horarios',
    key: 'CONST_HORARIO',
    titulo: 'Adecuación de Horarios',
    base_legal: 'Ordenanza N° 411/MDSM',
  },
];

const tipoRequisitosMap: Record<TipoKey, string[]> = {
  // Propiedad Privada
  EPND: [
    'Vigencia de Poder',
    'Plano + memoria descriptiva',
    'Informe ECSE',
    'Contrato de seguridad privada',
    'Póliza de responsabilidad civil',
    'Pago derecho S/.29',
    'Autorización DICSCAMEC (si aplica)',
    'ECSE previa',
  ],
  EXPO_PP: [
    'Vigencia de Poder',
    'Plano + memoria descriptiva',
    'Informe ECSE',
    'Contrato de seguridad privada',
    'Póliza de responsabilidad civil',
    'Pago derecho S/.29',
    'Autorización DICSCAMEC (si aplica)',
    'ECSE previa',
  ],
  CAMP_PROMO: [
    'Vigencia de Poder',
    'Plano + memoria descriptiva',
    'Informe ECSE',
    'Contrato de seguridad privada',
    'Póliza de responsabilidad civil',
    'Pago derecho S/.29',
    'Autorización DICSCAMEC (si aplica)',
    'ECSE previa',
  ],

  // Espacios Públicos
  FERIA_EP: [
    'Formato de Solicitud',
    'Croquis de ubicación y distribución de stands',
    'Pago en caja (previa calificación)',
  ],
  EVENTO_PARQUE: [
    'Formato de Solicitud',
    'Croquis de ubicación y módulos',
    'Pago en caja (previa calificación)',
  ],
  ZONA_NO_URB: [
    'Formato de Solicitud',
    'Plano de ubicación',
    'Plano perimétrico',
    'Permisos sectoriales (si aplica)',
    'Pago en caja',
  ],
  VMP: [
    'Formato de Solicitud con # de VMP',
    'Plano de puntos de parada y máximo VMP por punto',
    'Pólizas de seguro (accidentes + RC)',
    'DJ de cumplimiento de condiciones',
    'Pago en caja',
  ],

  // Constancia de Horarios
  CONST_HORARIO: [
    'Formato de Solicitud',
    'Copia de Licencia de Funcionamiento',
    'Copia del Certificado ITSE',
  ],
};

export async function seedCategorias() {
  for (const c of categorias) {
    const existente = await prisma.catCategoria.findFirst({
      where: { slug: c.slug },
      select: { id_categoria: true },
    });

    if (existente) {
      await prisma.catCategoria.update({
        where: { id_categoria: existente.id_categoria },
        data: { nombre: c.nombre, slug: c.slug },
      });
    } else {
      await prisma.catCategoria.create({ data: c });
    }
  }
  console.log('Seed seedCategorias completado');
}

export async function seedRequisitos() {
  for (const nombre of requisitos) {
    const existente = await prisma.catRequisito.findFirst({
      where: { nombre },
      select: { id_requisito: true },
    });

    if (!existente) {
      await prisma.catRequisito.create({ data: { nombre } });
    }
  }
  console.log('Seed seedRequisitos completado');
}

export async function seedTipos() {
  // Cachea ids de categorías por nombre
  const cats = await prisma.catCategoria.findMany({
    where: { nombre: { in: Array.from(new Set(tipos.map(t => t.categoriaNombre))) } },
    select: { id_categoria: true, nombre: true },
  });

  const catMap = new Map<string, number>(
    cats.map(c => [c.nombre, c.id_categoria])
  );

  for (const t of tipos) {
    const idCat = catMap.get(t.categoriaNombre);
    if (!idCat) {
      throw new Error(
        `No se encontró id_categoria para la categoría "${t.categoriaNombre}". Asegúrate de seedear cat_categoria primero.`
      );
    }

    // “Upsert” manual por (id_categoria, key) SIN unique
    const existente = await prisma.catTipo.findFirst({
      where: {
        id_categoria: idCat,
        key: t.key,
      },
      select: { id_tipo: true },
    });

    const data = {
      id_categoria: idCat,
      key: t.key,
      titulo: t.titulo,
      vigencia_text: t.vigencia_text ?? null,
      presentacion_text: t.presentacion_text ?? null,
      tarifa_text: t.tarifa_text ?? null,
      nota: t.nota ?? null,
      base_legal: t.base_legal ?? null,
      vigencia_dias: t.vigencia_dias ?? null,
      presentacion_min_dh: t.presentacion_min_dh ?? null,
      presentacion_es_hab: t.presentacion_es_hab ?? null,
    } as const;

    if (existente) {
      await prisma.catTipo.update({
        where: { id_tipo: existente.id_tipo },
        data,
      });
    } else {
      await prisma.catTipo.create({ data });
    }
  }
  console.log('Seed seedTipos completado');
}

export async function seedTipoRequisitos() {
  // 1) Resolver ids de tipos por key
  const keys = Object.keys(tipoRequisitosMap) as TipoKey[];
  const tipos = await prisma.catTipo.findMany({
    where: { key: { in: keys } },
    select: { id_tipo: true, key: true },
  });
  const tipoMap = new Map<string, number>(tipos.map(t => [t.key, t.id_tipo]));

  // 2) Resolver ids de requisitos por nombre
  const allReqNames = Array.from(new Set(Object.values(tipoRequisitosMap).flat()));
  const requisitos = await prisma.catRequisito.findMany({
    where: { nombre: { in: allReqNames } },
    select: { id_requisito: true, nombre: true },
  });
  const reqMap = new Map<string, number>(requisitos.map(r => [r.nombre, r.id_requisito]));

  // 3) Validaciones
  const missingTipos = keys.filter(k => !tipoMap.has(k));
  if (missingTipos.length) {
    throw new Error(`Faltan tipos (key) en BD: ${missingTipos.join(', ')}. Ejecuta antes el seed de cat_tipo.`);
  }
  const missingReqs = allReqNames.filter(n => !reqMap.has(n));
  if (missingReqs.length) {
    throw new Error(`Faltan requisitos en BD: ${missingReqs.join(', ')}. Ejecuta antes el seed de cat_requisito.`);
  }

  // 4) Upsert por PK compuesta (id_tipo, id_requisito) y asignar 'orden' (1..N)
  for (const key of keys) {
    const idTipo = tipoMap.get(key)!;
    const nombres = tipoRequisitosMap[key];

    for (let i = 0; i < nombres.length; i++) {
      const nombre = nombres[i];
      const idReq = reqMap.get(nombre)!;
      const orden = i + 1;

      await prisma.catTipoRequisito.upsert({
        where: {
          // nombre de la unique compuesta generado por Prisma: id_tipo_id_requisito
          id_tipo_id_requisito: {
            id_tipo: idTipo,
            id_requisito: idReq,
          },
        },
        update: { orden }, // si ya existe, actualiza el orden
        create: { id_tipo: idTipo, id_requisito: idReq, orden }, // si no existe, crea
      });
    }
  }
  console.log('Seed seedTipoRequisitos completado');
}

async function main() {
  await prisma.$transaction(async () => {
    await seedCategorias();
    await seedRequisitos();
    await seedTipos();
    await seedTipoRequisitos();
  });
}

if (require.main === module) {
  main();
}