import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función de utilidad para obtener un número entero aleatorio en un rango
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función principal del seed
export async function seedAutorizacionViaPublica() {
  console.log('Iniciando el proceso de seeding...');
  
  // Rango de IDs de expedientes disponibles
  const MIN_EXPEDIENTE_ID = 1;
  const MAX_EXPEDIENTE_ID = 20;
  
  // Rango de IDs de requisitos (ajustar según tu tabla CatRequisito)
  const MIN_REQUISITO_ID = 1; 
  const MAX_REQUISITO_ID = 5; 

  const modalidades = [
    'TEMPORAL', 
    'EXCEPCIONAL'
  ];

  const tiposVia = ['AVENIDA', 'CALLE', 'JR'];

  // --- Crear 10 Registros de AutorizacionViaPublica con datos anidados ---
  for (let i = 1; i <= 10; i++) {
    const expedienteId = getRandomInt(MIN_EXPEDIENTE_ID, MAX_EXPEDIENTE_ID);
    const modalidadSeleccionada = modalidades[getRandomInt(0, 1)];

    const fechaSolicitud = new Date(2023, getRandomInt(0, 11), getRandomInt(1, 28));
    
    // Configurar fechas de inicio y fin para el modo TEMPORAL
    let fechaInicio: Date | null = null;
    let fechaFin: Date | null = null;
    if (modalidadSeleccionada === 'TEMPORAL') {
        fechaInicio = new Date(fechaSolicitud);
        fechaInicio.setDate(fechaSolicitud.getDate() + 1);
        fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaInicio.getMonth() + 3); // Autorización de 3 meses
    }


    const autorizacion = await prisma.autorizacionViaPublica.create({
      data: {
        id_expediente: expedienteId,
        fecha_solicitud: fechaSolicitud,
        modalidad: modalidadSeleccionada,
        fecha_inicio_temporal: fechaInicio,
        fecha_fin_temporal: fechaFin,
        otras_referencia: `Referencia de prueba ${i}`,
        
        // ** RELACIÓN ANIDADA: AutorizacionEstablecimiento (Uno a Uno Lógico)**
        autorizacion_establecimiento: {
          create: [ // Se usa create: [] porque la relación es de uno a muchos (AutorizacionEstablecimiento[])
            {
              modulo_movible: i % 2 === 0,
              modulo_estacionario: i % 2 !== 0,
              triciclo: i % 3 === 0,
              vehiculo_motorizado: i % 4 === 0,
              medio_venta: i % 2 === 0 ? 'Venta de Bebidas' : 'Comida Rápida',
              giro_actividad: i % 2 === 0 ? 'Expendio de Alimentos' : 'Venta de Accesorios',
              via_tipo: tiposVia[getRandomInt(0, 2)],
              via_nombre: `Via de Prueba ${i}`,
              numero: `${getRandomInt(100, 999)}`,
              mz: `M${i}`,
              lt: `L${getRandomInt(1, 10)}`,
              ubicacion: `Frente al parque principal - Punto ${i}`,
              // Coordenadas aleatorias cerca de un punto central (ej. Lima)
              lat: 
                30.000000 + i * 0.0001,
              lng: 
                -70.000000 + i * 0.0001,
            },
          ],
        },

        // ** RELACIÓN ANIDADA: AutorizacionAnexo (Uno a Muchos)**
        autorizacion_anexo: {
          create: [
            // Anexo 1 (Requisito 1)
            {
              id_requisito: getRandomInt(MIN_REQUISITO_ID, MAX_REQUISITO_ID),
              nombre_archivo: `DNI_Emprendedor_${i}.pdf`,
              ruta_almacen: `/docs/emprendedor/${expedienteId}/dni.pdf`,
              extension: 'pdf',
              tamano_bytes: 520120n, // Usando BigInt literal
              hash_archivo: `hash_dni_${i}`,
            },
            // Anexo 2 (Requisito 2)
            {
                id_requisito: getRandomInt(MIN_REQUISITO_ID, MAX_REQUISITO_ID),
                nombre_archivo: `Plano_Ubicacion_${i}.jpg`,
                ruta_almacen: `/docs/emprendedor/${expedienteId}/plano.jpg`,
                extension: 'jpg',
                tamano_bytes: 8400000n, 
                hash_archivo: `hash_plano_${i}`,
            }
          ],
        },
      },
      // Opcional: Seleccionar campos para confirmar la creación
      select: {
        id_auto_viapublica: true,
        id_expediente: true,
        modalidad: true,
        autorizacion_establecimiento: { select: { via_nombre: true } },
        autorizacion_anexo: { select: { nombre_archivo: true } },
      },
    });

    console.log(`Creada Autorización ${autorizacion.id_auto_viapublica} para Exp. ${autorizacion.id_expediente}`);
  }
}

async function main() {
    await prisma.$transaction(async () => {
        await seedAutorizacionViaPublica();
    })
}

if (require.main === module) {
  main();
}