import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

export async function seedSeguridad() {
  console.log('Iniciando seed RBAC...')

  // -------------------------------
  // PERMISOS BASE DEL SISTEMA
  // -------------------------------
  const permisos = await prisma.permiso.createMany({
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

  console.log(`Permisos insertados: ${permisos.count}`)

  // -------------------------------
  // ROLES
  // -------------------------------
  const adminRole = await prisma.role.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: {
      nombre: 'ADMIN',
      permisos: {
        create: (
          await prisma.permiso.findMany()
        ).map((p) => ({
          permiso: { connect: { id: p.id } },
        })),
      },
    },
  })

  const permisoCrear = await prisma.permiso.findUnique({ where: { nombre: 'CREAR_EXPEDIENTE' } })
  const permisoEditar = await prisma.permiso.findUnique({ where: { nombre: 'EDITAR_EXPEDIENTE' } })
  const permisoVer = await prisma.permiso.findUnique({ where: { nombre: 'VER_EXPEDIENTE' } })

  const operadorRole = await prisma.role.upsert({
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

  const consultaRole = await prisma.role.upsert({
    where: { nombre: 'CONSULTA' },
    update: {},
    create: {
      nombre: 'CONSULTA',
      permisos: {
        create: [{ permisoId: permisoVer!.id }],
      },
    },
  })

  console.log('Roles creados: ADMIN, OPERADOR, CONSULTA')

  // -------------------------------
  // USUARIOS
  // -------------------------------
  const hashPassword = (plain: string) =>
    crypto.createHash('sha256').update(plain).digest('hex')

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: {},
    create: {
      email: 'admin@local',
      passwordHash: hashPassword('admin123'),
      roles: {
        create: [{ role: { connect: { nombre: 'ADMIN' } } }],
      },
    },
  })

  const operadorUser = await prisma.user.upsert({
    where: { email: 'operador@local' },
    update: {},
    create: {
      email: 'operador@local',
      passwordHash: hashPassword('operador123'),
      roles: {
        create: [{ role: { connect: { nombre: 'OPERADOR' } } }],
      },
    },
  })

  const consultaUser = await prisma.user.upsert({
    where: { email: 'consulta@local' },
    update: {},
    create: {
      email: 'consulta@local',
      passwordHash: hashPassword('consulta123'),
      roles: {
        create: [{ role: { connect: { nombre: 'CONSULTA' } } }],
      },
    },
  })

  console.log('Usuarios base creados')

  // -------------------------------
  // TOKEN DE RECUPERACIÓN (DEMO)
  // -------------------------------
  const resetToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

  await prisma.passwordResetToken.create({
    data: {
      userId: adminUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
  })

  console.log('Token de prueba creado para admin:')
  console.log(`Token (solo demo): ${resetToken}`)
}

async function main() {
    await prisma.$transaction(async () => {
        await seedSeguridad();
    });
}

if (require.main === module) {
  main();
}