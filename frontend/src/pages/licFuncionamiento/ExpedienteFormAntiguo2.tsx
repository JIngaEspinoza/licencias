import React from "react";
import { useNavigate } from "react-router-dom";
import { expedientesApi } from "../../services/expedientes";
import { ChevronLeft, ChevronDown, Upload, Building2, AlertTriangle, ShieldCheck, Plus, AlertCircle, Copy, FileText, Search } from "lucide-react";
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
  <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800  px-4 md:px-10">
    
    {/* Header extendido a los extremos */}
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center  gap-6">
      <div>
        
        <div className="flex items-center gap-8 mt-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 w-fit">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2">Modo:</span>
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer group">
            <input type="radio" name="modo" checked={modo === 'NUEVA'} onChange={() => setModo('NUEVA')} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
            <span className="group-hover:text-blue-600 transition-colors">Nueva licencia</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer group">
            <input type="radio" name="modo" checked={modo === 'MODIFICACION'} onChange={() => setModo('MODIFICACION')} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
            <span className="group-hover:text-blue-600 transition-colors">Modificaciones</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
          <ChevronLeft size={20} /> Cancelar
        </button>
        <button onClick={onGuardar} className="flex items-center gap-2 px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
          Guardar Trámite
        </button>
      </div>
    </div>

    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
      {/* SECCIÓN I: DATOS GENERALES (FULL WIDTH) */}
      <div className="w-full">
        <Card title="Datos generales">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            
            {/* N.º Expediente - Ocupa casi la mitad del ancho (5/12) */}
            <div className="md:col-span-5 flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                N.º expediente
              </label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm 
                            focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                  placeholder="Ingrese el número..."
                  value={numeroExpediente} 
                  onChange={(e) => setNumeroExpediente(e.target.value)} 
                />
                <BuscarExpedienteDialog
                  fetchExpedientes={fetchExpedientes}
                  onPick={(exp) => setNumeroExpediente(exp.numero)}
                  trigger={
                    <button
                      type="button"
                      className="h-12 px-6 inline-flex items-center whitespace-nowrap rounded-xl
                                border-2 border-blue-600 text-blue-600 font-bold text-sm
                                hover:bg-blue-600 hover:text-white transition-all focus:outline-none shadow-sm shadow-blue-50"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Expediente
                    </button>
                  }
                />
              </div>
            </div>

            {/* Fecha Recepción - Ocupa 3/12 del ancho */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Fecha recepción
              </label>
              <input 
                type="date" 
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm 
                          focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                value={fechaRecepcion} 
                onChange={(e) => setFechaRecepcion(e.target.value)} 
              />
            </div>

            {/* Estado - Ocupa el resto (4/12) */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Estado del Trámite
              </label>
              <div className="relative group">
                <select 
                  className={`w-full h-12 rounded-xl border-2 border-slate-100 px-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer
                    ${estado === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      estado === 'RECHAZADO' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                      'bg-slate-50/50 text-slate-700 focus:bg-white focus:border-blue-500'}
                  `}
                  value={estado} 
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="EN_EVALUACION">🟡 EN EVALUACIÓN</option>
                  <option value="OBSERVADO">🟠 OBSERVADO</option>
                  <option value="APROBADO">🟢 APROBADO</option>
                  <option value="RECHAZADO">🔴 RECHAZADO</option>
                </select>
                {/* Icono de flecha personalizado para el select */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* SECCIÓN: SEGURIDAD E ITSE (FULL WIDTH) */}
      <div className="w-full">
        <Card title="Seguridad e ITSE">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Nivel de Riesgo - Ocupa 4/12 */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Nivel de riesgo
              </label>
              <div className="relative">
                <select 
                  className={`w-full h-12 rounded-xl border-2 px-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer
                    ${nivel === 'BAJO' || nivel === 'MEDIO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}
                  `} 
                  value={nivel} 
                  onChange={(e) => setNivel(e.target.value)}
                >
                  <option value="BAJO">🟢 RIESGO BAJO</option>
                  <option value="MEDIO">🟡 RIESGO MEDIO</option>
                  <option value="ALTO">🟠 RIESGO ALTO</option>
                  <option value="MUY_ALTO">🔴 RIESGO MUY ALTO</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Checkbox de Declaración - Ocupa 5/12 */}
            <div className="md:col-span-5 pt-6">
              <label className="flex items-center gap-4 p-3.5 rounded-xl border-2 border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-200 transition-all cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  checked={condSeguridad} 
                  onChange={(e) => setCondSeguridad(e.target.checked)} 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Declaración de Seguridad</span>
                  <span className="text-[11px] text-slate-500 uppercase font-medium">Cumplo con las condiciones de seguridad</span>
                </div>
              </label>
            </div>

            {/* Indicador de ITSE - Ocupa 3/12 */}
            <div className="md:col-span-3 flex flex-col items-center md:items-end gap-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tipo de Inspección</span>
              <div className={`px-4 py-2 rounded-full text-xs font-black tracking-tighter shadow-sm border
                ${itseRequierePrevia ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}
              `}>
                {itseRequierePrevia ? "⚠️ INSPECCIÓN PREVIA" : "✅ INSPECCIÓN POSTERIOR"}
              </div>
            </div>

          </div>

          {/* SECCIÓN CONDICIONAL (SI ES PREVIA) - OCUPA TODO EL ANCHO ABAJO */}
          {itseRequierePrevia && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 pt-8 border-t-2 border-slate-50 animate-in fade-in slide-in-from-top-2">
              <div className="md:col-span-6 flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  N.º ITSE (previa)
                </label>
                <input 
                  className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                  placeholder="Ingrese el número de certificado ITSE"
                  value={itseNumero} 
                  onChange={(e) => setItseNumero(e.target.value)} 
                />
              </div>
              <div className="md:col-span-6 flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Archivo ITSE (Adjunto digital)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" 
                      placeholder="itse_certificado_2024.pdf" 
                      value={itseArchivo} 
                      onChange={(e) => setItseArchivo(e.target.value)} 
                    />
                  </div>
                  <button className="h-12 px-6 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2">
                    <Upload size={18} /> Subir
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>

    {/* SECCIÓN: MODALIDAD Y ACCIÓN (NUEVA VS MODIFICACIÓN) - FULL WIDTH */}
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
      
      {/* COLUMNA IZQUIERDA: NUEVA LICENCIA */}
      <div className={`transition-all duration-300 ${modo !== 'NUEVA' ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
        <Card title="NUEVA — Licencia de Funcionamiento">
          <fieldset disabled={modo !== 'NUEVA'} className="space-y-6">
            
            {/* Modalidad de Vigencia */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-4">
                Modalidad (Vigencia)
              </span>
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="modalidad" checked={modalidad === "INDETERMINADA"} onChange={() => setModalidad("INDETERMINADA")} className="w-5 h-5 text-blue-600 border-slate-300" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">Indeterminada</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="modalidad" checked={modalidad === "TEMPORAL"} onChange={() => setModalidad("TEMPORAL")} className="w-5 h-5 text-blue-600 border-slate-300" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">Temporal</span>
                </label>
              </div>

              {modalidad === "TEMPORAL" && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Inicio</label>
                    <input type="date" className="mt-1 w-full h-11 rounded-lg border border-slate-200 px-3 text-sm focus:bg-white outline-none transition-all" value={fechaIni} onChange={(e) => setFechaIni(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Fin</label>
                    <input type="date" className="mt-1 w-full h-11 rounded-lg border border-slate-200 px-3 text-sm focus:bg-white outline-none transition-all" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* Opciones Combinables */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-4">
                Opciones (Combinables)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'anuncio', label: 'Anuncio Publicitario', state: opAnuncio, setter: setOpAnuncio },
                  { id: 'cese', label: 'Cesionario', state: opCesionario, setter: setOpCesionario },
                  { id: 'mercado', label: 'Mercado / Galería', state: opMercado, setter: setOpMercado }
                ].map(op => (
                  <label key={op.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${op.state ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 bg-slate-50/30'}`}>
                    <input type="checkbox" checked={op.state} onChange={(e) => op.setter(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                    <span className={`text-xs font-bold ${op.state ? 'text-blue-700' : 'text-slate-600'}`}>{op.label}</span>
                  </label>
                ))}
              </div>

              {/* Inputs Condicionales Nueva */}
              <div className="space-y-4 mt-4">
                {opAnuncio && (
                  <div className="animate-in slide-in-from-left-2 duration-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de anuncio</label>
                    <input className="mt-1 w-full h-11 rounded-lg border border-slate-200 px-4 text-sm focus:border-blue-500 outline-none" placeholder="EJ. LUMINOSO, AFICHE, PINTADO..." value={tipoAnuncio} onChange={(e) => setTipoAnuncio(e.target.value)} />
                  </div>
                )}
                {opCesionario && (
                  <div className="animate-in slide-in-from-left-2 duration-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">N.º Licencia Principal</label>
                    <input className="mt-1 w-full h-11 rounded-lg border border-slate-200 px-4 text-sm focus:border-blue-500 outline-none" placeholder="LIC-2024-XXXX" value={licenciaPrincipal} onChange={(e) => setLicenciaPrincipal(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          </fieldset>
        </Card>
      </div>

      {/* COLUMNA DERECHA: MODIFICACIONES */}
      <div className={`transition-all duration-300 ${modo !== 'MODIFICACION' ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
        <Card title="Cambios / Modificaciones (Acción única)">
          <fieldset disabled={modo !== 'MODIFICACION'} className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">
                Tipo de Acción
              </label>
              <select 
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none"
                value={accion} 
                onChange={(e) => setAccion(e.target.value)}
              >
                <option value="">— SELECCIONE ACCIÓN —</option>
                <option value="CAMBIO_DENOMINACION">🔄 CAMBIO DE DENOMINACIÓN</option>
                <option value="TRANSFERENCIA">🤝 TRANSFERENCIA</option>
                <option value="CESE">🛑 CESE DE ACTIVIDADES</option>
                <option value="OTROS">📝 OTROS CAMBIOS</option>
              </select>
            </div>

            {accion && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                {(["CAMBIO_DENOMINACION","TRANSFERENCIA","CESE"].includes(accion)) && (
                  <div className="p-4 bg-orange-50/30 rounded-xl border border-orange-100">
                    <label className="text-[10px] font-bold text-orange-600 uppercase">N.º Licencia (Origen)</label>
                    <input className="mt-1 w-full h-11 rounded-lg border border-orange-200 px-4 text-sm focus:bg-white outline-none" placeholder="Ingrese licencia previa..." value={nroLicenciaOrigen} onChange={(e) => setNroLicenciaOrigen(e.target.value)} />
                  </div>
                )}
                
                {accion === "CAMBIO_DENOMINACION" && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nueva denominación / Nombre comercial</label>
                    <input className="mt-1 w-full h-11 rounded-lg border border-slate-200 px-4 text-sm focus:border-blue-500 outline-none" value={nuevaDenominacion} onChange={(e) => setNuevaDenominacion(e.target.value)} />
                  </div>
                )}

                {accion === "OTROS" && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Detalle del cambio</label>
                    <textarea className="mt-1 w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-blue-500 outline-none" rows={4} placeholder="Describa el cambio solicitado..." value={detalleOtros} onChange={(e) => setDetalleOtros(e.target.value)} />
                  </div>
                )}
              </div>
            )}
            
            {!accion && modo === 'MODIFICACION' && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 italic text-sm">
                <div className="mb-2 opacity-20"><FileText size={48} /></div>
                Seleccione una acción para ver los campos requeridos
              </div>
            )}
          </fieldset>
        </Card>
      </div>
    </div>


    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
      {/* SECCIÓN II: DATOS DEL TITULAR (FULL WIDTH) */}
      <div className="w-full">
        <Card title="II. Datos del Titular (Persona Natural o Jurídica)">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Selector de Tipo Persona */}
            <div className="md:col-span-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                Tipo de Persona
              </label>
              <select 
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                value={tipoPersona} 
                onChange={(e) => setTipoPersona(e.target.value)}
              >                
                <option value="NATURAL">👤 Persona Natural</option>
                <option value="JURIDICA">🏢 Persona Jurídica</option>
              </select>
            </div>

            {/* Nombre o Razón Social - Ocupa el resto del ancho de la fila */}
            <div className="md:col-span-9">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                Nombres y Apellidos / Razón Social
              </label>
              <input 
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-5 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                placeholder="Ingrese el nombre completo o denominación social"
                value={nombreRazon} 
                onChange={(e) => setNombreRazon(e.target.value)} 
              />
            </div>

            {/* Fila de Documentos y Contacto */}
            <div className="md:col-span-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                Documento
              </label>
              <div className="flex gap-2">
                <select className="w-24 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-2 text-xs font-bold focus:bg-white outline-none" value={docTipo} onChange={e => setDocTipo(e.target.value)}>
                  <option value="">— SELECCIONE ACCIÓN —</option>
                  <option>DNI</option>
                  <option>C.E.</option>
                </select>
                <input className="flex-1 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm focus:bg-white outline-none" value={docNumero} onChange={e => setDocNumero(e.target.value)} />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                RUC
              </label>
              <input className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-5 text-sm focus:bg-white outline-none" placeholder="10XXXXXXXXX" value={ruc} onChange={e => setRuc(e.target.value)} />
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                Teléfono
              </label>
              <input className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-5 text-sm focus:bg-white outline-none" placeholder="999 999 999" value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                Correo Electrónico
              </label>
              <input className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-5 text-sm focus:bg-white outline-none" placeholder="correo@ejemplo.com" value={correo} onChange={e => setCorreo(e.target.value)} />
            </div>

          </div>
        </Card>
      </div>

      {/* SECCIÓN III: DATOS DEL REPRESENTANTE LEGAL (FULL WIDTH) */}
      <div className="w-full">
        <Card title="III. Datos del Representante Legal o Apoderado">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Apellidos y Nombres - Ocupa 5/12 */}
            <div className="md:col-span-5 flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Apellidos y Nombres Completos
              </label>
              <input
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm 
                          focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                placeholder="Ej. María López Huamán"
                value={repNombre}
                onChange={(e) => setRepNombre(e.target.value)}
              />
            </div>

            {/* Documento de Identidad - Ocupa 3/12 */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                N° DNI / N° C.E.
              </label>
              <div className="flex gap-2">
                <select
                  className="w-24 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-3 text-xs font-bold 
                            focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                  value={repDocTipo}
                  onChange={(e) => setRepDocTipo(e.target.value)}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">C.E.</option>
                </select>
                <input
                  className="flex-1 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm 
                            focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder={repDocTipo === "DNI" ? "12345678" : "00000000"}
                  value={repDocNumero}
                  onChange={(e) => setRepDocNumero(e.target.value)}
                />
              </div>
            </div>

            {/* SUNARP - Ocupa 4/12 */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Partida Electrónica y Asiento <span className="text-slate-400 font-medium">(SUNARP)</span>
              </label>
              <div className="relative">
                <input
                  className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 pl-10 text-sm 
                            focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="Partida XXXXXX, Asiento YY"
                  value={repSunarp}
                  onChange={(e) => setRepSunarp(e.target.value)}
                />
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
              <p className="text-[10px] text-slate-400 italic ml-1">* Solo si actúa en representación de una persona jurídica.</p>
            </div>

          </div>
        </Card>
      </div>
    </div>




    {/* SECCIÓN IV: DATOS DEL ESTABLECIMIENTO (FULL WIDTH) */}
    <div className="w-full mt-6">
      <Card title="IV. Datos del Establecimiento">
        <fieldset disabled={isModBasica} className={`space-y-8 ${isModBasica ? 'opacity-50' : ''}`}>
          
          {/* 1. Identificación y Actividad */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nombre Comercial</label>
              <input
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                placeholder="Ej. Restaurante Sazón Peruana"
                value={estNombreComercial}
                onChange={(e) => setEstNombreComercial(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Código CIIU*</label>
              <input
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm focus:border-blue-500 outline-none transition-all text-center font-mono"
                placeholder="5610"
                value={estCiiu}
                onChange={(e) => setEstCiiu(e.target.value)}
              />
            </div>

            <div className="md:col-span-6">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Giro(s) del Negocio*</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm focus:bg-white outline-none"
                  placeholder="Ej. Venta de abarrotes..."
                  value={estGiroInput}
                  onChange={(e) => setEstGiroInput(e.target.value)}
                />
                <button
                  type="button"
                  className="h-12 px-6 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                  onClick={() => {
                    const v = estGiroInput.trim();
                    if (v) { setEstGiros((prev) => [...prev, v]); setEstGiroInput(""); }
                  }}
                >
                  <Plus size={18} /> Agregar
                </button>
              </div>
            </div>

            {/* Chips de giros (Ancho completo debajo de la fila) */}
            {estGiros.length > 0 && (
              <div className="md:col-span-12 flex flex-wrap gap-2 pt-2">
                {estGiros.map((g, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold animate-in zoom-in-95">
                    {g}
                    <button type="button" onClick={() => setEstGiros(estGiros.filter((_, idx) => idx !== i))} className="hover:text-red-500">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Actividad Específica</label>
              <input
                className="w-full h-11 rounded-lg border-2 border-slate-100 bg-slate-50/30 px-4 text-sm outline-none focus:border-blue-400 transition-all"
                placeholder="Detalle la actividad principal..."
                value={estActividad}
                onChange={(e) => setEstActividad(e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Zonificación</label>
              <input
                className="w-full h-11 rounded-lg border-2 border-slate-100 bg-slate-50/30 px-4 text-sm outline-none focus:border-blue-400 transition-all"
                placeholder="Ej. CZ (Comercio Zonal)"
                value={estZonificacion}
                onChange={(e) => setEstZonificacion(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Ubicación Física (Dirección) */}
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 block">Ubicación del Establecimiento</span>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 flex gap-2">
                <select className="w-24 h-11 rounded-lg border-2 border-white shadow-sm px-2 text-sm font-bold outline-none" value={estViaTipo} onChange={(e) => setEstViaTipo(e.target.value)}>
                  <option>Av.</option><option>Jr.</option><option>Ca.</option><option>Pje.</option>
                </select>
                <input className="flex-1 h-11 rounded-lg border-2 border-white shadow-sm px-4 text-sm outline-none focus:border-blue-400" placeholder="Nombre de vía" value={estViaNombre} onChange={(e) => setEstViaNombre(e.target.value)} />
              </div>
              
              <div className="md:col-span-7 grid grid-cols-5 gap-2">
                <input className="h-11 rounded-lg border-2 border-white shadow-sm px-2 text-sm text-center outline-none" placeholder="N°" value={estNumeroPuerta} onChange={(e) => setEstNumeroPuerta(e.target.value)} />
                <input className="h-11 rounded-lg border-2 border-white shadow-sm px-2 text-sm text-center outline-none" placeholder="Int." value={estInterior} onChange={(e) => setEstInterior(e.target.value)} />
                <input className="h-11 rounded-lg border-2 border-white shadow-sm px-2 text-sm text-center outline-none" placeholder="Mz" value={estMz} onChange={(e) => setEstMz(e.target.value)} />
                <input className="h-11 rounded-lg border-2 border-white shadow-sm px-2 text-sm text-center outline-none" placeholder="Lt" value={estLt} onChange={(e) => setEstLt(e.target.value)} />
                <input className="h-11 rounded-lg border-2 border-white shadow-sm px-2 text-sm text-center outline-none" placeholder="Otros" value={estOtrosDir} onChange={(e) => setEstOtrosDir(e.target.value)} />
              </div>

              <div className="md:col-span-4 mt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Urb. / AA.HH. / Sector</label>
                <input className="w-full h-11 rounded-lg border-2 border-white shadow-sm px-4 text-sm mt-1 outline-none" value={estUrbAAHH} onChange={(e) => setEstUrbAAHH(e.target.value)} />
              </div>
              <div className="md:col-span-4 mt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Provincia</label>
                <input className="w-full h-11 rounded-lg border-2 border-white shadow-sm px-4 text-sm mt-1 outline-none" value={estProvincia} onChange={(e) => setEstProvincia(e.target.value)} />
              </div>
              <div className="md:col-span-4 mt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Área Total (m²)</label>
                <div className="relative mt-1">
                  <input type="number" className="w-full h-11 rounded-lg border-2 border-white shadow-sm px-4 pr-10 text-sm font-bold text-blue-700 outline-none" value={estAreaTotal} onChange={(e) => setEstAreaTotal(e.target.value)} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">m²</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Autorización Sectorial */}
          <div className="border-t border-slate-100 pt-6">
            <label className="flex items-center gap-3 cursor-pointer group mb-6">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 transition-all" checked={estTieneAutSectorial} onChange={(e) => setEstTieneAutSectorial(e.target.checked)} />
              <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors underline decoration-slate-200 underline-offset-4">
                Requiere Autorización Sectorial (Salud, Educación, MTC, etc.)
              </span>
            </label>

            {estTieneAutSectorial && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-amber-50/30 rounded-2xl border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-amber-700 uppercase mb-2 block">Entidad</label>
                  <input className="w-full h-11 rounded-lg border border-amber-200 px-4 text-sm focus:bg-white outline-none transition-all" placeholder="MINSA, MTC..." value={estAutEntidad} onChange={(e) => setEstAutEntidad(e.target.value)} />
                </div>
                <div className="md:col-span-4">
                  <label className="text-[10px] font-bold text-amber-700 uppercase mb-2 block">Denominación</label>
                  <input className="w-full h-11 rounded-lg border border-amber-200 px-4 text-sm focus:bg-white outline-none transition-all" placeholder="Nombre del permiso..." value={estAutDenominacion} onChange={(e) => setEstAutDenominacion(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-amber-700 uppercase mb-2 block">Fecha</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-amber-200 px-3 text-sm focus:bg-white outline-none transition-all" value={estAutFecha} onChange={(e) => setEstAutFecha(e.target.value)} />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-amber-700 uppercase mb-2 block">N° Resolución / Código</label>
                  <input className="w-full h-11 rounded-lg border border-amber-200 px-4 text-sm focus:bg-white outline-none transition-all" value={estAutNumero} onChange={(e) => setEstAutNumero(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </fieldset>
      </Card>
    </div>

    {/* SECCIÓN V: DECLARACIÓN JURADA Y FIRMA (FULL WIDTH) */}
    <div className="w-full mt-6">
      <Card title="V. Declaración Jurada de Cumplimiento">
        <div className="space-y-8">
          
          {/* 1. Bloque de Compromisos Legales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'poder',
                state: djDeclaroPoder,
                setter: setDjDeclaroPoder,
                text: "Cuento con poder suficiente vigente para actuar como representante legal de la persona jurídica o natural que represento.",
                sub: "(Marcar solo si aplica)"
              },
              {
                id: 'itse',
                state: condSeguridad,
                setter: setCondSeguridad,
                text: "El establecimiento cumple con las condiciones de seguridad en edificaciones y me someto a la inspección ITSE correspondiente.",
                sub: "Obligatorio"
              },
              {
                id: 'titulo',
                state: djDeclaroTituloProf,
                setter: setDjDeclaroTituloProf,
                text: "Cuento con título profesional vigente y habilitación del colegio respectivo para servicios vinculados a salud o educación.",
                sub: "(Si corresponde)"
              }
            ].map((item) => (
              <label 
                key={item.id} 
                className={`flex flex-col gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md
                  ${item.state ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white'}
                `}
              >
                <div className="flex justify-between items-start">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={item.state} 
                    onChange={(e) => item.setter(e.target.checked)} 
                  />
                  <span className={`text-[10px] font-black px-2 py-1 rounded ${item.state ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {item.state ? 'ACEPTADO' : 'PENDIENTE'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-slate-700">
                  {item.text} <br/>
                  <span className="text-[11px] text-slate-400 font-normal italic">{item.sub}</span>
                </p>
              </label>
            ))}
          </div>

          {/* 2. Advertencia de Fiscalización (Banner) */}
          <div className="relative overflow-hidden bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="bg-amber-400 p-3 rounded-full text-slate-900 animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-amber-400">Aviso de Fiscalización Posterior</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tengo conocimiento de que la presente Declaración Jurada está sujeta a fiscalización. De comprobarse falsedad o inexactitud, 
                  se aplicarán las sanciones administrativas y penales correspondientes, incluyendo la nulidad de la licencia.
                </p>
              </div>
              <label className="flex items-center gap-3 bg-white/10 p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-none text-amber-500 focus:ring-amber-500"
                  checked={djAcepto} 
                  onChange={(e) => setDjAcepto(e.target.checked)} 
                />
                <span className="text-sm font-black uppercase tracking-tighter">Acepto bajo juramento</span>
              </label>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-10 -mt-10 rounded-full blur-3xl"></div>
          </div>

          {/* 3. Observaciones */}
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
              Observaciones o comentarios adicionales
            </label>
            <textarea 
              rows={2} 
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/30 p-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="Opcional: Indique cualquier detalle relevante para la evaluación..." 
              value={djObservaciones}
              onChange={(e) => setDjObservaciones(e.target.value)} 
            />
          </div>

          {/* 4. Firma del Responsable (Grid Full Width) */}
          <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              
              <div className="md:col-span-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Fecha de Declaración</label>
                <input 
                  type="date" 
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-white"
                  value={djFecha} 
                  onChange={(e) => setDjFecha(e.target.value)} 
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Calidad del Firmante</label>
                <select 
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-white outline-none"
                  value={djFirmanteTipo} 
                  onChange={(e) => setDjFirmanteTipo(e.target.value)}
                >
                  <option value="SOLICITANTE">EL SOLICITANTE</option>
                  <option value="REPRESENTANTE">REPRESENTANTE LEGAL</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nombres y Apellidos del Firmante</label>
                <input 
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-white"
                  placeholder="Nombre completo"
                  value={djFirmanteNombre} 
                  onChange={(e) => setDjFirmanteNombre(e.target.value)} 
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Documento de Identidad</label>
                <div className="flex gap-2">
                  <select 
                    className="w-24 h-12 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold" 
                    value={djFirmanteDocTipo}
                    onChange={(e) => setRepDocTipo(e.target.value)}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">C.E.</option>
                  </select>
                  <input 
                    className="flex-1 h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold font-mono"
                    placeholder="Número"
                    value={djFirmanteDocNumero} 
                    onChange={(e) => setDjFirmanteDocNumero(e.target.value)} 
                  />
                </div>
              </div>

              <div className="md:col-span-8">
                <div className="p-4 bg-white/50 rounded-xl border border-slate-200/50 flex items-center gap-3 text-slate-500 italic">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  <p className="text-[11px] leading-tight">
                    Esta declaración se firma electrónicamente mediante la aceptación del formulario bajo la Ley N° 27269. 
                    Se generará una evidencia digital con el ID del trámite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* PANEL DE VALIDACIÓN Y ERRORES (FULL WIDTH) */}
    {error && (
      <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative overflow-hidden rounded-2xl border-2 border-rose-200 bg-rose-50 shadow-lg shadow-rose-100">
          
          {/* Decoración Lateral */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-500"></div>

          <div className="p-6 flex flex-col md:flex-row gap-6">
            
            {/* Icono y Encabezado */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="bg-rose-500 text-white p-4 rounded-full shadow-lg shadow-rose-200">
                <AlertCircle size={32} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="text-lg font-black text-rose-800 uppercase tracking-tighter mb-1">
                Revisión requerida
              </h3>
              <p className="text-rose-600 font-bold text-sm">
                {error}
              </p>

              {/* Lista Detallada de Errores */}
              {errores.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 bg-white/50 rounded-xl p-4 border border-rose-100">
                  {errores.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-rose-700 font-medium">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                      {e}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acción sugerida (Opcional) */}
            <div className="flex-shrink-0 flex items-center">
              <button 
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full md:w-auto px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-200 transition-colors"
              >
                Revisar Arriba
              </button>
            </div>

          </div>

          {/* Footer del Error */}
          <div className="bg-rose-100/50 px-6 py-2 border-t border-rose-200/50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              Estado: Formulario Incompleto
            </span>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              Código: ERR_VAL_04
            </span>
          </div>
        </div>
      </div>
    )}

    {/* SECCIÓN: PAYLOAD EN VIVO (ESTILO CONSOLA FULL WIDTH) */}
    <div className="w-full mt-10">
      <Card title="Inspección de Datos (Payload JSON)">
        <div className="relative group">
          
          {/* Cabecera de la Consola */}
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-xl border-b border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                application/json — {new TextEncoder().encode(JSON.stringify(payload)).length} bytes
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(payload, null, 2))}
                className="flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-white transition-colors bg-slate-700 px-2 py-1 rounded border border-slate-600"
              >
                <Copy size={12} /> COPIAR
              </button>
            </div>
          </div>

          {/* Cuerpo de la Consola */}
          <div className="relative">
            <pre className="text-xs md:text-sm bg-slate-900 text-emerald-400 font-mono rounded-b-xl p-6 overflow-auto max-h-[500px] shadow-2xl border-x-2 border-b-2 border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <code className="block">
                {/* Resaltado sintáctico simulado mediante el color del texto */}
                {JSON.stringify(payload, null, 2)}
              </code>
            </pre>

            {/* Overlay sutil de escaneo */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent opacity-20"></div>
          </div>

          {/* Badge de Tiempo Real */}
          <div className="absolute -bottom-3 right-6 bg-emerald-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
            LIVE PAYLOAD
          </div>
        </div>

        {/* Nota aclaratoria debajo del JSON */}
        <div className="mt-4 flex items-center gap-3 text-slate-400">
          <div className="h-[1px] flex-1 bg-slate-100"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fin de la estructura de datos</span>
          <div className="h-[1px] flex-1 bg-slate-100"></div>
        </div>
      </Card>
    </div>



  </div>
  );
}