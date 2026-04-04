import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ---------- util ----------
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const pick = <T>(arr: T[], i: number) => arr[i % arr.length]

const viasTipo = ['Av.','Jr.','Calle']
const viasNombre = ['La Marina','Universitaria','Faucett','La Paz','Colonial','Sucre','Bolívar','Precursores','Angamos','Grau','Bolognesi','San Martín','Arequipa','Tacna','Piura']
const urbs = ['Urb. Los Jardines','AA.HH. Santa Rosa','Urb. San José','Urb. El Trébol','AA.HH. Villa del Mar','Urb. Primavera','Urb. Miraflores','Urb. Los Ángeles','AA.HH. Nuevo Perú','Urb. Las Flores','Urb. San Pedro','Urb. San Felipe','Urb. El Carmen','Urb. San Juan','Urb. Bellavista','Urb. Industrial','Urb. Financiera','Urb. San Luis','Urb. Los Robles','Urb. Los Pinos']

const nombresNaturales = [
  'Carlos Ramírez Soto','María Gómez Paredes','Luis Fernández Quispe','Ana Torres Valdez','Jorge Pérez Gonzales',
  'Rosa Castillo Ramos','Pedro Sánchez Alvarado','Lucía Herrera Díaz','José Gutiérrez Ramos','Elena Cárdenas Ruiz',
  'Diego Lozano Pérez','Fiorella Cárdenas Vega','Renzo Palomino Ortiz','Valeria Gutiérrez Poma','Gustavo Cornejo Prado',
  'Natalia Montesinos Paz','Javier Lazo Muñoz','Paola Chuquillanqui León','Héctor Barrios Flores','Claudia Arce Aguilar',
  'John Smith Carter','Emily Johnson Lee','Michael Brown Davis','Sophia Wilson Martin','David Taylor Clark',
  'Olivia Martinez Scott','Daniel Thompson Green','Isabella White Young','James Harris Adams','Charlotte Lewis Walker'
] // 30

const empresas = [
  'Panadería San Miguel SAC','Clínica Salud Integral EIRL','Restaurante El Sabor Peruano SAC','Farmacia Santa Rosa EIRL',
  'Librería Educativa SAC','Ferretería El Tornillo SAC','Consultora Contable y Legal SAC','Veterinaria Patitas Felices EIRL',
  'Gimnasio Fuerza Total SAC','Cevichería El Marino EIRL','TecnoServicios Andinos SAC','Textiles Pacífico SAC',
  'Inmobiliaria Costa Verde SAC','Servicios Logísticos Callao SAC','Café Aroma Andino EIRL','Hotel Mirador del Mar SAC',
  'Agroimport Perú SAC','Grupo Educativo Horizonte SAC','Laboratorios Vida Sana SAC','Estudio Legal Prado & Asociados SAC'
] // 20

const repsNombres = [
  'María Fernanda Salazar Ríos','Juan Carlos Paredes Gómez','Rocío Alejandra Pinto Vargas','Luis Alberto Medina Torres',
  'Carolina Beatriz Quiroz Díaz','Óscar Emmanuel Bustamante León','Gabriela Soledad Huamán Rivas','Sergio Andrés Villanueva Ruiz',
  'Patricia Milagros Campos Soto','Héctor Manuel Barrios Flores','Claudia Verónica Arce Aguilar','Diego Sebastián Lozano Pérez',
  'Alejandro Iván Céspedes Cruz','Fiorella Antonella Cárdenas Vega','Renzo Adrián Palomino Ortiz','Valeria Camila Gutiérrez Poma',
  'Gustavo Enrique Cornejo Prado','Natalia Rocío Montesinos Paz','Javier Esteban Lazo Muñoz','Paola Andrea Chuquillanqui León'
]

// ---------- builders ----------
function buildTelefonoMovil(base: number) { return '9' + (base % 100000000).toString().padStart(8, '0') }
function buildTelefonoFijo(base: number) { return '01' + (base % 10000000).toString().padStart(7, '0') }
function buildDNI(base: number) { return (40000000 + (base % 5000000)).toString().padStart(8, '0') }
function buildCE(base: number) { return 'CE' + (1000000 + (base % 9000000)).toString() }
function buildRUC(base: number) {
  const core = (100000000 + (base % 900000000)).toString().padStart(9, '0')
  return '20' + core // longitud válida (no DV real)
}
function buildDireccion(idx: number) {
  const via_tipo = pick(viasTipo, idx)
  const via_nombre = pick(viasNombre, idx + 3)
  const numero = ((idx % 200) + 100).toString()
  const interior = idx % 4 === 0 ? null : ['A','B','C','D'][idx % 4]
  const mz = idx % 5 === 0 ? null : ['A','B','C','D','E'][idx % 5]
  const lt = idx % 6 === 0 ? null : ((idx % 30) + 1).toString()
  const urb_aa_hh_otros = pick(urbs, idx + 5)
  return { via_tipo, via_nombre, numero, interior, mz, lt, otros: null as string | null, urb_aa_hh_otros }
}
function emailFromName(name: string, domainHint?: string) {
  const slug = slugify(name).replace(/-+/g, '.')
  const domain = domainHint ? slugify(domainHint) : 'example'
  return `${slug}@${domain}.com`            // <-- backticks correctos
}

