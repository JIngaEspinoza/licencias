import React from "react";
import { useNavigate } from "react-router-dom";
import { expedientesApi } from "../../services/expedientes";
import { ChevronLeft, Plus, Search } from "lucide-react";
import type { NuevaDJTransaccionalRequest } from "@/types/declaracionJurada";

/*const BuscarExpedienteDialog = React.lazy(() => import("../../components/BuscarExpedientesDialog"));
type Expediente = import("../../components/BuscarExpedientesDialog").Expediente;*/

import BuscarExpedienteDialog, { Expediente } from "../../components/BuscarExpedientesDialog";

const pretty = (obj: any) => JSON.stringify(obj, null, 2);

type CardProps = { title: string; disabled?: boolean; children: React.ReactNode };
const Card: React.FC<CardProps> = ({ title, disabled, children }) => (
  <div className={`rounded-2xl border ${disabled ? "opacity-50" : ""} bg-white/70 shadow-sm p-5`}>
    <h3 className="font-semibold text-lg mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

// ====== MOCK: todo al TOP-LEVEL, fuera del componente ======
const USE_MOCK = true;

const MOCK_EXPEDIENTES: Expediente[] = [
  { id_expediente: 1, numero: "EXP-2025-000123", ruc: "20123456789", razon_social: "EMPRESA S.A.C.", solicitante: "Juan Pérez", estado: "EN_EVALUACION" },
  { id_expediente: 2, numero: "EXP-2025-000456", ruc: "20654321987", razon_social: "COMERCIAL ANDES SRL", solicitante: "María López", estado: "APROBADO" },
  { id_expediente: 3, numero: "EXP-2025-000789", ruc: "10456789012", razon_social: "SERVICIOS PACÍFICO EIRL", solicitante: "Carlos Ruiz", estado: "OBSERVADO" },
];

const norm = (s?: string | null) =>
  (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Si quieres usarla solo aquí, NO la exportes:
async function fetchExpedientes(q: { numero: string; ruc: string; razon_social: string; }): Promise<Expediente[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const nNumero = norm(q.numero);
    const nRuc = q.ruc?.trim();
    const nRazon = norm(q.razon_social);
    return MOCK_EXPEDIENTES.filter((e) => {
      const mNum = nNumero ? norm(e.numero).includes(nNumero) : true;
      const mRuc = nRuc ? (e.ruc ?? "").startsWith(nRuc) : true;
      const mRaz = nRazon ? norm(e.razon_social).includes(nRazon) : true;
      return mNum && mRuc && mRaz;
    });
  }

  const res = await fetch("/api/expedientes/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
  });
  if (!res.ok) throw new Error("Error buscando expedientes");
  return res.json();
}

