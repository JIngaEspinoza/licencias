import { Injectable } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindExpedientesDto } from './dto/find-expedientes.dto';
import { Prisma } from '@prisma/client';
import { NuevaDJTransaccionalRequest } from './dto/nueva-dj-transaccional.request';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as path from 'path';

@Injectable()
export class ExpedientesService {
  constructor(private readonly prisma: PrismaService){}

  async generarPdf(id: number, res: Response) {
    const expediente = await this.prisma.expediente.findUnique({
      where: { id_expediente: id },
    });

    if (!expediente) throw new Error('Expediente no encontrado');

    const PDFDocument = require('pdfkit');
    const path = require('path');

    // 1. Configuración: autoFirstPage en true y definimos márgenes globales
    // El margin top de 130 reserva el espacio para que el texto no choque con la cabecera
    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true, 
      autoFirstPage: true,
      margins: { 
        top: 140,    // El texto siempre empezará en Y=140 en CUALQUIER página nueva
        bottom: 120, // El texto saltará de página antes de tocar tu Pie de Página
        left: 70, 
        right: 70 
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=resolucion-${id}.pdf`);
    doc.pipe(res);

    // Constantes de diseño
    const MARGIN = 70;
    const PAGE_WIDTH = 595.28;
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');

    /* ===================================
      🔷 PARTE 1: CONTENIDO (Se escribe UNA sola vez)
    ===================================*/
    
    // Título de Resolución
    doc.font('Times-Roman').fontSize(10).text(
      'RESOLUCIÓN DE SUBGERENCIA N° 0125-2026-SGLC-GDECI/MDSM',
      MARGIN, // X: Empezamos en tu margen de 70
      130,    // Y: Bajamos un poco para que no choque con la línea
      { 
        align: 'right', 
        underline: true,
        width: PAGE_WIDTH - (MARGIN * 2)
      }
    );

    doc.font('Times-Roman').fontSize(10).text(
      'San Miguel, 11 de Febrero de 2026',
      { align: 'right' }
    );

    doc.moveDown(1);

    // Sección VISTO
    doc.font('Times-Bold').fontSize(11).text('VISTO:');
    doc.font('Times-Roman').fontSize(10).text(
      `El Expediente N° ${expediente.numero_expediente}, de fecha ${expediente.fecha}, presentado por {representante}, identificado con D.N.I. N° {dni}, en calidad de representante legal de {solicitante} con RUC N° {ruc}, señalando domicilio fiscal en Avenida {direccion_fiscal} - San Miguel, quien solicita LICENCIA DE FUNCIONAMIENTO INDETERMINADA;`,
      { align: 'justify' }
    );

    doc.moveDown(1.5);

    // Sección CONSIDERANDO
    doc.font('Times-Bold').fontSize(11).text('CONSIDERANDO:');
    
    const parrafosConsiderando = [
      'Que, el articulo ll del Título Preliminar de la Ley N• 27972, Ley Orgánica de Municipalidades, señala que los gobiernos locales gozan de autonomía política, económica y administrativa en los asuntos de su competencia. La autonomía que la Constitución Política del Perú establece para las municipalidades radica en la facultad de ejercer actos de gobierno, administrativos y de administración, con sujeción al ordenamiento jurídico;',
      `Que, con fecha ${expediente.fecha}, el administrado VARGAS SOLIS LILIANA CAROLINA, en calidad de representante legal de BUBBLEX S.A.C., presenta el formato de Solicitud Declaración Jurada para autorizaciones municipales, según el Texto Único Ordenado de la Ley N° 28976, Ley Marco de licencias de Funcionamiento, aprobado mediante Decreto Supremo N” 165-2020-PCM y el decreto Supremo N° 200-2020-PCM, para el establecimiento comercial ubicado en Avenida Universitaria N° 571, Urbanización Pando 1° Etapa, distrito de San Miguel, declarando un área de 281.21 m2, para desarrollar la actividad comercial de LAVADO VEHICULAR Y TALLER DE MECANICA`,
      `Que, el presente procedimiento según prescribe el Decreto Supremo N° 200-2020-PCM, que aprueba los Procedimientos Administrativos Estandarizados de Licencia de funcionamiento en cumplimiento del artículo 41° del Texto Único Ordenado de la Ley N° 27444, Ley del Procedimiento Administrativo General y la Ordenanza N" 428/MDSM, Que aprueba la incorporación de los procedimientos administrativos estandarizados al Texto Único de Procedimientos Administrativos — TUPA de la Municipalidad de San Miguel, establece como requisitos para el presente caso, lo siguiente:`,    
    ];

    parrafosConsiderando.forEach(parrafo => {
      doc.font('Times-Roman').fontSize(10).text(parrafo, { align: 'justify' });
      doc.moveDown(0.8);
    });

    doc.list([
      `Presentación del Formato Solicitud-Declaración Jurada.`,
      `Declaración Jurada de Cumplimiento de Condiciones de Seguridad en la Edificación calificación: Riesgo Medio).`,
      `Número de Recibo de pago (N° 017707-2026 por el monto de S/ 178.90 de fecha 01/02/2026)`,
    ]);

    doc.moveDown(0.8);

    doc.text(
      `Que, de la revisión del expediente, se observa gue el administrado cumple con presentar los requisitos determinados por Iey, por lo que corresponde a este despacho continuar con el procedimiento;`,
      { align: 'justify' }
    );

    doc.moveDown(0.8);

    doc.text(
      `Que, según el artículo 6° de la norma acotada, referido a la evaluación del expediente por parte de la autoridad competente, señala lo siguiente: “para el otorgamiento de la Licencia de Funcionamiento, la municipalidad evaluará los siguientes aspectos:`,
      { align: 'justify' }
    );

    doc.moveDown(0.8);

    doc.list([
      'Zonificación y Compatibilidad de Uso.',
      `Condiciones de Seguridad de la Edificación.`,
    ]);

    doc.moveDown(0.8);

    doc.font('Times-Italic').text('Cualquier aspecto adicional será materia de fiscalización posterior', { underline: true });
    doc.moveDown(0.8);

    const parrafos2 = [
      `Que, de la revisión del formato Solicitud-Declaración Jurada presentado, en relación al establecimiento comercial ubicado en Avenida Universitaria N° 571, Urbanización Pando 1° Etapa, distrito de san Miguel, el técnico que evalúa la documentación, consigna la Zonificación de COMERCIO ZONAL (CZ), en la Ficha Técnica de Zonificación y Compatibilidad de Uso N° 02 19-2026: de conformidad con la Ordenanza N° 1015- MML, que aprueba el reajuste integral de la zonificación de los usos del suelo de los distritos de San Martín de Porres y otros que forman parte de las áreas de Tratamiento Normativo I y II de Lima Metropolitana y la Ordenanza N° 2146-MML que aprueba el Plano de Zonificación de los Usos del Suelo: en dicho sentido el establecimiento comercial, conforme al cuadro de Índice de Usos solicitados como {giros} con código {código_giros}, es considerado {compatible} con la zonificación vigente.`, 
      `Que, asimismo, a fojas ocho (08) al once (11), obra la presentación de la Declaración Jurada de Cumplimiento de Condiciones de Seguridad en la Edificación proporcionada por el solicitante para la determinación del nivel de riesgo del establecimiento objeto de inspección - Anexo 4, cumpliendo con las condiciones de seguridad exigidas por ley, en concordancia con lo prescrito en el Decreto Supremo que aprueba el Nuevo Reglamento de Inspecciones Técnicas de Seguridad en edificaciones N" 002-2018-PCM, que en su artículo 15, numeral 15. 1. señala "que para el caso de los establecimientos objeto de inspección clasificados con riesgo bajo o medio, que requieren de una ITSE posterior conforme al numeral 18.1 del artículo 18" del Reglamento" la licencia de funcionamiento es sustentada con la Declaración Jurada de Cumplimiento de Condiciones de Seguridad en la Edificación, que es materia de verificación a través de la ITSE posterior, finalizando el procedimiento con la emisión de una resolución. y, de corresponder, el Certificado de ITSE; debiendo este despacho emitir pronunciamiento;`,
      `Por las consideraciones expuestas y en uso de las facultades conferidas por el numeral 3.6 del artículo 83° de la Ley N 27972, Ley Orgánica de Municipalidades y a Io dispuesto por la Ley N" 28976, Ley Marco de Licencia de Funcionamiento:`
    ];

    parrafos2.forEach(element => {
      doc.font('Times-Roman').fontSize(10).text(element, { align: 'justify' });
      doc.moveDown(0.8);
    });

    doc.font('Times-Bold').fontSize(11).text('SE RESUELVE:');
    doc.moveDown(0.8);

    const parrafos3 = [
      `<b>ARTÍCULO PRIMERO.</b> - Declarar PROCEDENTE la solicitud de LICENCIA DE FUNCIONAMIENTO INDETERMINADA, presentado por {solicitante}, para el desarrollo de la actividad comercial de {giros}, en el establecimiento comercial ubicado en Avenida {dirección_local}, distrito de San Miguel, con un área de {área} m2, por las consideraciones expuestas en la presente resolución.`, 
      `<b>ARTÍCULO SEGUNDO.</b> - EMITIR el Certificado de Licencia de Funcionamiento N 24662, la presente Resolución no autoriza el uso de la vía pública, retiro municipal y/o edificaciones antirreglamentarias.`,
      `<b>ARTÍCULO TERCERO.</b> - El establecimiento comercial queda sujeto a fiscalización posterior a fin de verificar que los datos proporcionados sean verdaderos, en caso de existir discrepancias entre lo declarado y lo constatado, se procederá a dar inicio al procedimiento administrativo de NULIDAD de la licencia de funcionamiento expedida y a iniciar las acciones legales por presentar declaración jurada con datos falsos, así mismo en caso de detectarse irregularidades durante la vigencia de la presente licencia de funcionamiento, con referencia a quejas o por denuncias de terceros, ampliación de giros no autorizados, emisión de humo, gases, ruidos molestos; la administración procederá a dejar sin efecto la licencia, ordenando la clausura del establecimiento, sin perjuicio de las acciones penales por el delito contra la administración pública.`,
      `<b>ARTÍCULO CUARTO.</b> - NOTIFICAR el presente acto administrativo a la parte interesada, y poner de conocimiento a la Subgerencia de Inspecciones y Control de Sanciones, a efecto de velar por el cumplimiento de las condiciones de funcionamiento en la presente resolución.`
    ];

    parrafos3.forEach(p => {
      // LLAMADA A LA FUNCIÓN QUE ESTÁ AFUERA
      this.imprimirTextoFormateado(doc, p, MARGIN, PAGE_WIDTH);
    });
    /*parrafos3.forEach(element => {
      doc.font('Times-Roman').fontSize(10).text(element, { align: 'justify' });
      doc.moveDown(0.8);
    });*/

    doc.font('Times-BoldItalic').fontSize(10).text(
      `REGISTRESE, COMUNÍQUESE, CÚMPLASE`,
      { align: 'left' }
    );

    /* ===================================
      PARTE 2: ESTAMPADO DE CABECERA Y PIE
    ===================================*/
    
    const range = doc.bufferedPageRange(); // Sabe si el texto ocupó 1, 2 o más páginas

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      // --- CABECERA (Posición Absoluta) ---
      try { doc.image(logoPath, MARGIN, 40, { width: 70 }); } catch (e) {}
      
      doc.font('Times-Bold').fontSize(7).text('MUNICIPALIDAD DISTRITAL DE SAN MIGUEL', MARGIN, 80);
      doc.font('Times-Roman').fontSize(7)
        .text('GERENCIA DE DESARROLLO ECONÓMICO Y COOPERACIÓN INTERINSTITUCIONAL', MARGIN, 90)
        .text('SUBGERENCIA DE LICENCIA Y COMERCIO', MARGIN, 100);

      doc.moveTo(MARGIN, 115).lineTo(PAGE_WIDTH - MARGIN, 115).lineWidth(0.5).stroke();

      const FOOTER_Y = 730;
      
      // Dibujamos la línea
      doc.moveTo(MARGIN, FOOTER_Y).lineTo(PAGE_WIDTH - MARGIN, FOOTER_Y).lineWidth(0.5).stroke();
      
      doc.font('Times-Roman').fontSize(8);
      doc.text(
        'Jr. Federico Gallese N° 350-370, San Miguel Telfs.: 208-5830, 208-5838, anexo 3328*3329', 
        MARGIN, 
        FOOTER_Y + 10, 
        { lineBreak: false }
      );

      doc.text(
        'Web: www.munisanmiguel.gob.pe', 
        MARGIN, 
        FOOTER_Y + 20, 
        { lineBreak: false }
      );

      doc.text(
        `Página ${i + 1} de ${range.count}`, 
        460,
        FOOTER_Y + 10, 
        { lineBreak: false }
      );
    }

    doc.end();
  }

  private imprimirTextoFormateado(doc: any, textoFull: string, MARGIN: number, PAGE_WIDTH: number) {
    const widthArea = PAGE_WIDTH - (MARGIN * 2);
    const partes = textoFull.split(/(<b>.*?<\/b>|<i>.*?<\/i>)/g);

    partes.forEach((parte, index) => {
      if (!parte) return;

      let fuente = 'Times-Roman';
      if (parte.startsWith('<b>')) fuente = 'Times-Bold';
      if (parte.startsWith('<i>')) fuente = 'Times-Italic';
      if (parte.startsWith('<b><i>') || parte.startsWith('<i><b>')) fuente = 'Times-BoldItalic';

      const textoLimpio = parte.replace(/<\/?b>/g, '').replace(/<\/?i>/g, '');
      const esUltimo = index === partes.length - 1;

      doc.font(fuente).fontSize(10).text(textoLimpio, {
        continued: !esUltimo,
        align: 'justify',
        width: widthArea
      });
    });
    doc.moveDown(0.8);
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
