import { Injectable } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindExpedientesDto } from './dto/find-expedientes.dto';
import { Prisma } from '@prisma/client';
import { NuevaDJTransaccionalRequest } from './dto/nueva-dj-transaccional.request';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ExpedientesService {
  constructor(private readonly prisma: PrismaService){}

  async generarPdf(id: number, res: Response) {
    const expediente = await this.prisma.expediente.findUnique({
      where: { id_expediente: id },
    });

    if (!expediente) {
      throw new Error('Expediente no encontrado');
    }

    const PDFDocument = require('pdfkit');

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 140, bottom: 100, left: 70, right: 70 },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=resolucion-${id}.pdf`,
    );

    doc.pipe(res);

    /* ===================================
      🔷 HEADER
    ===================================*/
    const drawHeader = () => {
      const top = 40;

      // Logo
      //doc.image('public/logo-municipal.png', 70, top, { width: 70 });

      // Texto institucional
      doc
        .font('Times-Bold')
        .fontSize(10)
        .text('MUNICIPALIDAD DISTRITAL DE SAN MIGUEL', 160, top)
        .font('Times-Roman')
        .text(
          'GERENCIA DE DESARROLLO ECONÓMICO Y COOPERACIÓN INTERINSTITUCIONAL',
          160
        )
        .text('SUBGERENCIA DE LICENCIA Y COMERCIO', 160);

      // Resolución (derecha)
      doc
        .font('Times-Bold')
        .fontSize(11)
        .text(
          `RESOLUCIÓN DE SUBGERENCIA N° `, //${expediente.numero_resolucion ?? ''}
          350,
          top,
          { align: 'right' }
        )
        .font('Times-Roman')
        .text(
          `San Miguel, ${new Date().toLocaleDateString('es-PE')}`,
          { align: 'right' }
        );

      // Línea divisoria
      doc
        .moveTo(70, 120)
        .lineTo(doc.page.width - 70, 120)
        .stroke();

      // Reiniciar cursor debajo del header
      doc.y = 140;
    };

    /* ===================================
      🔷 FOOTER
    ===================================*/
    const drawFooter = () => {
      const bottom = doc.page.height - 70;

      doc
        .moveTo(70, bottom - 15)
        .lineTo(doc.page.width - 70, bottom - 15)
        .stroke();

      doc
        .fontSize(8)
        .font('Times-Roman')
        .text(
          'Jr. Federico Gallese N° 350-370, San Miguel',
          70,
          bottom,
          { align: 'center' }
        )
        .text(
          'Telfs.: 208-5830, 208-5838, anexo 3328*3329',
          { align: 'center' }
        )
        .text(
          'web: www.munisanmiguel.gob.pe',
          { align: 'center' }
        );

      // Número de página
      doc.text(
        `Página ${doc.page.pageNumber}`,
        doc.page.width - 120,
        bottom,
        { align: 'right' }
      );
    };

    /* ===================================
      🔷 CONTROL SEGURO DE NUEVA PÁGINA
    ===================================*/
    const checkPageBreak = (spaceNeeded = 120) => {
      if (doc.y + spaceNeeded > doc.page.height - 100) {
        drawFooter();
        doc.addPage();
        drawHeader();
      }
    };

    // Dibujar primera página
    drawHeader();

    /* ===================================
      🔷 CUERPO
    ===================================*/

    doc.font('Times-Bold').fontSize(12).text('VISTO:', { underline: true });
    doc.moveDown(0.5);

    doc.font('Times-Roman').fontSize(12).text(
      `El Expediente N° ${expediente.numero_expediente} de fecha ${expediente.fecha}, presentado por {representante}, identificado con D.N.I. N° {dni}, en calidad de representante legal de {solicitante} con RUC N° {ruc}, señalando domicilio fiscal en Avenida {direccion_fiscal} - San Miguel, quien solicita LICENCIA DE FUNCIONAMIENTO INDETERMINADA;`,
      { align: 'justify' }
    );

    doc.moveDown();
    checkPageBreak();

    doc.font('Times-Bold').text('CONSIDERANDO:', { underline: true });
    doc.moveDown(0.5);

    doc.font('Times-Roman').text(
      'Que, el artículo II del Título Preliminar de la Ley N° 27972, Ley Orgánica de Municipalidades, señala que los gobiernos locales gozan de autonomía política, económica y administrativa en los asuntos de su competencia...',
      { align: 'justify' }
    );

    doc.moveDown();

    doc.text(
      `Que, con fecha ${expediente.fecha}, el administrado presenta la Solicitud Declaración Jurada conforme a la normativa vigente...`,
      { align: 'justify' }
    );

    doc.moveDown();

    doc.list([
      'Presentación del Formato Solicitud-Declaración Jurada.',
      `Declaración Jurada de Seguridad (calificación: ).`, //${expediente.nivel_riesgo}
      'Número de Recibo de pago correspondiente.',
    ]);

    doc.moveDown();
    checkPageBreak(180);

    doc.font('Times-Bold').text('SE RESUELVE:', { underline: true });
    doc.moveDown();

    doc.font('Times-Roman').text(
      'ARTÍCULO PRIMERO.- Declarar PROCEDENTE la solicitud de LICENCIA DE FUNCIONAMIENTO INDETERMINADA presentada por {solicitante}, para el desarrollo de la actividad comercial de {giros}, ubicado en Avenida {direccion_local}, distrito de San Miguel, con un área de {area} m2.',
      { align: 'justify' }
    );

    doc.moveDown();

    doc.text(
      'ARTÍCULO SEGUNDO.- EMITIR el Certificado de Licencia de Funcionamiento correspondiente.',
      { align: 'justify' }
    );

    doc.moveDown();

    doc.text(
      'ARTÍCULO TERCERO.- El establecimiento comercial queda sujeto a fiscalización posterior...',
      { align: 'justify' }
    );

    doc.moveDown();

    doc.text(
      'ARTÍCULO CUARTO.- NOTIFICAR el presente acto administrativo a la parte interesada.',
      { align: 'justify' }
    );

    // Footer final
    drawFooter();

    doc.end();
  }

  create(createExpedienteDto: CreateExpedienteDto) {
    return 'This action adds a new expediente';
  }

  async findAll(query: FindExpedientesDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    //const q = query.q?.trim() ?? '';   

    /*const where: Prisma.ExpedienteWhereInput = q
  ? {
      OR: [
        {
          numero_expediente: {
            contains: q
          },
        },
        {
          // Busca por nombre_razon_social o numero_documento de la Persona relacionada
          persona: {
            OR: [
              {
                nombre_razon_social: {
                  contains: q,
                  mode: 'insensitive',
                },
              },
              {
                numero_documento: {
                  contains: q,
                  mode: 'insensitive',
                },
              }
            ]
          }
        }
      ]
    }
  : {};*/
    
    const where: Prisma.ExpedienteWhereInput = {};

    if (query.numero_expediente) {
      where.numero_expediente = {
        contains: query.numero_expediente.trim(),
        mode: 'insensitive',
      };
    }

    if (query.razonSocial) {
      Object.assign(where, {
        persona: {
          nombre_razon_social: {
            contains: query.razonSocial.trim(),
            mode: 'insensitive',
          },
        },
      });
    }

    if (query.ruc) {
      Object.assign(where, {
        persona: {
          ruc: {
            contains: query.ruc.trim(),
            mode: 'insensitive',
          },
        },
      });
    }

    if (query.modalidadTramite) {
      Object.assign(where, {
        modalidad_tramite: query.modalidadTramite,
      });
    }

    const fechaFiltro: Prisma.ExpedienteWhereInput['fecha'] = {};

    if (query.fechaInicio) {
      // Buscar registros >= fechaDesde
      fechaFiltro.gte = new Date(query.fechaInicio);
    }

    if (query.fechaFin) {
      // Buscar registros <= fechaHasta. 
      // Se añade 1 día para incluir todo el día 'fechaHasta' si se pasa solo la fecha (e.g. 2025-01-31T00:00:00)
      const dateUntil = new Date(query.fechaFin);
      dateUntil.setDate(dateUntil.getDate() + 1); // Lo convierte en el inicio del día siguiente
      fechaFiltro.lt = dateUntil; 
    }

    if (Object.keys(fechaFiltro).length > 0) {
      Object.assign(where, { fecha: fechaFiltro });
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.expediente.count({ where }),
      this.prisma.expediente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_expediente: "desc" },
        include: {
          persona: {
            select: {
              id_persona: true,
              tipo_persona: true,
              nombre_razon_social: true,
              tipo_documento: true,
              numero_documento: true,
              ruc: true,
            }
          }
        }
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} expediente`;
  }

  update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
    return `This action updates a #${id} expediente`;
  }

  remove(id: number) {
    return `This action removes a #${id} expediente`;
  }

  async crearDemo(payload: NuevaDJTransaccionalRequest): Promise<number> {
    const p = payload;

    const toDate = (d?: string | Date | null) => (d ? new Date(d) : null);
    const toNumber = (v: any) =>
      v === null || v === undefined || v === '' ? null : Number(v);

    return this.prisma.$transaction(async (tx) => {
      // -------- PERSONA: findFirst -> update/create (sin upsert) --------
      const personaOr: any[] = [];
      if (p.persona_upsert.numero_documento) {
        personaOr.push({ numero_documento: p.persona_upsert.numero_documento });
      }
      if (p.persona_upsert.ruc) {
        personaOr.push({ ruc: p.persona_upsert.ruc });
      }
      if (!personaOr.length) {
        throw new Error('Se requiere número de documento o RUC para persona.');
      }

      const personaExist = await tx.persona.findFirst({
        where: { OR: personaOr },
        select: { id_persona: true },
      });

      let personaId: number;
      if (personaExist) {
        await tx.persona.update({
          where: { id_persona: personaExist.id_persona },
          data: {
            tipo_persona: p.persona_upsert.tipo_persona ?? undefined,
            nombre_razon_social: p.persona_upsert.nombre_razon_social ?? undefined,
            tipo_documento: p.persona_upsert.tipo_documento ?? undefined,
            // numero_documento / ruc: solo actualiza si lo necesitas:
            // numero_documento: p.persona_upsert.numero_documento ?? undefined,
            // ruc: p.persona_upsert.ruc ?? undefined,
            telefono: p.persona_upsert.telefono ?? undefined,
            correo: p.persona_upsert.correo ?? undefined,
            via_tipo: p.persona_upsert.via_tipo ?? undefined,
            via_nombre: p.persona_upsert.via_nombre ?? undefined,
            numero: p.persona_upsert.numero ?? undefined,
            interior: p.persona_upsert.interior ?? undefined,
            mz: p.persona_upsert.mz ?? undefined,
            lt: p.persona_upsert.lt ?? undefined,
            otros: p.persona_upsert.otros ?? undefined,
            urb_aa_hh_otros: p.persona_upsert.urb_aa_hh_otros ?? undefined,
            distrito: p.persona_upsert.distrito ?? undefined,
            provincia: p.persona_upsert.provincia ?? undefined
          },
        });
        personaId = personaExist.id_persona;
      } else {
        const created = await tx.persona.create({
          data: {
            tipo_persona: p.persona_upsert.tipo_persona,
            nombre_razon_social: p.persona_upsert.nombre_razon_social,
            tipo_documento: p.persona_upsert.tipo_documento ?? undefined,
            numero_documento: p.persona_upsert.numero_documento ?? undefined,
            ruc: p.persona_upsert.ruc ?? undefined,
            telefono: p.persona_upsert.telefono ?? undefined,
            correo: p.persona_upsert.correo ?? undefined,
            via_tipo: p.persona_upsert.via_tipo ?? undefined,
            via_nombre: p.persona_upsert.via_nombre ?? undefined,
            numero: p.persona_upsert.numero ?? undefined,
            interior: p.persona_upsert.interior ?? undefined,
            mz: p.persona_upsert.mz ?? undefined,
            lt: p.persona_upsert.lt ?? undefined,
            otros: p.persona_upsert.otros ?? undefined,
            urb_aa_hh_otros: p.persona_upsert.urb_aa_hh_otros ?? undefined,
            distrito: p.persona_upsert.distrito ?? undefined,
            provincia: p.persona_upsert.provincia ?? undefined,
          },
          select: { id_persona: true },
        });
        personaId = created.id_persona;
      }

      // -------- REPRESENTANTE: obligatorio solo para PERSONA JURIDICA --------
      const esJuridica = p.persona_upsert.tipo_persona === 'JURIDICA';
      
      let representanteId: number | null = null;

      // ¿El cliente envió datos de representante?
      const hayRepresentante =
        !!p.representante_upsert &&
        (!!p.representante_upsert.numero_documento || !!p.representante_upsert.nombres);

      // Si es JURIDICA: representante es obligatorio
      if (esJuridica && !hayRepresentante) { //!p.representante_upsert?.numero_documento
        throw new Error('Para personas JURIDICAS, el representante es obligatorio.');
      }

      if (hayRepresentante) {
        // Valida mínimos si llegó representante (ajusta según tu schema)
        const numeroDocumento = p.representante_upsert?.numero_documento;
        const tipoDocumento = p.representante_upsert?.tipo_documento;
        const nombres = p.representante_upsert?.nombres;

        // Si quieres ser estricto solo para JURIDICA, valida fuerte; para NATURAL puedes relajar:
        if (esJuridica) {
          if (!numeroDocumento) throw new Error('El representante requiere numero_documento.');
          if (!tipoDocumento) throw new Error('El representante requiere tipo_documento.');
          if (!nombres) throw new Error('El representante requiere nombres.');
        }

        // Busca si ya existe (por N° doc + persona, si modelas esa relación; si no, solo por N° doc)
        const repExist = await tx.representante.findFirst({
          where: {
            numero_documento: numeroDocumento || '',
            // Si tu modelo expone la FK escalar:
            // id_persona: personaId,
            // O por relación:
            persona: { is: { id_persona: personaId } },
          },
          select: { id_representante: true },
        });

        if (repExist) {
          await tx.representante.update({
            where: { id_representante: repExist.id_representante },
            data: {
              // No uses undefined en obligatorios cuando actualizas datos que SÍ quieres cambiar;
              // si no quieres cambiarlos, simplemente omítelos.
              ...(nombres ? { nombres } : {}),
              ...(tipoDocumento ? { tipo_documento: tipoDocumento } : {}),
              ...(numeroDocumento ? { numero_documento: numeroDocumento } : {}),
              sunarp_partida_asiento: p.representante_upsert?.sunarp_partida_asiento ?? null,
            },
          });
          representanteId = repExist.id_representante;
        } else {
          const repCreated = await tx.representante.create({
            data: {
              // Relación obligatoria a Persona
              persona: { connect: { id_persona: personaId } },

              // Si es JURIDICA, ya validamos que estos existan
              nombres: nombres ?? null,
              tipo_documento: tipoDocumento ?? null,
              numero_documento: numeroDocumento ?? null,

              sunarp_partida_asiento: p.representante_upsert?.sunarp_partida_asiento ?? null,
            },
            select: { id_representante: true },
          });
          representanteId = repCreated.id_representante;
        }
      }
      
      /*
      const repExist = await tx.representante.findFirst({
        where: { numero_documento: p.representante_upsert.numero_documento },
        select: { id_representante: true },
      });

      if (repExist) {
        await tx.representante.update({
          where: { id_representante: repExist.id_representante },
          data: {
            nombres: p.representante_upsert.nombres ?? undefined,
            tipo_documento: p.representante_upsert.tipo_documento ?? undefined,
            sunarp_partida_asiento: p.representante_upsert.sunarp_partida_asiento ?? undefined,
          },
        });
        representanteId = repExist.id_representante;
      } else {
        const repCreated = await tx.representante.create({
          data: {
            persona: { connect: { id_persona: personaId } }, //id_persona: personaId,
            nombres: p.representante_upsert.nombres ?? undefined,
            tipo_documento: p.representante_upsert.tipo_documento ?? undefined,
            numero_documento: p.representante_upsert.numero_documento ?? undefined,
            sunarp_partida_asiento: p.representante_upsert.sunarp_partida_asiento ?? undefined,
          },
          select: { id_representante: true },
        });
        representanteId = repCreated.id_representante;
      }*/

      // -------- EXPEDIENTE (padre) --------
      const expediente = await tx.expediente.create({
        data: {
          id_persona: personaId,
          numero_expediente: p.expediente.numero_expediente,
          fecha: new Date(p.expediente.fecha),
          estado: p.expediente.estado ?? null,
        },
        select: { id_expediente: true },
      });
      const idExp = expediente.id_expediente;

      // -------- EXPEDIENTE_LICENCIA (schema exige id_representante) --------
      await tx.expedienteLicencia.create({
        data: {
          id_expediente: idExp,
          id_representante: representanteId ?? undefined, // requerido por tu schema actual
          numero_licencia_origen: p.expediente_licencia.numero_licencia_origen ?? null,
          fecha_recepcion: new Date(p.expediente_licencia.fecha_recepcion),
          tipo_tramite: p.expediente_licencia.tipo_tramite ?? null,
          modalidad: p.expediente_licencia.modalidad ?? null,
          fecha_inicio_plazo: toDate(p.expediente_licencia.fecha_inicio_plazo),
          fecha_fin_plazo: toDate(p.expediente_licencia.fecha_fin_plazo),
          numero_resolucion: p.expediente_licencia.numero_resolucion ?? null,
          resolucion_fecha: toDate(p.expediente_licencia.resolucion_fecha),
          nueva_denominacion: p.expediente_licencia.nueva_denominacion ?? null,
          numero_certificado: p.expediente_licencia.numero_certificado ?? null,
          qr_certificado: p.expediente_licencia.qr_certificado ?? null,
          detalle_otros: p.expediente_licencia.detalle_otros ?? null,
          nivel_riesgo: p.expediente_licencia.nivel_riesgo,
          numero_itse: p.expediente_licencia.numero_itse ?? null,
          doc_itse: p.expediente_licencia.doc_itse ?? null
        },
      });

      // -------- DECLARACION_JURADA --------
      await tx.declaracionJurada.create({
        data: {
          id_expediente: idExp,
          fecha: toDate(p.declaracion_jurada.fecha),
          aceptacion: !!p.declaracion_jurada.aceptacion,
          nombre_comercial: p.declaracion_jurada.nombre_comercial ?? null,
          codigo_ciiu: p.declaracion_jurada.codigo_ciiu ?? null,
          actividad: p.declaracion_jurada.actividad ?? null,
          zonificacion: p.declaracion_jurada.zonificacion ?? null,

          via_tipo: p.declaracion_jurada.via_tipo ?? null,
          via_nombre: p.declaracion_jurada.via_nombre ?? null,
          numero: p.declaracion_jurada.numero ?? null,
          interior: p.declaracion_jurada.interior ?? null,
          mz: p.declaracion_jurada.mz ?? null,
          lt: p.declaracion_jurada.lt ?? null,
          otros: p.declaracion_jurada.otros ?? null,
          urb_aa_hh_otros: p.declaracion_jurada.urb_aa_hh_otros ?? null,
          provincia: p.declaracion_jurada.provincia ?? null,

          tiene_aut_sectorial: !!p.declaracion_jurada.tiene_aut_sectorial,
          aut_entidad: p.declaracion_jurada.aut_entidad ?? null,
          aut_denominacion: p.declaracion_jurada.aut_denominacion ?? null,
          aut_fecha: toDate(p.declaracion_jurada.aut_fecha),
          aut_numero: p.declaracion_jurada.aut_numero ?? null,

          monumento: !!p.declaracion_jurada.monumento,
          aut_ministerio_cultura: !!p.declaracion_jurada.aut_ministerio_cultura,
          num_aut_ministerio_cultura: p.declaracion_jurada.num_aut_ministerio_cultura ?? null,
          fecha_aut_ministerio_cultura: toDate(p.declaracion_jurada.fecha_aut_ministerio_cultura),

          area_total_m2: toNumber(p.declaracion_jurada.area_total_m2) as any,

          //firmante_tipo: p.declaracion_jurada.firmante_tipo ?? null,
          //firmante_nombre: p.declaracion_jurada.firmante_nombre ?? null,
          //firmante_doc_tipo: p.declaracion_jurada.firmante_doc_tipo ?? null,
          //firmante_doc_numero: p.declaracion_jurada.firmante_doc_numero ?? null,

          vigencia_poder: !!p.declaracion_jurada.vigencia_poder,
          condiciones_seguridad: !!p.declaracion_jurada.condiciones_seguridad,
          titulo_profesional: !!p.declaracion_jurada.titulo_profesional,

          observaciones: p.declaracion_jurada.observaciones ?? null,
        },
      });

      // -------- SEGURIDAD ITSE --------
      await tx.seguridadItse.create({
        data: {
          id_expediente: idExp,
          nivel: p.seguridad_itse.nivel ?? null,
          condiciones_seguridad: !!p.seguridad_itse.condiciones_seguridad,
          modal_itse: p.seguridad_itse.modal_itse ?? null,
          numero_itse: p.seguridad_itse.numero_itse ?? null,
          archivo_itse: p.seguridad_itse.archivo_itse ?? null,
          editable: !!p.seguridad_itse.editable,
          calificador_nombre: p.seguridad_itse.calificador_nombre ?? null,
          fecha: toDate(p.seguridad_itse.fecha),
        },
      });

      // -------- OPCIONES (bulk) --------
      if (p.opciones?.length) {
        await tx.expedienteOpciones.createMany({
          data: p.opciones.map((o) => ({
            id_expediente: idExp,
            codigo: o.codigo,
            valor_json: o.valor_json ?? undefined,
          })),
        });
      }

      // -------- ANEXOS (bulk) --------
      if (p.anexos?.length) {
        await tx.anexos.createMany({
          data: p.anexos.map((a) => ({
            id_expediente: idExp,
            nombre: a.nombre ?? null,
            ruta: a.ruta,
            extension: a.extension ?? null,
            tamano_bytes: a.tamano_bytes ?? null,
            hash_archivo: a.hash_archivo ?? null,
            tipo_anexo: a.tipo_anexo ?? null,
          })),
        });
      }

      // -------- GIROS --------
      // 3.6 Giros (resolver por relaciones Giro y Zonificacion)
      if (p.giros_nombres?.length) {
        // 1) Resolver giros por nombre
        // ⬇⬇⬇ CAMBIA 'nombre' por el campo real en tu modelo Giro (por ejemplo 'denominacion')
        const girosBase = await tx.giro.findMany({
          where: { nombre: { in: p.giros_nombres } },
          select: { id_giro: true },
        });

        if (!girosBase.length) {
          // nada que insertar (o lanza error si los giros son obligatorios)
          // throw new Error('Ningún giro coincide con los nombres enviados');
        } else {
          const giroIds = girosBase.map(g => g.id_giro);

          // 2) Resolver la zonificación del payload
          let zonificacionId: number | null = null;
          if (p.declaracion_jurada?.zonificacion) {
            // ⬇⬇⬇ CAMBIA 'codigo' por el campo real en tu modelo Zonificacion (ej. 'nombre' si así se llama)
            const z = await tx.zonificacion.findFirst({
              where: { codigo: p.declaracion_jurada.zonificacion },
              select: { id_zonificacion: true },
            });
            zonificacionId = z?.id_zonificacion ?? null;
          }

          // 3) Buscar las combinaciones en GiroZonificacion
          //    - si tienes zonificación -> filtra por id_zonificacion
          //    - si no tienes zonificación -> trae todas las que existan para esos giros (si tu regla lo permite)
          const gzList = await tx.giroZonificacion.findMany({
            where: {
              id_giro: { in: giroIds },
              ...(zonificacionId ? { id_zonificacion: zonificacionId } : {}),
            },
            select: { id_giro_zonificacion: true },
          });

          if (gzList.length) {
            await tx.declaracionJuradaGiro.createMany({
              data: gzList.map(gz => ({
                id_expediente: idExp,
                id_giro_zonificacion: gz.id_giro_zonificacion,
              })),
            });
          }
        }
      }
      return idExp;
    });
  }

}