export default function ExpedienteForm() {
  const navigate = useNavigate();

  const [numeroExpediente, setNumeroExpediente] = React.useState("");

  // Implementa tu fetch real (API, Prisma, etc.)
  /*const fetchExpedientes = async (q: { numero: string; ruc: string; razon_social: string; }) : Promise<Expediente[]> => {
    const res = await fetch("/api/expedientes/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(q),
    });
    if (!res.ok) throw new Error("Error buscando expedientes");
    return res.json();
  };*/

  // -------------------------
  // Estado general
  // -------------------------
  const [modo, setModo] = React.useState<"NUEVA" | "MODIFICACION">("NUEVA");

  // II Datos del solicitante
  const [tipoPersona, setTipoPersona] = React.useState<"NATURAL" | "JURIDICA">("NATURAL");
  const [nombreRazon, setNombreRazon] = React.useState("Inga Espinoza Jonadab");
  const [docTipo, setDocTipo] = React.useState<"DNI" | "CE">("DNI");
  const [docNumero, setDocNumero] = React.useState("47361628");
  const [ruc, setRuc] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [correo, setCorreo] = React.useState("jingaespinoza@gmail.com");

  // Dirección
  const [viaTipo, setViaTipo] = React.useState("Av.");
  const [viaNombre, setViaNombre] = React.useState("Gastronomía");
  const [numeroPuerta, setNumeroPuerta] = React.useState("");
  const [interior, setInterior] = React.useState("");
  const [mz, setMz] = React.useState("");
  const [lt, setLt] = React.useState("");
  const [otrosDir, setOtrosDir] = React.useState("");
  const [urbAAHH, setUrbAAHH] = React.useState("");
  const [distrito, setDistrito] = React.useState("San Miguel");
  const [provincia, setProvincia] = React.useState("Lima");

  // Representación (PJ)
  const [poderVigente, setPoderVigente] = React.useState(true);
  const [sunarpArchivo, setSunarpArchivo] = React.useState("");

  // NUEVA — Modalidad y opciones
  const [modalidad, setModalidad] = React.useState<"INDETERMINADA" | "TEMPORAL">("INDETERMINADA");
  const [fechaIni, setFechaIni] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");
  const [opAnuncio, setOpAnuncio] = React.useState(false);
  const [opCesionario, setOpCesionario] = React.useState(false);
  const [opMercado, setOpMercado] = React.useState(false);
  const [tipoAnuncio, setTipoAnuncio] = React.useState("");
  const [licenciaPrincipal, setLicenciaPrincipal] = React.useState("");

  // MODIFICACIÓN — acción única
  const [accion, setAccion] = React.useState<"" | "CAMBIO_DENOMINACION" | "TRANSFERENCIA" | "CESE" | "OTROS">("");
  const [nroLicenciaOrigen, setNroLicenciaOrigen] = React.useState("");
  const [nuevaDenominacion, setNuevaDenominacion] = React.useState("");
  const [detalleOtros, setDetalleOtros] = React.useState("");

  // Seguridad / ITSE
  const [nivel, setNivel] = React.useState<"BAJO" | "MEDIO" | "ALTO" | "MUY_ALTO">("BAJO");
  const [condSeguridad, setCondSeguridad] = React.useState(true);
  const itseRequierePrevia = React.useMemo(() => ["ALTO", "MUY_ALTO"].includes(nivel), [nivel]);
  const [itseNumero, setItseNumero] = React.useState("");
  const [itseArchivo, setItseArchivo] = React.useState("");

  // Anexos (simulados)
  const [anexoNombre, setAnexoNombre] = React.useState("");
  const [anexos, setAnexos] = React.useState<string[]>([]);

  // DJ generales
  //const [numeroExpediente, setNumeroExpediente] = React.useState("EXP-2025-0001");
  const [fechaRecepcion, setFechaRecepcion] = React.useState(new Date().toISOString().slice(0, 10));
  const [estado, setEstado] = React.useState("EN_EVALUACION");

  const nuevaDisabled = modo !== "NUEVA";
  const modifDisabled = modo !== "MODIFICACION";

  const isModBasica =
    modo === "MODIFICACION" &&
    ["CAMBIO_DENOMINACION", "TRANSFERENCIA", "CESE"].includes(accion);

  // III — Representante legal o apoderado
  const [repNombre, setRepNombre] = React.useState("");
  const [repDocTipo, setRepDocTipo] = React.useState<"DNI" | "CE">("DNI");
  const [repDocNumero, setRepDocNumero] = React.useState("");
  const [repSunarp, setRepSunarp] = React.useState("");

  // IV — Datos del establecimiento
  const [estNombreComercial, setEstNombreComercial] = React.useState("");
  const [estCiiu, setEstCiiu] = React.useState("");
  const [estGiroInput, setEstGiroInput] = React.useState("");
  const [estGiros, setEstGiros] = React.useState<string[]>([]);
  const [estActividad, setEstActividad] = React.useState("");
  const [estZonificacion, setEstZonificacion] = React.useState("");

  // Dirección del establecimiento
  const [estViaTipo, setEstViaTipo] = React.useState("Av.");
  const [estViaNombre, setEstViaNombre] = React.useState("");
  const [estNumeroPuerta, setEstNumeroPuerta] = React.useState("");
  const [estInterior, setEstInterior] = React.useState("");
  const [estMz, setEstMz] = React.useState("");
  const [estLt, setEstLt] = React.useState("");
  const [estOtrosDir, setEstOtrosDir] = React.useState("");
  const [estUrbAAHH, setEstUrbAAHH] = React.useState("");
  const [estProvincia, setEstProvincia] = React.useState("");

  const [estTieneAutSectorial, setEstTieneAutSectorial] = React.useState(false);
  const [estAutEntidad, setEstAutEntidad] = React.useState("");
  const [estAutDenominacion, setEstAutDenominacion] = React.useState("");
  const [estAutFecha, setEstAutFecha] = React.useState("");
  const [estAutNumero, setEstAutNumero] = React.useState("");

  const [estAreaTotal, setEstAreaTotal] = React.useState("");

  // V — Declaración Jurada
  const [djDeclaroPoder, setDjDeclaroPoder] = React.useState(false);
  const [djDeclaroTituloProf, setDjDeclaroTituloProf] = React.useState(false);
  const [djObservaciones, setDjObservaciones] = React.useState("");
  const [djFecha, setDjFecha] = React.useState(new Date().toISOString().slice(0, 10));
  const [djAcepto, setDjAcepto] = React.useState(false);

  const [djFirmanteTipo, setDjFirmanteTipo] = React.useState<"SOLICITANTE" | "REPRESENTANTE">("SOLICITANTE");
  const [djFirmanteNombre, setDjFirmanteNombre] = React.useState("");
  const [djFirmanteDocTipo, setDjFirmanteDocTipo] = React.useState<"DNI" | "CE">("DNI");
  const [djFirmanteDocNumero, setDjFirmanteDocNumero] = React.useState("");

  React.useEffect(() => {
    if (djFirmanteTipo === "SOLICITANTE") {
      setDjFirmanteNombre(nombreRazon || "");
      setDjFirmanteDocTipo(tipoPersona === "NATURAL" ? docTipo : "DNI");
      setDjFirmanteDocNumero(tipoPersona === "NATURAL" ? (docNumero || "") : "");
      setDjDeclaroPoder(false);
    } else {
      setDjFirmanteNombre(repNombre || "");
      setDjFirmanteDocTipo(repDocTipo || "DNI");
      setDjFirmanteDocNumero(repDocNumero || "");
      setDjDeclaroPoder(true);
    }
  }, [djFirmanteTipo, nombreRazon, docTipo, docNumero, repNombre, repDocTipo, repDocNumero, tipoPersona]);

  // VI — Clasificación (simulada municipal)
  const [califEditable, setCalifEditable] = React.useState(false);
  const [califNivel, setCalifNivel] = React.useState<"" | "BAJO" | "MEDIO" | "ALTO" | "MUY_ALTO">("");
  const [califNombre, setCalifNombre] = React.useState("");
  const [califFecha, setCalifFecha] = React.useState("");

  // Helpers
  const personaBuildKey = () =>
    [
      tipoPersona, nombreRazon, docTipo, docNumero, ruc, telefono, correo,
      viaTipo, viaNombre, numeroPuerta, interior, mz, lt, otrosDir, urbAAHH,
      distrito, provincia, poderVigente, sunarpArchivo,
    ].join("|");

  const seguridadBuildKey = () =>
    [nivel, condSeguridad, itseRequierePrevia, itseNumero, itseArchivo].join("|");

  // Payload SIMULADO (para mostrar en JSON)
  const payload = React.useMemo(() => {
    const persona = {
      tipo_persona: tipoPersona,
      nombre_razon_social: nombreRazon,
      documentos: {
        tipo: tipoPersona === "NATURAL" ? docTipo : (ruc ? "RUC" : null),
        numero: tipoPersona === "NATURAL" ? (docNumero || null) : null,
        ruc: ruc || null,
      },
      contacto: { telefono: telefono || null, correo: correo || null },
      direccion: {
        via_tipo: viaTipo,
        via_nombre: viaNombre || null,
        numero: numeroPuerta || null,
        interior: interior || null,
        mz: mz || null,
        lt: lt || null,
        otros: otrosDir || null,
        urb_aa_hh_otros: urbAAHH || null,
        distrito: distrito || null,
        provincia: provincia || null,
      },
      poder_vigente: tipoPersona === "JURIDICA" ? poderVigente : undefined,
      vigencia_poder_archivo: tipoPersona === "JURIDICA" ? (sunarpArchivo || null) : null,
    };

    const seguridad = {
      nivel,
      condiciones_seguridad: condSeguridad,
      itse_modalidad: itseRequierePrevia ? "PREVIA" : "POSTERIOR",
      itse_numero: itseRequierePrevia ? (itseNumero || null) : null,
      itse_archivo: itseRequierePrevia ? (itseArchivo || null) : null,
    };

    const representante =
      (tipoPersona === "JURIDICA")
        ? {
            nombres: repNombre || null,
            documento: { tipo: repDocTipo, numero: repDocNumero || null },
            sunarp_partida_asiento: repSunarp || null,
          }
        : null;

    const establecimiento = {
      nombre_comercial: estNombreComercial || null,
      codigo_ciiu: estCiiu || null,
      giros: estGiros,
      actividad: estActividad || null,
      zonificacion: estZonificacion || null,
      direccion: {
        via_tipo: estViaTipo,
        via_nombre: estViaNombre || null,
        numero: estNumeroPuerta || null,
        interior: estInterior || null,
        mz: estMz || null,
        lt: estLt || null,
        otros: estOtrosDir || null,
        urb_aa_hh_otros: estUrbAAHH || null,
        provincia: estProvincia || null,
      },
      autorizacion_sectorial: estTieneAutSectorial
        ? {
            entidad: estAutEntidad || null,
            denominacion: estAutDenominacion || null,
            fecha: estAutFecha || null,
            numero: estAutNumero || null,
          }
        : null,
      area_total_m2: estAreaTotal ? Number(estAreaTotal) : null,
    };

    const declaracion = {
      fecha: djFecha || null,
      aceptacion: djAcepto,
      observaciones: djObservaciones || null,
      firmante: {
        tipo: djFirmanteTipo,
        nombres: djFirmanteNombre || null,
        doc: { tipo: djFirmanteDocTipo, numero: djFirmanteDocNumero || null },
      },
      declaraciones: {
        poder_vigente: djDeclaroPoder,
        condiciones_seguridad: condSeguridad,
        titulo_profesional: djDeclaroTituloProf,
      },
      firma_digital_hash: null,
    };

    const clasificacion_riesgo_municipal = {
      editable: califEditable,
      nivel_itse: califNivel || null,
      calificador_nombre: califNombre || null,
      fecha: califFecha || null,
    };

    if (modo === "NUEVA") {
      const opciones: Array<{ codigo: string; valor_json?: any }> = [];
      if (opAnuncio) opciones.push({ codigo: "ANUNCIO_PUBLICITARIO", valor_json: { tipoAnuncio } });
      if (opCesionario) opciones.push({ codigo: "CESIONARIO", valor_json: { nroLicenciaPrincipal: licenciaPrincipal } });
      if (opMercado) opciones.push({ codigo: "MERCADO_GALERIA_CC" });

      return {
        numero_expediente: numeroExpediente,
        fecha_recepcion: fechaRecepcion,
        persona,
        representante,
        establecimiento,
        seguridad,
        declaracion,
        clasificacion_riesgo_municipal,
        tipo_tramite: "NUEVA",
        modalidad: modalidad,
        fecha_inicio_plazo: modalidad === "TEMPORAL" ? (fechaIni || null) : null,
        fecha_fin_plazo: modalidad === "TEMPORAL" ? (fechaFin || null) : null,
        opciones,
        anexos,
        estado,
      };
    }

    return {
      numero_expediente: numeroExpediente,
      fecha_recepcion: fechaRecepcion,
      persona,
      representante,
      establecimiento,
      seguridad,
      declaracion,
      clasificacion_riesgo_municipal,
      tipo_tramite: accion || "(elige una acción)",
      id_licencia_origen: nroLicenciaOrigen || null,
      nueva_denominacion: accion === "CAMBIO_DENOMINACION" ? (nuevaDenominacion || null) : null,
      detalle_otros: accion === "OTROS" ? (detalleOtros || null) : null,
      anexos,
      estado,
    };
  }, [
    modo,
    numeroExpediente,
    fechaRecepcion,
    personaBuildKey(),
    seguridadBuildKey(),
    modalidad,
    fechaIni,
    fechaFin,
    opAnuncio,
    opCesionario,
    opMercado,
    tipoAnuncio,
    licenciaPrincipal,
    accion,
    nroLicenciaOrigen,
    nuevaDenominacion,
    detalleOtros,
    anexos.join("|"),
    estado,
    repNombre, repDocTipo, repDocNumero, repSunarp,
    estNombreComercial, estCiiu, estGiros.join("|"), estActividad, estZonificacion,
    estViaTipo, estViaNombre, estNumeroPuerta, estInterior, estMz, estLt, estOtrosDir,
    estUrbAAHH, estProvincia,
    djFecha, djAcepto, djObservaciones,
    djFirmanteTipo, djFirmanteNombre, djFirmanteDocTipo, djFirmanteDocNumero,
    djDeclaroPoder, djDeclaroTituloProf,
    califEditable, califNivel, califNombre, califFecha,
  ]);

  const dto: NuevaDJTransaccionalRequest = {
    expediente: {
      numero_expediente: payload.numero_expediente,
      fecha: payload.fecha_recepcion,
      estado: payload.estado ?? null,
    },
    persona_upsert: {
      tipo_persona: payload.persona?.tipo_persona,
      nombre_razon_social: payload.persona?.nombre_razon_social,
      tipo_documento: payload.persona?.documentos?.tipo ?? null,
      numero_documento: payload.persona?.documentos?.numero ?? null,
      ruc: payload.persona?.documentos?.ruc ?? null,
      telefono: payload.persona?.contacto?.telefono ?? null,
      correo: payload.persona?.contacto?.correo ?? null,
      via_tipo: payload.persona?.direccion?.via_tipo ?? null,
      via_nombre: payload.persona?.direccion?.via_nombre ?? null,
      numero: payload.persona?.direccion?.numero ?? null,
      interior: payload.persona?.direccion?.interior ?? null,
      mz: payload.persona?.direccion?.mz ?? null,
      lt: payload.persona?.direccion?.lt ?? null,
      otros: payload.persona?.direccion?.otros ?? null,
      urb_aa_hh_otros: payload.persona?.direccion?.urb_aa_hh_otros ?? null,
      distrito: payload.persona?.direccion?.distrito ?? null,
      provincia: payload.persona?.direccion?.provincia ?? null,
      // si estos campos no existen en Persona, elimínalos:
      // vigencia_poder: payload.persona?.poder_vigente ?? null,
      // vigencia_poder_archivo: payload.persona?.vigencia_poder_archivo ?? null,
    },
    representante_upsert: payload.representante
      ? {
          nombres: payload.representante.nombres ?? null,
          tipo_documento: payload.representante.documento?.tipo ?? null,
          numero_documento: payload.representante.documento?.numero ?? null,
          sunarp_partida_asiento: payload.representante.sunarp_partida_asiento ?? null,
        }
      : undefined,
    expediente_licencia: {
      numero_licencia_origen: payload.id_licencia_origen ?? null,
      fecha_recepcion: payload.fecha_recepcion,
      tipo_tramite: payload.tipo_tramite ?? null,
      modalidad: payload.modalidad ?? null,
      fecha_inicio_plazo: payload.fecha_inicio_plazo ?? null,
      fecha_fin_plazo: payload.fecha_fin_plazo ?? null,
      nueva_denominacion: payload.nueva_denominacion ?? null,
      detalle_otros: payload.detalle_otros ?? null,
      numero_resolucion: null,
      resolucion_fecha: null,
      numero_certificado: null,
      qr_certificado: null,
    },
    declaracion_jurada: {
      fecha: payload.declaracion?.fecha ?? null,
      aceptacion: !!payload.declaracion?.aceptacion,
      nombre_comercial: payload.establecimiento?.nombre_comercial ?? null,
      codigo_ciiu: payload.establecimiento?.codigo_ciiu ?? null,
      actividad: payload.establecimiento?.activity ?? payload.establecimiento?.actividad ?? null,
      zonificacion: payload.establecimiento?.zonificacion ?? null,
      via_tipo: payload.establecimiento?.direccion?.via_tipo ?? null,
      via_nombre: payload.establecimiento?.direccion?.via_nombre ?? null,
      numero: payload.establecimiento?.direccion?.numero ?? null,
      interior: payload.establecimiento?.direccion?.interior ?? null,
      mz: payload.establecimiento?.direccion?.mz ?? null,
      lt: payload.establecimiento?.direccion?.lt ?? null,
      otros: payload.establecimiento?.direccion?.otros ?? null,
      urb_aa_hh_otros: payload.establecimiento?.direccion?.urb_aa_hh_otros ?? null,
      provincia: payload.establecimiento?.direccion?.provincia ?? null,
      tiene_aut_sectorial: !!payload.establecimiento?.autorizacion_sectorial,
      aut_entidad: payload.establecimiento?.autorizacion_sectorial?.entidad ?? null,
      aut_denominacion: payload.establecimiento?.autorizacion_sectorial?.denominacion ?? null,
      aut_fecha: payload.establecimiento?.autorizacion_sectorial?.fecha ?? null,
      aut_numero: payload.establecimiento?.autorizacion_sectorial?.numero ?? null,
      monumento: false,
      aut_ministerio_cultura: false,
      num_aut_ministerio_cultura: null,
      fecha_aut_ministerio_cultura: null,
      area_total_m2:
        typeof payload.establecimiento?.area_total_m2 === "number"
          ? payload.establecimiento.area_total_m2
          : payload.establecimiento?.area_total_m2 ?? null,
      firmante_tipo: payload.declaracion?.firmante?.tipo ?? null,
      firmante_nombre: payload.declaracion?.firmante?.nombres ?? null,
      firmante_doc_tipo: payload.declaracion?.firmante?.doc?.tipo ?? null,
      firmante_doc_numero: payload.declaracion?.firmante?.doc?.numero ?? null,
      vigencia_poder: !!payload.declaracion?.declaraciones?.poder_vigente,
      condiciones_seguridad: !!payload.declaracion?.declaraciones?.condiciones_seguridad,
      titulo_profesional: !!payload.declaracion?.declaraciones?.titulo_profesional,
      observaciones: payload.declaracion?.observaciones ?? null,
    },
    seguridad_itse: {
      nivel: payload.seguridad?.nivel ?? null,
      condiciones_seguridad: !!payload.seguridad?.condiciones_seguridad,
      modal_itse: payload.seguridad?.itse_modalidad ?? null,
      numero_itse: payload.seguridad?.itse_numero ?? null,
      archivo_itse: payload.seguridad?.itse_archivo ?? null,
      editable: !!payload.clasificacion_riesgo_municipal?.editable,
      calificador_nombre: payload.clasificacion_riesgo_municipal?.calificador_nombre ?? null,
      fecha: payload.clasificacion_riesgo_municipal?.fecha ?? null,
    },
    opciones: Array.isArray(payload.opciones) ? payload.opciones : [],
    giros_nombres: Array.isArray(payload.establecimiento?.giros) ? payload.establecimiento.giros : [],
    anexos: Array.isArray(payload.anexos)
      ? payload.anexos.map((n: string) => ({
          nombre: n,
          ruta: `/uploads/${n}`,
          extension: n.split(".").pop() || null,
        }))
      : [],
  };



  // Validaciones mínimas (mismas que tu demo)
  const errores: string[] = [];
  if (!nombreRazon.trim()) errores.push("Ingresa apellidos y nombres / razón social.");
  if (tipoPersona === "NATURAL" && !docNumero.trim()) errores.push(`Ingresa N° ${docTipo} del solicitante.`);
  if (tipoPersona === "JURIDICA") {
    if (!ruc.trim()) errores.push("Ingresa RUC para persona jurídica.");
    if (!poderVigente) errores.push("Marca 'Poder vigente' para persona jurídica.");
    if (!sunarpArchivo.trim()) errores.push("Adjunta archivo de vigencia de poder (SUNARP).");
    if (!repNombre.trim()) errores.push("Indica Apellidos y Nombres del representante.");
    if (!repDocNumero.trim()) errores.push(`Indica N.º de ${repDocTipo} del representante.`);
  }
  if (correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) errores.push("Correo electrónico no válido.");
  if (!viaNombre.trim()) errores.push("Completa Av./Jr./Ca./Pje. (nombre de vía).");
  if (!distrito.trim() || !provincia.trim()) errores.push("Completa Distrito y Provincia.");
  if (!condSeguridad) errores.push("Debes declarar que cumples condiciones de seguridad.");
  if (itseRequierePrevia) {
    if (!itseNumero.trim()) errores.push("Para nivel ALTO/MUY_ALTO se requiere N.º de ITSE (previa).");
    if (!itseArchivo.trim()) errores.push("Adjunta certificado/acta de ITSE (previa).");
  }
  if (!estNombreComercial.trim()) errores.push("Ingresa el Nombre Comercial del establecimiento.");
  if (!estCiiu.trim()) errores.push("Ingresa el Código CIIU.");
  if (estGiros.length === 0) errores.push("Agrega al menos un Giro del establecimiento.");
  if (!estViaNombre.trim()) errores.push("Completa el nombre de vía del establecimiento.");
  if (!estProvincia.trim()) errores.push("Completa la Provincia del establecimiento.");
  if (estTieneAutSectorial) {
    if (!estAutEntidad.trim()) errores.push("Indica la entidad que otorga la autorización sectorial.");
    if (!estAutDenominacion.trim()) errores.push("Indica la denominación de la autorización sectorial.");
    if (!estAutFecha) errores.push("Indica la fecha de la autorización sectorial.");
    if (!estAutNumero.trim()) errores.push("Indica el número de la autorización sectorial.");
  }
  if (!estAreaTotal || isNaN(Number(estAreaTotal)) || Number(estAreaTotal) <= 0) {
    errores.push("Ingresa el área total solicitada (m²) mayor a 0.");
  }
  if (!djAcepto) errores.push("Debes aceptar la declaración bajo juramento.");
  if (!djFecha) errores.push("Indica la fecha de declaración.");
  if (!djFirmanteNombre.trim()) errores.push("Indica nombres y apellidos del firmante.");
  if (!djFirmanteDocNumero.trim()) errores.push(`Indica N.º de ${djFirmanteDocTipo} del firmante.`);
  if (djFirmanteTipo === "REPRESENTANTE" && !djDeclaroPoder) {
    errores.push("El representante debe declarar que cuenta con poder vigente.");
  }
  if (califEditable) {
    if (!califNivel) errores.push("Selecciona el nivel de riesgo ITSE (municipal).");
    if (!califNombre.trim()) errores.push("Indica nombres y apellidos del calificador municipal.");
    if (!califFecha) errores.push("Indica la fecha de clasificación del calificador.");
  }
  if (modo === "NUEVA") {
    if (modalidad === "TEMPORAL" && (!fechaIni || !fechaFin))
      errores.push("Para modalidad TEMPORAL, indica fecha inicio y fin.");
    if (opAnuncio && !tipoAnuncio.trim()) errores.push("Especifica el tipo de anuncio.");
    if (opCesionario && !licenciaPrincipal.trim()) errores.push("Ingresa N.º de licencia principal (cesionario).");
  } else {
    if (!accion) errores.push("Elige una acción de modificación.");
    if (["CAMBIO_DENOMINACION","TRANSFERENCIA","CESE"].includes(accion || "") && !nroLicenciaOrigen.trim())
      errores.push("Indica el N.º de licencia (origen) para la modificación.");
    if (accion === "CAMBIO_DENOMINACION" && !nuevaDenominacion.trim())
      errores.push("Indica la nueva denominación.");
    if (accion === "OTROS" && !detalleOtros.trim())
      errores.push("Describe el motivo en 'Otros'.");
  }

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const onGuardar = async () => {
    setError("");
    if (errores.length > 0) {
      setError("Corrige los errores antes de guardar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      // Transforma y envía al backend (DTO transaccional)
      //const dto: NuevaDJTransaccionalRequest = expedientesApi.mapDemoPayloadToDTO(payload);
      console.log('> DTO que envío:', dto);
      const res = await expedientesApi.crearDesdeDemo(dto);
      if (!res.ok) throw new Error("No se pudo crear la DJ.");
      // Regresa al listado (o navega al detalle del expediente)
      navigate("/expedientes");
    } catch (e: any) {
      setError(e?.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Nueva DJ — Licencia de Funcionamiento</h1>
            <p className="text-sm text-slate-600">Formulario en página separada + payload</p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => navigate("/licfuncionamiento")} 
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white 
                 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 
                 disabled:opacity-60 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" /> Volver al listado
            </button>
            <button 
                onClick={onGuardar} 
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white 
                 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 
                 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                <Plus className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </header>

        {/* Selector de modo */}
        <div className="mb-4 flex items-center gap-4">
          <span className="text-sm font-medium">Modo de trámite:</span>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="modo" checked={modo === "NUEVA"} onChange={() => setModo("NUEVA")} />
            <span>Nueva licencia</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="modo" checked={modo === "MODIFICACION"} onChange={() => setModo("MODIFICACION")} />
            <span>Cambios / Modificaciones</span>
          </label>
        </div>

        {/* (El resto del formulario es tu mismo contenido adaptado; para brevedad no repito todos los JSX inputs aquí) */}
        {/* COPIA aquí exactamente tu bloque de UI por secciones tal como lo tenías en la demo (Datos generales, Seguridad/ITSE, Nueva/Modif, Solicitante, Representante, Establecimiento, DJ, etc.). */}
        {/* ---- Inicio extracto abreviado para que no sobrepase el límite del mensaje ---- */}

        <Card title="Datos generales de la DJ">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">N.º expediente</label>
              <div className="mt-1 flex gap-2">
                <input className="flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm leading-none
                 focus:outline-none focus:ring-2 focus:ring-blue-500" value={numeroExpediente} onChange={(e) => setNumeroExpediente(e.target.value)} />
                <BuscarExpedienteDialog
                  fetchExpedientes={fetchExpedientes}
                  onPick={(exp) => setNumeroExpediente(exp.numero)}
                  trigger={
                    <button
                      type="button"
                      className="h-10 inline-flex items-center whitespace-nowrap rounded-md
                     border border-gray-300 px-3 text-sm leading-none shadow-sm
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Expediente
                    </button>
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Fecha recepción</label>
              <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2" value={fechaRecepcion} onChange={(e) => setFechaRecepcion(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Estado</label>
              <select className="mt-1 w-full rounded-lg border px-3 py-2" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="EN_EVALUACION">EN_EVALUACION</option>
                <option value="OBSERVADO">OBSERVADO</option>
                <option value="APROBADO">APROBADO</option>
                <option value="RECHAZADO">RECHAZADO</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ... Pega aquí el resto de secciones de tu formulario (idénticas a tu demo) ... */}
        {/* Seguridad / ITSE */}
        <div className="mt-5">
          <Card title="Seguridad e ITSE">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Nivel de riesgo</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2" value={nivel} onChange={(e) => setNivel(e.target.value)}>
                  <option value="BAJO">BAJO</option>
                  <option value="MEDIO">MEDIO</option>
                  <option value="ALTO">ALTO</option>
                  <option value="MUY_ALTO">MUY_ALTO</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={condSeguridad} onChange={(e) => setCondSeguridad(e.target.checked)} />
                <span>Declaro condiciones de seguridad</span>
              </label>
              <div className="text-sm text-slate-600 flex items-center">
                ITSE requerida: <strong className="ml-1">{itseRequierePrevia ? "PREVIA" : "POSTERIOR"}</strong>
              </div>
            </div>
            
            {itseRequierePrevia && (
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-sm">N.º ITSE (previa)</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" value={itseNumero} onChange={(e) => setItseNumero(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Archivo ITSE (simulado)</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="itse.pdf" value={itseArchivo} onChange={(e) => setItseArchivo(e.target.value)} />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-5">
          {/* NUEVA */}
          <Card title="NUEVA — Licencia de funcionamiento" disabled={nuevaDisabled}>
            <fieldset disabled={nuevaDisabled} className="space-y-3">
              <span className="text-sm font-medium">Modalidad (vigencia)</span>
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="modalidad" checked={modalidad === "INDETERMINADA"} onChange={() => setModalidad("INDETERMINADA")} />
                  <span>Indeterminada</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="modalidad" checked={modalidad === "TEMPORAL"} onChange={() => setModalidad("TEMPORAL")} />
                  <span>Temporal</span>
                </label>
              </div>

              {modalidad === "TEMPORAL" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Inicio</label>
                    <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2" value={fechaIni} onChange={(e) => setFechaIni(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm">Fin</label>
                    <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <span className="text-sm font-medium">Opciones (combinables)</span>
                <div className="grid md:grid-cols-3 gap-3 mt-2">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={opAnuncio} onChange={(e) => setOpAnuncio(e.target.checked)} />
                    <span>Anuncio publicitario</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={opCesionario} onChange={(e) => setOpCesionario(e.target.checked)} />
                    <span>Cesionario</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={opMercado} onChange={(e) => setOpMercado(e.target.checked)} />
                    <span>Mercado/Galería/CC</span>
                  </label>
                </div>

                {opAnuncio && (
                  <div className="mt-3">
                    <label className="text-sm">Tipo de anuncio</label>
                    <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="LUMINOSO / AFICHE / PINTADO..." value={tipoAnuncio} onChange={(e) => setTipoAnuncio(e.target.value)} />
                  </div>
                )}
                {opCesionario && (
                  <div className="mt-3">
                    <label className="text-sm">N.º Licencia principal</label>
                    <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="LIC-2024-000X" value={licenciaPrincipal} onChange={(e) => setLicenciaPrincipal(e.target.value)} />
                  </div>
                )}
              </div>
            </fieldset>
          </Card>

          {/* MODIFICACIONES */}
          <Card title="Cambios / Modificaciones (acción única)" disabled={modifDisabled}>
            <fieldset disabled={modifDisabled} className="space-y-3">
              <label className="text-sm">Acción</label>
              <select className="w-full rounded-lg border px-3 py-2" value={accion} onChange={(e) => setAccion(e.target.value)}>
                <option value="">— Selecciona —</option>
                <option value="CAMBIO_DENOMINACION">CAMBIO_DENOMINACION</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="CESE">CESE</option>
                <option value="OTROS">OTROS</option>
              </select>

              {accion && (
                <div className="space-y-3">
                  {(["CAMBIO_DENOMINACION","TRANSFERENCIA","CESE"].includes(accion)) && (
                    <div>
                      <label className="text-sm">N.º Licencia (origen)</label>
                      <input className="mt-1 w-full rounded-lg border px-3 py-2" value={nroLicenciaOrigen} onChange={(e) => setNroLicenciaOrigen(e.target.value)} />
                    </div>
                  )}
                  {accion === "CAMBIO_DENOMINACION" && (
                    <div>
                      <label className="text-sm">Nueva denominación / nombre comercial</label>
                      <input className="mt-1 w-full rounded-lg border px-3 py-2" value={nuevaDenominacion} onChange={(e) => setNuevaDenominacion(e.target.value)} />
                    </div>
                  )}
                  {accion === "OTROS" && (
                    <div>
                      <label className="text-sm">Detalle</label>
                      <textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={3} value={detalleOtros} onChange={(e) => setDetalleOtros(e.target.value)} />
                    </div>
                  )}
                </div>
              )}
            </fieldset>
          </Card>
        </div>

        {/* II Datos del solicitante */}
        <div className="mt-5">
          <Card title="II Datos del solicitante">
            {/* Identidad */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Tipo de persona</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2" value={tipoPersona} onChange={(e) => setTipoPersona(e.target.value)}>
                  <option value="NATURAL">NATURAL</option>
                  <option value="JURIDICA">JURIDICA</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm">Apellidos y Nombres / Razón social</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" value={nombreRazon} onChange={(e) => setNombreRazon(e.target.value)} />
              </div>
            </div>

            {/* Documentos y contacto */}
            <div className="grid md:grid-cols-4 gap-4 mt-3">
              {tipoPersona === "NATURAL" && (
                <div className="md:col-span-1">
                  <label className="text-sm">N° DNI / N° C.E.</label>
                  <div className="flex gap-2 mt-1">
                    <select className="rounded-lg border px-2 py-2" value={docTipo} onChange={(e) => setDocTipo(e.target.value)}>
                      <option value="DNI">DNI</option>
                      <option value="CE">C.E.</option>
                    </select>
                    <input className="flex-1 min-w-0 rounded-lg border px-3 py-2" value={docNumero} onChange={(e) => setDocNumero(e.target.value)} />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm">N° RUC</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" value={ruc} onChange={(e) => setRuc(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">N° Teléfono</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className={tipoPersona === "JURIDICA" ? "md:col-span-2" : "md:col-span-1"}>
                <label className="text-sm">Correo electrónico</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" value={correo} onChange={(e) => setCorreo(e.target.value)} />
              </div>
            </div>

            {/* Dirección */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-1">Dirección</div>
              <div className="grid md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="text-sm">Av./Jr./Ca./Pje./Otros</label>
                  <div className="flex gap-2 mt-1">
                    <select className="rounded-lg border px-2 py-2" value={viaTipo} onChange={(e) => setViaTipo(e.target.value)}>
                      <option>Av.</option><option>Jr.</option><option>Ca.</option><option>Pje.</option><option>Otros</option>
                    </select>
                    <input className="flex-1 rounded-lg border px-3 py-2" placeholder="Nombre de vía" value={viaNombre} onChange={(e) => setViaNombre(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm">N°/Int./Mz./Lt./Otros</label>
                  <div className="grid grid-cols-5 gap-2 mt-1">
                    <input className="rounded-lg border px-2 py-2" placeholder="N°" value={numeroPuerta} onChange={(e) => setNumeroPuerta(e.target.value)} />
                    <input className="rounded-lg border px-2 py-2" placeholder="Int." value={interior} onChange={(e) => setInterior(e.target.value)} />
                    <input className="rounded-lg border px-2 py-2" placeholder="Mz" value={mz} onChange={(e) => setMz(e.target.value)} />
                    <input className="rounded-lg border px-2 py-2" placeholder="Lt" value={lt} onChange={(e) => setLt(e.target.value)} />
                    <input className="rounded-lg border px-2 py-2" placeholder="Otros" value={otrosDir} onChange={(e) => setOtrosDir(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm">Urb./AA.HH./Otros</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" value={urbAAHH} onChange={(e) => setUrbAAHH(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Distrito y Provincia</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input className="rounded-lg border px-3 py-2" placeholder="Distrito" value={distrito} onChange={(e) => setDistrito(e.target.value)} />
                    <input className="rounded-lg border px-3 py-2" placeholder="Provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Representación (solo jurídica) */}
            {tipoPersona === "JURIDICA" && (
              <div className="grid md:grid-cols-3 gap-4 mt-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={poderVigente} onChange={(e) => setPoderVigente(e.target.checked)} />
                  <span>Poder vigente (SUNARP)</span>
                </label>
                <div className="md:col-span-2">
                  <label className="text-sm">Archivo vigencia de poder (simulado)</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="vigencia_poder.pdf" value={sunarpArchivo} onChange={(e) => setSunarpArchivo(e.target.value)} />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* III Datos del representante legal o apoderado */}
        <div className="mt-5">
          <Card title="III Datos del representante legal o apoderado">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm">Apellidos y Nombres</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="Ej. María López Huamán"
                  value={repNombre}
                  onChange={(e) => setRepNombre(e.target.value)}
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-sm">N° DNI / N° C.E.</label>
                <div className="flex gap-2 mt-1">
                  <select
                    className="rounded-lg border px-2 py-2"
                    value={repDocTipo}
                    onChange={(e) => setRepDocTipo(e.target.value)}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">C.E.</option>
                  </select>
                  <input
                    className="flex-1 rounded-lg border px-3 py-2"
                    placeholder={repDocTipo === "DNI" ? "12345678" : "CE-000000"}
                    value={repDocNumero}
                    onChange={(e) => setRepDocNumero(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm">
                  N° de partida electrónica y asiento (SUNARP) <span className="text-slate-500">(de corresponder)</span>
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="Partida XXXXXX, Asiento YY"
                  value={repSunarp}
                  onChange={(e) => setRepSunarp(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* IV */}
        <div className="mt-5">
          <Card title="IV Datos del establecimiento" disabled={isModBasica}>
            <fieldset disabled={isModBasica} className="space-y-3">
              {/* Nombre comercial */}
              <div>
                <label className="text-sm">Nombre Comercial</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="Ej. Restaurante Sazón Peruana"
                  value={estNombreComercial}
                  onChange={(e) => setEstNombreComercial(e.target.value)}
                />
              </div>

              {/* CIIU, Giros, Botón, Actividad, Zonificación en UNA sola línea */}
              <div className="grid grid-cols-1 md:grid-cols-[120px_minmax(0,2fr)_auto_minmax(0,1fr)_minmax(0,1fr)] gap-4 mt-3 items-end">
                {/* 1) CIIU pequeño */}
                <div>
                  <label className="text-sm">Código CIIU*</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="5610"
                    value={estCiiu}
                    onChange={(e) => setEstCiiu(e.target.value)}
                  />
                </div>

                {/* 2) Giros grande */}
                <div>
                  <label className="text-sm">Giro/s*</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 min-w-0"
                    placeholder="Ej. Restaurante"
                    value={estGiroInput}
                    onChange={(e) => setEstGiroInput(e.target.value)}
                  />
                </div>

                {/* 3) Botón Agregar */}
                <div className="flex md:block">
                  <button
                    type="button"
                    className="rounded-lg border px-3 py-2 shrink-0"
                    onClick={() => {
                      const v = estGiroInput.trim();
                      if (v) {
                        setEstGiros((prev) => [...prev, v]);
                        setEstGiroInput("");
                      }
                    }}
                  >
                    Agregar
                  </button>
                </div>

                {/* 4) Actividad */}
                <div>
                  <label className="text-sm">Actividad</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 min-w-0"
                    placeholder="Restaurantes y servicios de comida"
                    value={estActividad}
                    onChange={(e) => setEstActividad(e.target.value)}
                  />
                </div>

                {/* 5) Zonificación (misma fila) */}
                <div>
                  <label className="text-sm">Zonificación</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 min-w-0"
                    placeholder="ZC-COM"
                    value={estZonificacion}
                    onChange={(e) => setEstZonificacion(e.target.value)}
                  />
                </div>

                {/* Chips de giros debajo, ocupan toda la fila */}
                {estGiros.length > 0 && (
                  <div className="md:col-span-5 flex flex-wrap gap-2 mt-1 text-xs">
                    {estGiros.map((g, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                        {g}
                        <button
                          type="button"
                          className="text-slate-500"
                          onClick={() => setEstGiros(estGiros.filter((_, idx) => idx !== i))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dirección */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-1">Dirección</div>
                <div className="grid md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-sm">Av./Jr./Ca./Pje./Otros</label>
                    <div className="flex gap-2 mt-1">
                      <select
                        className="rounded-lg border px-2 py-2"
                        value={estViaTipo}
                        onChange={(e) => setEstViaTipo(e.target.value)}
                      >
                        <option>Av.</option><option>Jr.</option><option>Ca.</option><option>Pje.</option><option>Otros</option>
                      </select>
                      <input
                        className="flex-1 rounded-lg border px-3 py-2"
                        placeholder="Nombre de vía"
                        value={estViaNombre}
                        onChange={(e) => setEstViaNombre(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">N°/Int./Mz./Lt./Otros</label>
                    <div className="grid grid-cols-5 gap-2 mt-1">
                      <input className="rounded-lg border px-2 py-2" placeholder="N°"
                             value={estNumeroPuerta} onChange={(e) => setEstNumeroPuerta(e.target.value)} />
                      <input className="rounded-lg border px-2 py-2" placeholder="Int."
                             value={estInterior} onChange={(e) => setEstInterior(e.target.value)} />
                      <input className="rounded-lg border px-2 py-2" placeholder="Mz"
                             value={estMz} onChange={(e) => setEstMz(e.target.value)} />
                      <input className="rounded-lg border px-2 py-2" placeholder="Lt"
                             value={estLt} onChange={(e) => setEstLt(e.target.value)} />
                      <input className="rounded-lg border px-2 py-2" placeholder="Otros"
                             value={estOtrosDir} onChange={(e) => setEstOtrosDir(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Urb./AA.HH./Otros</label>
                    <input
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      value={estUrbAAHH}
                      onChange={(e) => setEstUrbAAHH(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm">Provincia</label>
                    <input
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      placeholder="Lima"
                      value={estProvincia}
                      onChange={(e) => setEstProvincia(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Autorización sectorial (de corresponder) */}
              <div className="mt-5">
                <div className="text-sm font-medium mb-2">Autorización sectorial (de corresponder)</div>

                <label className="inline-flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={estTieneAutSectorial}
                    onChange={(e) => setEstTieneAutSectorial(e.target.checked)}
                  />
                  <span>Declaro que requiero y adjuntaré autorización sectorial</span>
                </label>

                {estTieneAutSectorial && (
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm">Entidad que otorga autorización</label>
                      <input
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="Ej. MINSA / SUTRAN / MTC"
                        value={estAutEntidad}
                        onChange={(e) => setEstAutEntidad(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm">Denominación de la autorización sectorial</label>
                      <input
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="Ej. Autorización sanitaria para ..."
                        value={estAutDenominacion}
                        onChange={(e) => setEstAutDenominacion(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm">Fecha de autorización</label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        value={estAutFecha}
                        onChange={(e) => setEstAutFecha(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm">Número de autorización</label>
                      <input
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="N°/Código"
                        value={estAutNumero}
                        onChange={(e) => setEstAutNumero(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Área total solicitada (m²) */}
              <div className="mt-5">
                <label className="text-sm">Área total solicitada (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="Ej. 120.50"
                  value={estAreaTotal}
                  onChange={(e) => setEstAreaTotal(e.target.value)}
                />
              </div>
            </fieldset>
          </Card>
        </div>

        {/* V Declaración Jurada */}
        <div className="mt-5">
          <Card title="V Declaración Jurada">
            <div className="space-y-3">
              {/* Declaraciones (checkbox) */}
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" checked={djDeclaroPoder}
                       onChange={(e) => setDjDeclaroPoder(e.target.checked)} />
                <span className="text-sm">
                  Cuento con poder suficiente vigente para actuar como representante legal de la persona jurídica conductora
                  (o de la persona natural que represento). <span className="text-slate-500">(Marcar solo si aplica)</span>
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" checked={condSeguridad}
                       onChange={(e) => setCondSeguridad(e.target.checked)} />
                <span className="text-sm">
                  El establecimiento cumple con las condiciones de seguridad en edificaciones y me someto a la ITSE que corresponda.
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" checked={djDeclaroTituloProf}
                       onChange={(e) => setDjDeclaroTituloProf(e.target.checked)} />
                <span className="text-sm">
                  Cuento con título profesional vigente y estoy habilitado por el colegio profesional correspondiente
                  <span className="text-slate-500"> (solo si corresponde: servicios vinculados a salud, etc.)</span>.
                </span>
              </label>

              {/* Texto de conocimiento/aceptación */}
              <div className="text-xs text-slate-600 border rounded-lg p-3 bg-slate-50">
                Tengo conocimiento de que la presente Declaración Jurada y documentación está sujeta a fiscalización posterior.
                De comprobarse falsedad o inexactitud, se aplicarán las sanciones correspondientes.
              </div>

              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={djAcepto} onChange={(e) => setDjAcepto(e.target.checked)} />
                <span className="text-sm font-medium">Declaro bajo juramento y acepto lo señalado</span>
              </label>

              {/* Observaciones */}
              <div>
                <label className="text-sm">Observaciones o comentarios del solicitante</label>
                <textarea rows={3} className="mt-1 w-full rounded-lg border px-3 py-2"
                          placeholder="Opcional" value={djObservaciones}
                          onChange={(e) => setDjObservaciones(e.target.value)} />
              </div>

              {/* Fecha y firmante */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm">Fecha</label>
                  <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2"
                         value={djFecha} onChange={(e) => setDjFecha(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm">Quién firma</label>
                  <select className="mt-1 w-full rounded-lg border px-3 py-2"
                          value={djFirmanteTipo} onChange={(e) => setDjFirmanteTipo(e.target.value)}>
                    <option value="SOLICITANTE">Solicitante</option>
                    <option value="REPRESENTANTE">Representante legal / Apoderado</option>
                  </select>
                </div>

                <div className="md:col-span-1"></div>

                <div className="md:col-span-2">
                  <label className="text-sm">Nombres y Apellidos del firmante</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2"
                         value={djFirmanteNombre} onChange={(e) => setDjFirmanteNombre(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm">Documento del firmante</label>
                  <div className="flex gap-2 mt-1">
                    <select className="rounded-lg border px-2 py-2" value={djFirmanteDocTipo}
                            onChange={(e) => setDjFirmanteDocTipo(e.target.value)}>
                      <option value="DNI">DNI</option>
                      <option value="CE">C.E.</option>
                    </select>
                    <input className="flex-1 rounded-lg border px-3 py-2"
                           placeholder={djFirmanteDocTipo === "DNI" ? "12345678" : "CE-000000"}
                           value={djFirmanteDocNumero}
                           onChange={(e) => setDjFirmanteDocNumero(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                * En trámite digital, la firma puede materializarse como aceptación electrónica; puedes guardar un hash/archivo de evidencia si corresponde.
              </div>
            </div>
          </Card>
        </div>

        {/* Errores */}
        {error && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {error}
            {errores.length > 0 && (
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                {errores.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* Payload en vivo */}
        <div className="mt-5">
          <Card title="Payload simulado (JSON)">
            <pre className="text-xs md:text-sm bg-slate-900 text-slate-100 rounded-lg p-4 overflow-auto max-h-96">
              {pretty(payload)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}