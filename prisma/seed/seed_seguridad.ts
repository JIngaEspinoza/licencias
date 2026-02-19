import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

export async function seedSeguridad() {
  console.log('Iniciando seed RBAC...')

  // -------------------------------
  // PERMISOS BASE DEL SISTEMA
  // -------------------------------
  await prisma.permiso.createMany({
    data: [
      { nombre: 'CREAR_EXPEDIENTE' },
      { nombre: 'EDITAR_EXPEDIENTE' },
      { nombre: 'ELIMINAR_EXPEDIENTE' },
      { nombre: 'APROBAR_EXPEDIENTE' },
      { nombre: 'VER_EXPEDIENTE' },
      { nombre: 'GESTIONAR_USUARIOS' },
      { nombre: 'RESET_PASSWORD' },
    ],
    skipDuplicates: true,
  })

  console.log('Permisos verificados')

  // -------------------------------
  // ROLES
  // -------------------------------
  const todosPermisos = await prisma.permiso.findMany()

  await prisma.role.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: {
      nombre: 'ADMIN',
      permisos: {
        create: todosPermisos.map((p) => ({
          permiso: { connect: { id: p.id } },
        })),
      },
    },
  })

  const permisoCrear = await prisma.permiso.findUnique({ where: { nombre: 'CREAR_EXPEDIENTE' } })
  const permisoEditar = await prisma.permiso.findUnique({ where: { nombre: 'EDITAR_EXPEDIENTE' } })
  const permisoVer = await prisma.permiso.findUnique({ where: { nombre: 'VER_EXPEDIENTE' } })

  await prisma.role.upsert({
    where: { nombre: 'OPERADOR' },
    update: {},
    create: {
      nombre: 'OPERADOR',
      permisos: {
        create: [
          { permisoId: permisoCrear!.id },
          { permisoId: permisoEditar!.id },
          { permisoId: permisoVer!.id },
        ],
      },
    },
  })

  await prisma.role.upsert({
    where: { nombre: 'CONSULTA' },
    update: {},
    create: {
      nombre: 'CONSULTA',
      permisos: {
        create: [{ permisoId: permisoVer!.id }],
      },
    },
  })

  console.log('Roles verificados')

  // -------------------------------
  // USUARIOS
  // -------------------------------
  const hashPassword = (plain: string) =>
    crypto.createHash('sha256').update(plain).digest('hex')

  // Usuarios base
  const usuariosBase = [
    { email: 'admin@local', password: 'admin123', role: 'ADMIN' },
    { email: 'operador@local', password: 'operador123', role: 'OPERADOR' },
    { email: 'consulta@local', password: 'consulta123', role: 'CONSULTA' },
  ]

  for (const u of usuariosBase) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: hashPassword(u.password),
        roles: {
          create: [
            {
              role: {
                connect: { nombre: u.role },
              },
            },
          ],
        },
      },
    })
  }

  // Usuarios adicionales CONSULTA
  const usuariosConsulta = [
    'rodolfocondori@munisanmiguel.gob.pe',
    'davidbrito@munisanmiguel.gob.pe',
    'valhua2001@gmail.com',
    'sglicencias@munisanmiguel.gob.pe',
    'deisymadrid@munisanmiguel.gob.pe',
  ]

  for (const email of usuariosConsulta) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashPassword('123456'),
        roles: {
          create: [
            {
              role: {
                connect: { nombre: 'CONSULTA' },
              },
            },
          ],
        },
      },
    })
  }

  console.log('Usuarios verificados')

  // -------------------------------
  // TOKEN DE RECUPERACIÓN (DEMO)
  // -------------------------------
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@local' },
  })

  const resetToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

  await prisma.passwordResetToken.create({
    data: {
      userId: adminUser!.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  })

  console.log('Token de prueba creado para admin:')
  console.log(`Token (solo demo): ${resetToken}`)
}

async function main() {
  try {
    await seedSeguridad()
    console.log('Seed completado correctamente')
  } catch (error) {
    console.error('Error en seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}