// ---------- datasets ----------
function buildPersonas(): any[] {
  const out: any[] = []
  // 30 NATURALES (≈10 CE, 20 DNI)
  for (let i = 0; i < 30; i++) {
    const nombre_razon_social = nombresNaturales[i]
    const isCE = i % 3 === 2
    const tipo_documento = isCE ? 'CE' : 'DNI'
    const numero_documento = isCE ? buildCE(1000 + i) : buildDNI(1000 + i)
    const telefono = buildTelefonoMovil(10000000 + i)
    const correo = emailFromName(nombre_razon_social)
    const dir = buildDireccion(i)

    out.push({
      tipo_persona: 'NATURAL',
      nombre_razon_social,
      tipo_documento,
      numero_documento,
      ruc: null,
      telefono,
      correo,
      via_tipo: dir.via_tipo, via_nombre: dir.via_nombre, numero: dir.numero, interior: dir.interior,
      mz: dir.mz, lt: dir.lt, otros: dir.otros, urb_aa_hh_otros: dir.urb_aa_hh_otros,
      distrito: 'San Miguel', provincia: 'Lima', departamento: 'Lima'
    })
  }
  // 20 JURÍDICAS
  for (let j = 0; j < 20; j++) {
    const nombre_razon_social = empresas[j]
    const ruc = buildRUC(2000 + j)
    const telefono = buildTelefonoFijo(3000000 + j)
    const correo = `contacto@${slugify(nombre_razon_social.replace(/\s+(SAC|EIRL|SA|S\.A\.C\.)/gi, '').trim())}.com` // <-- backticks
    const dir = buildDireccion(200 + j)
    out.push({
      tipo_persona: 'JURIDICA',
      nombre_razon_social,
      tipo_documento: 'RUC',
      numero_documento: null,
      ruc,
      telefono,
      correo,
      via_tipo: dir.via_tipo, via_nombre: dir.via_nombre, numero: dir.numero, interior: dir.interior,
      mz: dir.mz, lt: dir.lt, otros: dir.otros, urb_aa_hh_otros: dir.urb_aa_hh_otros,
      distrito: 'San Miguel', provincia: 'Lima', departamento: 'Lima'
    })
  }
  return out
}

// ---------- idempotent inserts ----------
async function upsertPersona(p: any) {
  if (p.tipo_persona === 'JURIDICA' && p.ruc) {
    const found = await prisma.persona.findFirst({ where: { ruc: p.ruc } })
    if (found) {
      await prisma.persona.update({ where: { id_persona: found.id_persona }, data: p })
      return found.id_persona
    } else {
      const created = await prisma.persona.create({ data: p })
      return created.id_persona
    }
  } else {
    // NATURAL: clave natural = tipo_documento + numero_documento
    const found = await prisma.persona.findFirst({
      where: { tipo_documento: p.tipo_documento, numero_documento: p.numero_documento }
    })
    if (found) {
      await prisma.persona.update({ where: { id_persona: found.id_persona }, data: p })
      return found.id_persona
    } else {
      const created = await prisma.persona.create({ data: p })
      return created.id_persona
    }
  }
}

// 👉 EXPORT: esta es la función que vas a importar
export async function seedPersonas(): Promise<number[]> {
  const personas = buildPersonas()
  const ids: number[] = []
  for (const p of personas) {
    const id = await upsertPersona(p)
    ids.push(id)
  }
  console.log(`Personas upserted: ${ids.length}`) // <-- backticks
  return ids
}

export async function seedRepresentantesSoloJuridicas() {
  const juridicas = await prisma.persona.findMany({
    where: { tipo_persona: 'JURIDICA' },
    select: { id_persona: true, nombre_razon_social: true }
  })

  const tasks = juridicas.map(async (j, i) => {
    const existing = await prisma.representante.findFirst({ where: { id_persona: j.id_persona } })
    const nombres = pick(repsNombres, i)
    const dni = buildDNI(9000 + i)
    const partida = (13000000 + i).toString()
    const asiento = 'B' + (1000 + i).toString().padStart(4, '0')
    const data = {
      id_persona: j.id_persona,
      nombres,
      tipo_documento: 'DNI',
      numero_documento: dni,
      sunarp_partida_asiento: `Partida ${partida} - Asiento ${asiento}` // <-- backticks
    }

    if (existing) {
      await prisma.representante.update({ where: { id_representante: existing.id_representante }, data })
      return existing.id_representante
    } else {
      const created = await prisma.representante.create({ data })
      return created.id_representante
    }
  })

  const repIds = await Promise.all(tasks)
  console.log(`Representantes upserted: ${repIds.length} (solo JURÍDICAS)`) // <-- backticks
}

// (Opcional) ejecutar si corres este archivo directamente
async function main() {
  //await seedPersonas()
  await seedRepresentantesSoloJuridicas()
}
if (require.main === module) {
  main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
}