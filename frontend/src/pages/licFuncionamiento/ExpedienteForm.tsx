import React, { useEffect, useMemo, useState, useRef, memo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
//import { MapContainer, TileLayer, Marker, useMapEvents, useMap, GeoJSON} from 'react-leaflet';
import * as turf from '@turf/turf';
//import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import datosGeoJSON from '../../geoJson/mapa.json';
import lineaMapa from '../../geoJson/lineaLimite.json';
//import { useNavigate } from "react-router-dom";
import { expedientesApi } from "../../services/expedientes";
import { GiroModal, girosApi } from "../../services/giros";
import { personasApi } from "../../services/personas";
import { Representantes, representantesApi } from "../../services/representantes";

import type { Personas } from "@/types/persona";
import { ChevronLeft, ChevronDown, Upload, Building2, AlertTriangle, ShieldCheck, Plus, 
  MapPin, LocateFixed, X, Loader2, 
  AlertCircle, Copy, FileText, Save, Search, UploadCloud, Check, Trash2, XCircle } from "lucide-react";
import type { NuevaDJTransaccionalRequest } from "@/types/declaracionJurada";
import { Toast } from "../../lib/toast";

import { Label } from "../../types/components/ui/label";
//import { Input } from "../../types/components/ui/input";
import { Checkbox } from "../../types/components/ui/checkbox";
import { Switch } from "../../types/components/ui/switch";

import { PersonaModal } from '../persona/PersonaModal';

import { RepresentanteModal } from "../persona/RepresentanteModal";

import BuscarExpedienteDialog, { Expediente } from "../../components/BuscarExpedientesDialog";
import { useDebounce } from "../../hooks/useDebounce";
import { SeccionCard } from './SeccionCard';
import { MapaZonificacion } from './MapaZonificacion';
import { ModalSeleccionGiro } from "../gestion/GiroModal";
import { BuscadorSolicitante } from "./BuscadorSolicitante";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";

  // ESTILOS GENERALES
const inputClassLine = "h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-center outline-none";
const labelClasses = "text-[10px] font-black text-slate-500 uppercase tracking-tight ml-0.5";
const inputClasses  = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 uppercase";
const buttonClasses = "h-9 px-4 inline-flex items-center whitespace-nowrap rounded-lg bg-[#0f766e] text-white font-bold text-[10px] uppercase tracking-tighter hover:bg-[#0a5a54] transition-all focus:outline-none shadow-sm shadow-[#0f766e]/20 active:scale-95"
const buttonPrimary = "w-full md:w-auto md:min-w-[240px] flex items-center justify-center gap-3 px-12 h-12 bg-[#0f766e] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#0d635d] hover:shadow-xl hover:shadow-[#0f766e]/30 transition-all active:scale-95 shadow-lg shadow-[#0f766e]/20"

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ====== MOCK: todo al TOP-LEVEL, fuera del componente ======
const USE_MOCK = true;

const MOCK_EXPEDIENTES: Expediente[] = [
  { id_expediente: 1, numero: "EXP-2025-000123", ruc: "20123456789", razon_social: "EMPRESA S.A.C.", solicitante: "Juan Pérez", estado: "EN_EVALUACION" },
  { id_expediente: 2, numero: "EXP-2025-000456", ruc: "20654321987", razon_social: "COMERCIAL ANDES SRL", solicitante: "María López", estado: "APROBADO" },
  { id_expediente: 3, numero: "EXP-2025-000789", ruc: "10456789012", razon_social: "SERVICIOS PACÍFICO EIRL", solicitante: "Carlos Ruiz", estado: "OBSERVADO" },
];

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

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

// Buscador de mapa
const SlimSearchBlock = memo(({ onSearch, loading }) => {
  const [localInput, setLocalInput] = useState("");

  const handleAction = () => {
    if (localInput.trim()) onSearch(localInput);
  };

  const handleLimpiar = () => {
    setLocalInput(""); // Limpia el texto
    // setValue("declaracion.via_nombre", "");
    // setValue("declaracion.numero", "");
  };

  return (
    <div className="w-full mb-2">
      <div className="group relative flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm focus-within:border-[#0f766e]/40 transition-all">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-2 text-slate-400" size={12} />
          <input
            className={`${inputClasses} pl-9`}
            placeholder="Calle, número, distrito..."
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAction();
              }
            }}
          />
          {localInput && (
            <button
              type="button"
              onClick={handleLimpiar}
              className="absolute right-1 p-1 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleAction}
          disabled={loading}
          className="h-6 px-3 bg-[#0f766e] text-white rounded-md font-bold text-[9px] uppercase hover:bg-teal-800 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {loading ? <Loader2 className="animate-spin" size={10}/> : "Ubicar"}
        </button>
      </div>
    </div>
  );
});

export default function ExpedienteForm() {

  // 1. Solicitante
  const [solicitantesParaSeleccion, setSolicitantesParaSeleccion] = useState<Personas[]>([]);
  const [totalSolicitantesRegistrados, setTotalSolicitantesRegistrados] = useState(0);
  const [cargandoSolicitantes, setCargandoSolicitantes] = useState(false);
  const [errorCargaSolicitantes, setErrorCargaSolicitantes] = useState("");

  // 2. Representantes
  const [representantesParaSeleccion, setRepresentantesParaSeleccion] = useState<Representantes[]>([]);
  const [cargandoRepresentantes, setCargandoRepresentantes] = useState(false);
  const [errorCargaRepresentantes, setErrorCargaRepresentantes] = useState("");

  // ESTADOS
  const [esPatrimonio, setEsPatrimonio] = useState(false);
  const [tieneMonitoreo, setTieneMonitoreo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itseInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [numeroExpediente, setNumeroExpediente] = React.useState("");
  //const [modo, setModo] = React.useState<"NUEVA" | "MODIFICACION">("NUEVA");

  // II Datos del solicitante
  //const [tipoPersona, setTipoPersona] = React.useState<"NATURAL" | "JURIDICA">("NATURAL");
  const [nombreRazon, setNombreRazon] = React.useState("");
  const [docTipo, setDocTipo] = React.useState<"DNI" | "CE">("DNI");
  const [docNumero, setDocNumero] = React.useState("47361628");
  const [ruc, setRuc] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [correo, setCorreo] = React.useState("jingaespinoza@gmail.com");
  const [idPersona, setIdPersona] = React.useState("");

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
  //const [modalidad, setModalidad] = React.useState<"INDETERMINADA" | "TEMPORAL">("INDETERMINADA");
  const [fechaIni, setFechaIni] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");
  const [opAnuncio, setOpAnuncio] = React.useState(false);
  const [opCesionario, setOpCesionario] = React.useState(false);
  const [opMercado, setOpMercado] = React.useState(false);
  const [tipoAnuncio, setTipoAnuncio] = React.useState("");
  const tipoAnuncioRef = useRef(null);
  const [licenciaPrincipal, setLicenciaPrincipal] = React.useState("");

  // MODIFICACIÓN — acción única
  const [accion, setAccion] = React.useState<"" | "CAMBIO_DENOMINACION" | "TRANSFERENCIA" | "CESE" | "OTROS">("");
  const [nroLicenciaOrigen, setNroLicenciaOrigen] = React.useState("");
  const [nuevaDenominacion, setNuevaDenominacion] = React.useState("");
  const [detalleOtros, setDetalleOtros] = React.useState("");

  // Seguridad / ITSE
  const [nivel, setNivel] = React.useState<"BAJO" | "MEDIO" | "ALTO" | "MUY_ALTO">("BAJO");
  const [condSeguridad, setCondSeguridad] = React.useState(true);
  //const itseRequierePrevia = React.useMemo(() => ["ALTO", "MUY_ALTO"].includes(nivel), [nivel]);
  const [itseNumero, setItseNumero] = React.useState("");
  //const [itseArchivo, setItseArchivo] = React.useState("");

  // Anexos (simulados)
  const [anexoNombre, setAnexoNombre] = React.useState("");
  const [anexos, setAnexos] = React.useState<string[]>([]);

  // DJ generales
  const [fechaRecepcion, setFechaRecepcion] = React.useState(new Date().toISOString().slice(0, 10));
  //const [estado, setEstado] = React.useState("EN_EVALUACION");

  // III — Representante legal o apoderado
  const [repNombre, setRepNombre] = React.useState("");
  const [repDocTipo, setRepDocTipo] = React.useState<"DNI" | "CE">("DNI");
  const [repDocNumero, setRepDocNumero] = React.useState("");
  const [repSunarp, setRepSunarp] = React.useState("");
  const [idRepresentante, setIdRepresentante] = React.useState("");
  const [openRep, setOpenRep] = React.useState(false);

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

    // Modal de nueva persona
  const [openPersona, setOpenPersona] = React.useState(false);
  const [personaSaving, setPersonaSaving] = React.useState(false);
  const [editingPersona, setEditingPersona] = React.useState(null);
  const [rows, setRows] = useState<Personas[]>([]);
  const [total, setTotal] = useState(0);
  const [valorInput, setValorInput] = useState("");
  const [q, setQ] = useState("");
  //const dq = useDebounce(valorInput, 500);
  const [dq, setDq] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  

  // VI — Clasificación (simulada municipal)
  const [califEditable, setCalifEditable] = React.useState(false);
  const [califNivel, setCalifNivel] = React.useState<"" | "BAJO" | "MEDIO" | "ALTO" | "MUY_ALTO">("");
  const [califNombre, setCalifNombre] = React.useState("");
  const [califFecha, setCalifFecha] = React.useState("");

  // Modal de nueva persona
  const [nombreRep, setNombreRep] = React.useState("");
  const [dniRep, setDniRep] = React.useState("");

  const [showModal, setShowModal] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showSuggestionsRep, setShowSuggestionsRep] = React.useState(false);

  const [showSuggestionsSolicitante, setShowSuggestionsSolicitante] = React.useState(false);
  const [showSuggestionsRepresentante, setShowSuggestionsRepresentante] = React.useState(false);

  //const suggestionsRef = React.useRef(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const solicitanteRef = useRef<HTMLDivElement>(null);
  const suggestionsRefRep = useRef<HTMLDivElement>(null);
  const representanteRef = useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string>("");

  const [position, setPosition] = useState([-12.0922, -77.0790]); // Cerca a Municipalidad San Miguel
  const [addressInput, setAddressInput] = useState("");
  const markerRef = useRef(null);
  const [zonaDetectada, setZonaDetectada] = useState("Mueve el pin para identificar");
  const [isGiroModalOpen, setIsGiroModalOpen] = useState(false);
  const [giros, setGiros] = useState([]);
  const [loadingGiros, setLoadingGiros] = useState(false);
  const [metodoUbica, setMetodoUbica] = useState('manual'); // 'manual' o 'busqueda'

  const [girosDb, setGirosDb] = useState<GiroModal[]>([]);
  const [buscandoGiro, setBuscandoGiro] = useState(false); 

  const { register, handleSubmit, setValue, watch, control, getValues } = useForm({
    defaultValues: {
      id_persona: null,
      tipo_persona: '',
      nombre_razon_social: '',
      fecha: new Date().toISOString().split('T')[0],
      numero_expediente: '',
      estado: 'EN_EVALUACION',
      // EXPEDIENTE LICENCIA
      licencia: {
        id_representante: '',
        nombre_representante: '',
        tiene_apoderado: false,
        fecha_recepcion: new Date().toISOString().split('T')[0],
        tipo_tramite: 'NUEVA', //NUEVA_LICENCIA | MODIFICACIONES
        modalidad: 'INDETERMINADA',
        fecha_inicio_plazo: null,
        fecha_fin_plazo: null,
        anuncio: false, 
        a_descripcion: '',
        cesionario: false,
        ces_nrolicencia: '',
        mercado: false,
        tipo_accion_tramite: '',
        numero_licencia_origen: '',
        nueva_denominacion: '',
        detalle_otros: '',
        nivel_riesgo: 'BAJO',
        numero_itse: '',
        doc_itse: '',
        bajo_juramento: true
      },
      // DECLARACION JURADA
      declaracion: {
        nombre_comercial: '',
        actividad: '',
        codigo_ciiu: '',
        nombre_giro: '',
        zonificacion: '',
        chk_tolerancia: false,
        area_total_m2: '0',
        // UBICACION
        via_tipo: 'Av.',
        via_nombre: '',
        numero: '',
        interior: '',
        mz: '',
        lt: '',
        urb_aa_hh_otros: '',
        provincia: 'SAN MIGUEL',
        otros: '',
        geom_x: null,
        geom_y: null,
        // AUTORIZACIONES SECTORIALES (CHECKS)
        tiene_aut_sectorial: false,
        aut_entidad: '',
        aut_denominacion: '',
        aut_numero: '',
        aut_fecha: '',
        // Patrimonio
        monumento: false,
        aut_ministerio_cultura: false,
        num_aut_ministerio_cultura: '',
        fecha_aut_ministerio_cultura: '',
        archivo_aut_ministerio_cultura: '',
        // Declaraciones Juradas Finales (Checks de cumplimiento)
        vigencia_poder: false,
        condiciones_seguridad: true,
        titulo_profesional: false,
        aceptacion: true,
        observaciones: '',        
      },
      giros_seleccionados: [],      
      pagos: [{
        nro_recibo: '',
        fecha_pago: '',
        monto:''
      }]
    }
  });

  const { 
    fields: fieldsGiros, 
    append: appendGiro, 
    remove: removeGiro 
  } = useFieldArray({
    control,
    name: "giros_seleccionados"
  });

  const { 
    fields: fieldsPagos, 
    append: appendPago, 
    remove: removePago 
  } = useFieldArray({
    control,
    name: "pagos" 
  });

  const modalidad = watch("licencia.modalidad");
  const modo = watch("licencia.tipo_tramite");
  const chk_bajoJuramento = watch("licencia.bajo_juramento");
  const chk_aceptacion = watch("declaracion.aceptacion");
  const watchAccion = watch("licencia.tipo_accion_tramite");
  const isAutoridadSectorial = watch("declaracion.tiene_aut_sectorial");
  const isPatrimonioCultural = watch("declaracion.monumento"); 
  const fileUploaded = watch("declaracion.archivo_aut_ministerio_cultura");
  const estado = watch("estado");
  const nivelRiesgo = watch("licencia.nivel_riesgo");
  const itseArchivo = watch("licencia.doc_itse");
  const nombreRepresentante = watch("licencia.nombre_representante");
  //const idSolicitante = watch("id_persona");
  const tieneApoderado = watch("licencia.tiene_apoderado");

  const itseRequierePrevia = ["ALTO", "MUY_ALTO"].includes(nivelRiesgo);

  const isModBasica =
    modo === "MODIFICACION" &&
    ["CAMBIO_DENOMINACION", "TRANSFERENCIA", "CESE"].includes(accion);   

  

  const actualizarFormulario = (addr) => {
    // Aquí pon tus funciones set del formulario:
    if (typeof setEstViaNombre === "function") setEstViaNombre(addr.road || addr.pedestrian || "");
    if (typeof setEstNumeroPuerta === "function") setEstNumeroPuerta(addr.house_number || "");
    if (typeof setEstUrbAAHH === "function") setEstUrbAAHH(addr.suburb || addr.neighbourhood || "");
  };

  const procesarBusqueda2 = async (termino) => {
    setLoading(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(termino + ", Lima, Peru")}&limit=1`);
      const data = await resp.json();
      if (data.length > 0) {
        const { lat, lon, address } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        actualizarFormulario(address);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
 

  /*const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        handleReverseGeocode(newPos.lat, newPos.lng);
      }
    },
  }), []);*/
 

  const handleReverseGeocode = async (lat, lon) => {
    setLoading(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,        
      );
      const data = await resp.json();
      setPosition([lat, lon]);
      updateFieldsFromAddress(data.address);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateFieldsFromAddress = (addr) => {
    setFormData({
      via: addr.road || addr.pedestrian || addr.cycleway || "",
      numero: addr.house_number || "",
      urbanizacion: addr.suburb || addr.neighbourhood || addr.residential || "",
      distrito: (addr.city_district || "SAN MIGUEL").toUpperCase(),
      provincia: (addr.city || addr.county || "LIMA").toUpperCase(),
    });
  };

  // Función para verificar zonificación
  const verificarZonificacion = (coords, geojsonData) => {
  if (!coords || !geojsonData?.features) return "Error de datos";

  try {
    // 1. Crear el punto (Turf usa [lng, lat])
    const punto = turf.point([coords.lng, coords.lat]);

    // 2. Buscar el polígono que contiene el punto
    // Filtramos para asegurarnos de procesar solo polígonos y evitar errores
    const featureEncontrada = geojsonData.features.find((f) => {
      const esPoligono = f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon';
      return esPoligono && turf.booleanPointInPolygon(punto, f);
    });

    // 3. Retornar el nombre de la capa o el mensaje por defecto
    if (featureEncontrada) {
      // Usamos el nombre de la columna que limpiaste en QGIS ('layer')
      return featureEncontrada.properties.layer || "Zona sin nombre";
    }

    return "Fuera de zona";

  } catch (error) {
    console.error("Error en validación espacial:", error);
    return "Error de cálculo";
  }
};

  // Manejador del evento al soltar el pin
  const eventHandlers2 = useMemo(() => ({
    async dragend(e) {
      const coords = e.target.getLatLng();
      setPosition([coords.lat, coords.lng]);

      // 1. Zonificación (Lo que ya tienes)
      const zona = verificarZonificacion(coords, datosGeoJSON);
      setValue("declaracion.zonificacion", zona);

      // 2. Dirección con Despiece
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`,
            {
            headers: {
              'User-Agent': 'MiAppMunicipal/1.0 (gustavo.alvarado@munisanmiguel.gob.pe)'
            }
          }
        );
        const data = await response.json();
        const addr = data.address;
        
        // A. Tipo de Vía y Nombre de Vía
        /*if (addr.road) {
          const roadParts = addr.road.split(' ');
          const posibleTipo = roadParts[0].toLowerCase();
          
          if (posibleTipo.includes('avenida')) setValue("declaracion.via_tipo", "Av.");
          else if (posibleTipo.includes('jirón') || posibleTipo.includes('jiron')) setValue("declaracion.via_tipo", "Jr.");
          else if (posibleTipo.includes('calle')) setValue("declaracion.via_tipo", "Ca.");
          else if (posibleTipo.includes('pasaje')) setValue("declaracion.via_tipo", "Pje.");
          
          setValue("declaracion.via_nombre", addr.road.replace(/^(Avenida|Jr\.|Calle|Ca\.|Jr|Pasaje|Pje)\s+/i, ''));
        }*/
        if (addr.road) {
          const roadLower = addr.road.toLowerCase();
          let tipo = "Ca."; // Por defecto calle
          
          if (roadLower.includes('avenida')) tipo = "Av.";
          else if (roadLower.includes('jiron') || roadLower.includes('jirón')) tipo = "Jr.";
          else if (roadLower.includes('pasaje')) tipo = "Pje.";
          else if (roadLower.includes('carretera')) tipo = "Carr.";

          setValue("declaracion.via_tipo", tipo);
          // Limpiamos el nombre: quitamos la palabra del tipo al inicio
          const nombreLimpio = addr.road.replace(/^(Avenida|Jr\.|Jirón|Calle|Ca\.|Jr|Pasaje|Pje|Prolongación)\s+/i, '');
          setValue("declaracion.via_nombre", nombreLimpio);
        }

        setValue("declaracion.numero", addr.house_number || "S/N");

        // C. Urbanización / AA.HH. / Sector
        const urbanizacion = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.hamlet || "";
        setValue("declaracion.urb_aa_hh_otros", urbanizacion);

        // D. Provincia / Distrito
        const distrito = addr.city_district || addr.city || "";
        const provincia = addr.city || addr.county || "";
        setValue("declaracion.provincia", `${provincia} / ${distrito}` );
      } catch (error) {
        console.error("Error al geocodificar:", error);
        Toast.fire({ icon: "warning", title: "No pudimos obtener la dirección exacta, por favor complétela manualmente." });
      }
    },
  }), [datosGeoJSON, setValue]);

  //Mapbox
  const eventHandlers = useMemo(() => ({
    async dragend(e) {
      // marcar manual
      setMetodoUbica('manual');

      const coords = e.target.getLatLng();
      setPosition([coords.lat, coords.lng]);

      setValue("declaracion.geom_x", coords.lng, { shouldValidate: true });
      setValue("declaracion.geom_y", coords.lat, { shouldValidate: true });

      // 1. Zonificación (Sigue usando tu GeoJSON oficial)
      const zona = verificarZonificacion(coords, datosGeoJSON);
      setValue("declaracion.zonificacion", zona);

      // 2. Dirección con Mapbox API
      const ACCESS_TOKEN = mapboxToken;
      // Usamos el endpoint 'mapbox.places' para geocodificación inversa
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=${ACCESS_TOKEN}&types=address&language=es`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const place = data.features[0];
          
          // Mapbox separa el nombre de la calle del número de casa
          // place.text -> Nombre de la vía (Ej: "Avenida Javier Prado")
          // place.address -> Número (Ej: "450")
          
          const fullStreet = place.text || "";
          
          // A. Tipo y Nombre de Vía
          if (fullStreet) {
            if (/^Avenida/i.test(fullStreet)) setValue("declaracion.via_tipo", "Av.");
            else if (/^Jirón|Jiron/i.test(fullStreet)) setValue("declaracion.via_tipo", "Jr.");
            else if (/^Calle/i.test(fullStreet)) setValue("declaracion.via_tipo", "Ca.");
            else if (/^Pasaje/i.test(fullStreet)) setValue("declaracion.via_tipo", "Pje.");
            
            const nombreLimpio = fullStreet.replace(/^(Avenida|Jirón|Jiron|Calle|Pasaje)\s+/i, '');
            setValue("declaracion.via_nombre", nombreLimpio);
          }
          setValue("declaracion.numero", place.address || "S/N");

          const context = place.context || [];
          const urbanizacion = 
            context.find(c => c.id.includes('neighborhood'))?.text || 
            context.find(c => c.id.includes('locality'))?.text || 
            "";
          const distrito = context.find(c => c.id.includes('place'))?.text || "";
          const provincia = context.find(c => c.id.includes('region'))?.text || "";
          const provinciaLimpia = provincia.replace(/provincia de\s+/i, "").trim();

          setValue("declaracion.urb_aa_hh_otros", urbanizacion);
          setValue("declaracion.provincia", `${provinciaLimpia} / ${distrito}`);
        }
      } catch (error) {
        console.error("Error con Mapbox Geocoding:", error);
      }
    },
  }), [datosGeoJSON, setValue]);

  // Busqueda de dirección
  const procesarBusqueda = async (termino) => {
    if (!termino) return;
    
    setLoading(true);
    const ACCESS_TOKEN = mapboxToken;
    
    // Añadimos proximidad o filtros para que priorice resultados en Lima
    // bbox ayuda a que no busque en otros países (long_min, lat_min, long_max, lat_max)
    const bbox = "-77.20, -12.30, -76.60, -11.70"; // Aproximadamente Lima Metropolitana
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(termino)}.json?access_token=${ACCESS_TOKEN}&country=pe&bbox=${bbox}&language=es&limit=1`;

    try {
      const resp = await fetch(url);
      const data = await resp.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;

        // 1. Mover el mapa y el pin
        setMetodoUbica('busqueda');
        setPosition([lat, lng]);

        setValue("declaracion.geom_x", lng, { shouldValidate: true });
        setValue("declaracion.geom_y", lat, { shouldValidate: true });

        // 2. Extraer datos del contexto (Igual que en el dragend)
        const context = feature.context || [];
        
        const fullStreet = feature.text || "";
        const numero = feature.address || "S/N";
        
        const urbanizacion = 
          context.find(c => c.id.includes('neighborhood'))?.text || 
          context.find(c => c.id.includes('locality'))?.text || "";

        const distrito = context.find(c => c.id.includes('place'))?.text || "";
        
        const provinciaRaw = context.find(c => c.id.includes('region'))?.text || "";
        const provinciaLimpia = provinciaRaw.replace(/provincia de\s+/i, "").trim();

        // 3. Actualizar Formulario (Siguiendo tu lógica de limpieza)
        // Vía
        if (fullStreet) {
          let tipo = "Ca.";
          if (/^Avenida/i.test(fullStreet)) tipo = "Av.";
          else if (/^Jirón|Jiron/i.test(fullStreet)) tipo = "Jr.";
          else if (/^Pasaje/i.test(fullStreet)) tipo = "Pje.";
          
          const nombreLimpio = fullStreet.replace(/^(Avenida|Jirón|Jiron|Calle|Pasaje)\s+/i, '');
          
          setValue("declaracion.via_tipo", tipo);
          setValue("declaracion.via_nombre", nombreLimpio);
        }

        setValue("declaracion.numero", numero);
        setValue("declaracion.urb_aa_hh_otros", urbanizacion);
        setValue("declaracion.provincia", `${provinciaLimpia} / ${distrito}`);

        // 4. IMPORTANTE: Validar Zonificación con las nuevas coordenadas
        const zona = verificarZonificacion({ lat, lng }, datosGeoJSON);
        setValue("declaracion.zonificacion", zona);

      } else {
        console.warn("No se encontraron resultados para la búsqueda.");
      }
    } catch (e) {
      console.error("Error en búsqueda Mapbox:", e);
    } finally {
      setLoading(false);
    }
  };

  // Buscar giros
  const handleBuscarGiros = async (termino: string) => {
    setBuscandoGiro(true);
    try {
      const data = await girosApi.buscarParaModal(termino);
      console.log(data);
      setGirosDb(data);
    } catch (error) {
      console.error("Error cargando giros", error);
    } finally {
      setBuscandoGiro(false);
    }
  };

  /* Elegir Giros */
  const handleGiroSelect = (giro, compatibilidad) => {
    // 1. Extraemos la zonificación actual para el mensaje (puedes usar watch o una variable local)
    //const zonificacionActual = watch("declaracion.zonificacion") || "No detectada";
    const girosActuales = watch("giros_seleccionados") || [];

    // 1. Evitar duplicados
    const yaExiste = girosActuales.some(g => g.id_giro === giro.id_giro);
    if (yaExiste) {
      alert("Este giro ya ha sido seleccionado.");
      return;
    }

    // 2. Seteamos los valores principales de una sola vez
    // Es buena práctica agrupar los setValues si usas react-hook-form
    //setValue("declaracion.codigo_ciiu", giro.id_giro, { shouldValidate: true });
    //setValue("declaracion.nombre_giro", giro.nombre, { shouldValidate: true });
    //setValue("riesgo_base", giro.riesgo_base || "BAJO"); // Fallback por si viene vacío

    // 3. Lógica de compatibilidad (Corregida: X = Permitido, O = No permitido)
    // Usamos 'O' como fallback si no existe el registro de compatibilidad
    const codigoEstado = compatibilidad?.estado_uso?.codigo || 'O'; 
    const esPermitido = codigoEstado === 'X';

    /*if (!esPermitido) {
      // Si NO es 'X', marcamos como excepción
      setValue("declaracion.chk_tolerancia", true);
      
      // Opcional: Podrías usar un Toast en lugar de un alert para una mejor UI
      console.warn(`Giro no compatible: ${giro.nombre} en zona ${zonificacionActual}`);
      
      // Podrías abrir un campo de "Sustento de Excepción" aquí si tu formulario lo tiene
    } else {
      setValue("declaracion.chk_tolerancia", false);
    }*/
    // 3. Agregamos el nuevo objeto al array del formulario
    const nuevoGiro = {
      id_giro: giro.id_giro,
      codigo: giro.codigo,
      nombre: giro.nombre,
      riesgo_base: giro.riesgo_base || "BAJO",
      id_giro_zonificacion: compatibilidad?.id_giro_zonificacion || null,
      con_excepcion: !esPermitido,
      zonificacion_al_momento: watch("declaracion.zonificacion")
    };
    console.log(nuevoGiro)

    /*appendGiro({
      id_giro: giro.id_giro,
      codigo: giro.codigo,
      nombre: giro.nombre,
      riesgo_base: giro.riesgo_base || "BAJO",
      id_giro_zonificacion: compatibilidad?.id_giro_zonificacion || null,
      con_excepcion: !esPermitido,
      zonificacion_al_momento: watch("declaracion.zonificacion")
    });*/

    setIsGiroModalOpen(false);
  };

  // Lista solicitantes
  const obtenerSolicitantes = async (query = "", pagina = 1, limite = 10) => {
    let cancelado = false;

    try {
      setCargandoSolicitantes(true);
      setErrorCargaSolicitantes("");

      const response = await personasApi.list(query, pagina, limite);
      
      // Desestructuramos según tu API (asegúrate de que los nombres coincidan)
      const { data: listado, total: cuentaTotal } = response;

      if (!cancelado) {
        // 2. Si la API devuelve null o undefined, enviamos un array vacío
        setSolicitantesParaSeleccion(listado || []);
        setTotalSolicitantesRegistrados(cuentaTotal || 0);
      }
    } catch (e: any) {
      if (!cancelado) {
        console.error("Error API Solicitantes:", e);
        setErrorCargaSolicitantes(e?.message ?? "Error al consultar el catálogo de personas");
        setSolicitantesParaSeleccion([]); // Limpiamos la lista en caso de error
      }
    } finally {
      if (!cancelado) {
        setCargandoSolicitantes(false);
      }
    }

    return () => {
      cancelado = true;
    };
  };
  
  // Lista representantes
  const obtenerRepresentantes = async (idPersonaSolicitante: number) => {
    let cancelado = false;

    if (!idPersonaSolicitante) {
      setRepresentantesParaSeleccion([]);
      return () => { cancelado = true; };
    }

    try {
      setCargandoRepresentantes(true);
      setErrorCargaRepresentantes("");

      const response = await representantesApi.getByPersona(idPersonaSolicitante);
      
      // Asumiendo que response es directamente el array Representantes[]
      // o viene dentro de una propiedad data. Ajústalo según tu interceptor http.
      const listado = Array.isArray(response) ? response : (response as any).data;

      if (!cancelado) {
        setRepresentantesParaSeleccion(listado || []);
      }
    } catch (e: any) {
      if (!cancelado) {
        console.error("Error API Representantes:", e);
        setErrorCargaRepresentantes(e?.message ?? "Error al consultar representantes");
        setRepresentantesParaSeleccion([]);
      }
    } finally {
      if (!cancelado) {
        setCargandoRepresentantes(false);
      }
    }

    return () => {
      cancelado = true;
    };
  };

  const handleSelectPersona = (persona: any) => {
    setValue("id_persona", persona.id_persona);
    setValue("nombre_razon_social", persona.nombre_razon_social);
    setValue("tipo_persona", persona.tipo_persona);
    setValorInput(persona.nombre_razon_social);

    // Si es Jurídica, el apoderado se marca falso por defecto
    if (persona.tipo_persona === 'JURIDICA') {
      setValue("licencia.tiene_apoderado", false);
    }

    // Disparamos la carga de representantes para este nuevo ID
    obtenerRepresentantes(persona.id_persona);
    
    // ¡IMPORTANTE!: Limpiamos el representante anterior al cambiar de solicitante
    setValue("licencia.id_representante", "");
    setValue("licencia.nombre_representante", "");

    setDq("");
    setShowSuggestionsSolicitante(false);
  };

  const handleSelectRepresentante = (representante: any) => {
    setValue("licencia.id_representante", representante.id_representante);
    setValue("licencia.nombre_representante", representante.nombres);
    setShowSuggestionsRepresentante(false);
  }

  useEffect(() => {
    // Quitamos el IF restrictivo para que entre siempre
    let cleanupFn: (() => void) | undefined;

    const ejecutarBusqueda = async () => {
      // Si dq es vacío, enviamos "" para que la API traiga el top 10
      const res = await obtenerSolicitantes(dq || "", page, limit);
      if (typeof res === 'function') {
        cleanupFn = res;
      }
    };

    ejecutarBusqueda();

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [dq, page, limit]); // Se disparará al montar el componente y cada vez que dq cambie

  useEffect(() => {
    let cancelled = false;

    if (djFirmanteTipo === "SOLICITANTE") {
      setDjFirmanteNombre(nombreRazon || "");
      setDjDeclaroPoder(false);
    } else {
      setDjFirmanteNombre(repNombre || "");
      setDjFirmanteDocTipo(repDocTipo || "DNI");
      setDjFirmanteDocNumero(repDocNumero || "");
      setDjDeclaroPoder(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (solicitanteRef.current && !solicitanteRef.current.contains(target)) {
        setShowSuggestionsSolicitante(false);
      }

      if (representanteRef.current && !representanteRef.current.contains(target)){
        setShowSuggestionsRepresentante(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>  document.removeEventListener("mousedown", handleClickOutside);

  }, [djFirmanteTipo, nombreRazon, docTipo, docNumero, repNombre, repDocTipo, repDocNumero/*, tipoPersona, dq, page, limit*/]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es muy pesado");
        return;
      }
      setValue("declaracion.archivo_aut_ministerio_cultura", file);
      console.log("Archivo seleccionado:", file);
    }
  };

  const handleItseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Máximo 5MB");
      setValue("licencia.doc_itse", file);
    }
  };

  const alEnviar = (data: any) => {
    console.log("Datos limpios recolectados:", data);
  };

  const alEnviar2 = async (data) => {
    try {
      setLoading(true);

      // 1. Limpieza de datos (Opcional pero recomendado)
      // Aseguramos que los montos sean números y las fechas tengan formato correcto
      const payload = {
        ...data,
        pagos: data.pagos.map(p => ({
          ...p,
          monto: parseFloat(p.monto) // Asegurar que sea decimal
        })),
        // La fecha ya viene en string YYYY-MM-DD por el input date
      };

      const response = await expedientesApi.guardarSolicitudDDJJ(payload);
      const result = response.data;

      if (result.success) {
        swalSuccess(`Licencia registrada con expediente ${result.numero_expediente}`);
        // Redirigir o limpiar formulario
      } else {
        throw new Error(result.message || "Error al guardar");
      }

    } catch (error: any) {
      console.error("Error en el registro:", error);
      swalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (  
   <>
    <style>
        {`
          .etiqueta-zonificacion {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            font-weight: 800;
            color: #000;
            text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
            font-size: 11px;
          }
          .leaflet-tooltip-pane .leaflet-tooltip-top:before,
          .leaflet-tooltip-pane .leaflet-tooltip-bottom:before {
            display: none !important;
          }
        `}
    </style>
  <form onSubmit={handleSubmit(alEnviar)}>
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 px-4 md:px-10">
      
      {/* TIPO DE LICENCIA */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Selector de Modo Compacto */}
        <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-xl border border-slate-200 w-fit shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo:</span>
          <div className="flex gap-4 pr-2">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer group">
              <input 
                type="radio" 
                value="NUEVA"
                className="w-4 h-4 text-[#0f766e] focus:ring-[#0f766e] border-slate-300" 
                {...register("licencia.tipo_tramite")}
                
              />
              <span className={`${modo === 'NUEVA' ? 'text-[#0f766e]' : 'text-slate-600'} group-hover:text-[#0f766e] transition-colors uppercase tracking-tighter`}>
                Nueva licencia
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer group">
              <input 
                type="radio" 
                value="MODIFICACION"
                className="w-4 h-4 text-[#0f766e] focus:ring-[#0f766e] border-slate-300" 
                {...register("licencia.tipo_tramite")}
              />
              <span className={`${modo === 'MODIFICACION' ? 'text-[#0f766e]' : 'text-slate-600'} group-hover:text-[#0f766e] transition-colors uppercase tracking-tighter`}>
                Modificaciones
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL: Distribución en 2 columnas reales */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Agrupa Nueva Licencia + Modificaciones */}
        <div className="flex flex-col gap-6">
          
          {/* 1. SECCIÓN: NUEVA LICENCIA */}
          <div className={`transition-all duration-300 ${modo !== 'NUEVA' ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
            <SeccionCard title="">
              <fieldset disabled={modo !== 'NUEVA'} className={`space-y-6 ${modo !== 'NUEVA' ? 'opacity-40' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Columna Izquierda: Modalidad */}
                  <div className="flex flex-col">
                    {/* Label ajustado: Slate-800 y fuente más marcada */}
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#0f766e] rounded-full"></span>
                      Vigencia de Licencia
                    </label>
                    
                    <div className="flex gap-3">
                      {[
                        { id: 'INDETERMINADA', label: 'INDETERMINADA' },
                        { id: 'TEMPORAL', label: 'TEMPORAL' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setValue('licencia.modalidad', m.id);
                            if (m.id === 'INDETERMINADA') {
                              setValue('licencia.fecha_inicio_plazo', null);
                              setValue('licencia.fecha_fin_plazo', null);
                            }
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 font-bold text-[11px] transition-all
                            ${modalidad === m.id 
                              ? 'border-[#0f766e] bg-[#0f766e]/5 text-[#0f766e]' 
                              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}
                          `}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {modalidad === "TEMPORAL" && (
                      <div className="grid grid-cols-2 gap-3 mt-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-1.5">
                          {/* Label secundario en Slate-700 para legibilidad */}
                          <label className={labelClasses}>Desde</label>
                          <input 
                            type="date" 
                            className={inputClasses}
                            {...register("licencia.fecha_inicio_plazo")}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClasses}>Hasta</label>
                          <input 
                            type="date" 
                            className={inputClasses}
                            {...register("licencia.fecha_fin_plazo")}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha: Opciones Adicionales */}
                  <div className="flex flex-col">
                    {/* Label ajustado: Slate-800 */}
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#0f766e] rounded-full"></span>
                      Servicios Adicionales
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'anuncio', label: 'Anuncio' },
                        { id: 'cesionario', label: 'Cesionario' },
                        { id: 'mercado', label: 'Mercado' }
                      ].map(op => {
                        const fieldPath = `licencia.${op.id}`; 
                        const isActive = watch(fieldPath as any);
                        return (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => {
                              const nextValue = !isActive;
                              setValue(fieldPath as any, nextValue);

                              if (!nextValue) {
                                if (op.id === 'anuncio') setValue('licencia.a_descripcion', '');
                                if (op.id === 'cesionario') setValue('licencia.ces_nrolicencia', '');
                              }
                            }}
                            className={`px-3 py-2 rounded-lg border-2 text-[10px] font-black uppercase transition-all
                              ${isActive 
                                ? 'border-[#0f766e] bg-[#0f766e] text-white' 
                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}
                            `}
                          >
                            {op.label}
                          </button>
                        );                        
                      })}
                    </div>

                    <div className="mt-4 space-y-3">
                      {watch("licencia.anuncio") && (
                        <div className="animate-in slide-in-from-right-2 duration-200 flex flex-col gap-1.5">
                          <label className={labelClasses}>Descripción del Anuncio</label>
                          <input 
                            className={inputClasses}
                            placeholder="Ej: Letrero luminoso" 
                            {...register("licencia.a_descripcion")}
                          />
                        </div>
                      )}
                      {watch("licencia.cesionario") && (
                        <div className="animate-in slide-in-from-right-2 duration-200 flex flex-col gap-1.5">
                          <label className={labelClasses}>Nro de licencia de funcionamiento principal</label>
                          <input 
                            className={inputClasses}
                            placeholder="Nº Licencia Titular Principal" 
                            {...register("licencia.ces_nrolicencia")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </fieldset>
            </SeccionCard>
          </div>

          {/* 2. SECCIÓN: MODIFICACIONES */}
          <div className={`transition-all duration-300 ${modo !== 'MODIFICACION' ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
            <SeccionCard title="">
              <fieldset disabled={modo !== 'MODIFICACION'} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClasses}>
                    Tipo de Acción Solicitada
                  </label>
                  <div className="relative group">
                    <select 
                      className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-black focus:border-[#0f766e] outline-none transition-all appearance-none cursor-pointer tracking-tight"
                      {...register("licencia.tipo_accion_tramite")}
                    >
                      <option value="">— SELECCIONE ACCIÓN —</option>
                      <option value="CAMBIO_DENOMINACION">🔄 CAMBIO DE DENOMINACIÓN</option>
                      <option value="TRANSFERENCIA">🤝 TRANSFERENCIA</option>
                      <option value="CESE">🛑 CESE DE ACTIVIDADES</option>
                      <option value="OTROS">📝 OTROS CAMBIOS</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {watchAccion && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-1 duration-200">
                    {(["CAMBIO_DENOMINACION","TRANSFERENCIA","CESE"].includes(watchAccion)) && (
                      <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                        <label className="text-[9px] font-bold text-amber-700 uppercase ml-1">N.º Licencia de Origen</label>
                        <input 
                          className="mt-1 w-full h-9 rounded-md border border-amber-200 bg-white px-3 text-xs font-bold text-amber-900 focus:border-amber-500 outline-none transition-all" 
                          placeholder="Ej. LIC-2020-XXXX" 
                          {...register("licencia.numero_licencia_origen")}
                        />
                      </div>
                    )}
                    {watchAccion === "CAMBIO_DENOMINACION" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nueva denominación</label>
                        <input 
                          className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-[#0f766e] outline-none transition-all" 
                          placeholder="Ingrese nuevo nombre..."
                          {...register("licencia.nueva_denominacion")}
                        />
                      </div>
                    )}
                    {watchAccion === "OTROS" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Detalle del cambio</label>
                        <textarea 
                          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs focus:border-[#0f766e] outline-none transition-all resize-none" 
                          rows={3} 
                          value={detalleOtros} 
                          {...register("licencia.detalle_otros")}
                        />
                      </div>
                    )}
                  </div>
                )}

                {!watchAccion && modo === 'MODIFICACION' && (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <FileText size={32} className="text-slate-200 mb-2" />
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">Seleccione una acción para continuar</p>
                  </div>
                )}
              </fieldset>
            </SeccionCard>
          </div>

          {/* SECCION: DATOS DEL ESTABLECIMIENTO */}
          <SeccionCard title="">
            <div className="w-full mb-5 border-b border-slate-300/60">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#0f766e] opacity-20">04</span>
                <h2 className="text-lg font-black text-slate-700 tracking-tight uppercase">
                  Datos del Establecimiento
                </h2>
              </div>
            </div>

            <fieldset disabled={isModBasica} className={`space-y-4 ${isModBasica ? 'opacity-50' : ''}`}>

              {/* MAPA */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between ml-1">
                  <label className={labelClasses}>Geolocalización del Establecimiento</label>
                  <span className="text-[9px] font-bold text-[#0f766e] italic">Suelte el pin sobre la ubicación de su local</span>
                </div>

                {/* BLOQUE BUSCADOR */}
                <SlimSearchBlock onSearch={procesarBusqueda} loading={loading} />

                {/* Nuevo componente de Mapa Optimizado */}
                <MapaZonificacion 
                  position={position}
                  setPosition={setPosition}
                  datosGeoJSON={datosGeoJSON}
                  lineaMapa={lineaMapa}
                  eventHandlers={eventHandlers}
                  iconMaker={metodoUbica}
                  markerRef={markerRef}
                />
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-end">
                {/* COLUMNA ZONIFICACIÓN */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className={labelClasses}>
                    Zonificación
                  </label>
                  <input
                    readOnly
                    className={cx(inputClasses, "bg-slate-50 font-mono text-center")} 
                    placeholder="Detectando..."
                    {...register("declaracion.zonificacion")}
                  />
                </div>
                {/* COLUMNA TOLERANCIA - Arreglado para alineación uniforme */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  {/* Este label invisible (o vacío) empuja el switch hacia abajo lo mismo que el label de Zonificación */}
                  <label className="text-[10px] uppercase select-none opacity-0">spacer</label>
                  
                  <div className="flex items-center justify-between h-9 bg-slate-50 px-4 rounded-lg border border-slate-200 transition-all hover:border-slate-300">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-tight cursor-pointer">
                      Tolerancia
                    </label>
                    <Switch 
                      className="data-[state=checked]:bg-[#0f766e] data-[state=unchecked]:bg-slate-300 scale-90"
                      {...register("declaracion.chk_tolerancia")}
                    />
                  </div>
                </div>

              </div>

              {/* 2. Ubicación Física */}
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-widest mb-3 block ml-1">Ubicación del Establecimiento</span>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 flex gap-2">
                    <select className="w-20 h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] font-bold outline-none" 
                      value={estViaTipo} 
                      {...register("declaracion.via_tipo")}>
                      <option>Av.</option><option>Jr.</option><option>Ca.</option><option>Pje.</option>
                    </select>
                    <input className="flex-1 h-9 rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#0f766e]" 
                      placeholder="Nombre de vía"
                      autoComplete="off"
                      {...register("declaracion.via_nombre")}
                    />
                  </div>
                  
                  <div className="md:col-span-7 grid grid-cols-5 gap-2">
                    <input className={inputClasses} autoComplete="off" placeholder="N°" {...register("declaracion.numero")} />
                    <input className={inputClasses} autoComplete="off" placeholder="Int." {...register("declaracion.interior")} />
                    <input className={inputClasses} autoComplete="off" placeholder="Mz" {...register("declaracion.mz")} />
                    <input className={inputClasses} autoComplete="off" placeholder="Lt" {...register("declaracion.lt")} />
                    <input className={inputClasses} autoComplete="off" placeholder="Otros" {...register("declaracion.otros")} />
                  </div>

                  <div className="md:col-span-6">
                    <label className={labelClasses}>Urb. / AA.HH. / Sector</label>
                    <input className={inputClasses} autoComplete="off"
                      {...register("declaracion.urb_aa_hh_otros")} />
                  </div>
                  <div className="md:col-span-4">
                    <label className={labelClasses}>Provincia / Distrito</label>
                    <input className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#0f766e]" autoComplete="off"
                      {...register("declaracion.provincia")}/>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Área Total (m²)</label>
                    <div className="relative">
                      <input type="number" step="0.01" className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 pr-8 text-xs font-bold text-[#0f766e] outline-none" 
                        {...register("declaracion.area_total_m2")} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">m²</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-end">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className={labelClasses}>Código CIIU</label>
                  <input
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-[#0f766e] outline-none transition-all text-center font-mono"
                    placeholder="5610"
                    autoComplete="off"
                    {...register("declaracion.codigo_ciiu")}
                  />
                </div>

                <div className="md:col-span-10 flex flex-col gap-1.5">
                  <label className={labelClasses}>Giro(s) del Negocio*</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-[#0f766e] outline-none"
                      placeholder="Ej. Venta de abarrotes..."
                      autoComplete="off"
                      {...register("declaracion.nombre_giro")}
                    />
                    <button
                      type="button"
                      className={buttonClasses}
                      onClick={() => setIsGiroModalOpen(true)}
                    >
                      <Plus size={14} /> Agregar
                    </button>

                    {/* Al final de tu return, antes de cerrar el div principal */}
                    <ModalSeleccionGiro 
                      isOpen={isGiroModalOpen}
                      onClose={() => setIsGiroModalOpen(false)}
                      zonificacionDetectada={watch("declaracion.zonificacion")}
                      girosDisponibles={girosDb}
                      onSelect={handleGiroSelect}
                      loading={buscandoGiro} 
                      onSearch={handleBuscarGiros}
                    />
                  </div>
                </div>
              </div>

              {/* Chips de giros */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-700">
                  Giros Seleccionados
                </label>
                
                {fieldsGiros.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#0f766e]">CIIU: {item.codigo}</span>
                        {item.con_excepcion && (
                          <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded font-black">
                            CON EXCEPCIÓN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 uppercase">{item.nombre}</p>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => removeGiro(index)} // Elimina del formulario
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-colors"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}

                {fieldsGiros.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">No hay giros seleccionados.</p>
                )}
              </div>

              {/* 1. Identificación y Actividad */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-end">
                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label className={labelClasses}>Nombre Comercial</label>
                  <input
                    className={inputClasses}
                    placeholder="Ej. Restaurante Sazón Peruana"
                    autoComplete="off"
                    {...register("declaracion.nombre_comercial")}
                  />
                </div>

                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label className={labelClasses}>Actividad Específica</label>
                  <input
                    className={inputClasses}
                    placeholder="Detalle la actividad principal..."
                    autoComplete="off"
                    {...register("declaracion.actividad")}
                  />
                </div>

              </div>
              
              {/* 3. Autorización Sectorial */}
              <div className={`pt-2 px-1 rounded-xl transition-all duration-300 ${isAutoridadSectorial ? 'bg-teal-50/30 p-4 border border-[#0f766e]/10' : ''}`}>
                <label className="flex items-center gap-3 cursor-pointer group mb-4 ml-1">
                  <Switch 
                    checked={watch("declaracion.tiene_aut_sectorial")}
                    onCheckedChange={(val) => {
                      setValue("declaracion.tiene_aut_sectorial", val);
                      if (!val) {
                        setValue("declaracion.aut_entidad", "");
                        setValue("declaracion.aut_denominacion", "");
                        setValue("declaracion.aut_fecha", "");
                        setValue("declaracion.aut_numero", "");
                      }
                    }}
                    className="data-[state=checked]:bg-[#0f766e] data-[state=unchecked]:bg-slate-200"
                  />
                  <span className="text-[11px] font-black text-slate-600 group-hover:text-[#0f766e] transition-colors uppercase tracking-tight">
                    Requiere Autorización Sectorial 
                    <span className="block text-[9px] text-slate-400 font-bold italic normal-case">
                      (Entidades reguladoras: Salud, Educación, MTC, etc.)
                    </span>
                  </span>
                </label>

                {/* SECCIÓN CONDICIONAL */}
                {isAutoridadSectorial && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-[#0f766e]/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    
                    <div className="md:col-span-3">
                      <label className={labelClasses}>Entidad</label>
                      <input 
                        className={inputClasses}
                        placeholder="EJ. MINSA, MTC" 
                        {...register("declaracion.aut_entidad")}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className={labelClasses}>Denominación del Permiso</label>
                      <input 
                        className={inputClasses}
                        placeholder="NOMBRE DEL DOCUMENTO..." 
                        {...register("declaracion.aut_denominacion")}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClasses}>Fecha Emisión</label>
                      <input 
                        type="date" 
                        className={inputClasses}
                        {...register("declaracion.aut_fecha")}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className={labelClasses}>N° Resolución / Código</label>
                      <input 
                        className={inputClasses} 
                        placeholder="EJ. 123-2024/MINSA"
                        {...register("declaracion.aut_numero")}
                      />
                    </div>

                    <div className="md:col-span-12">
                      <p className="text-[9px] text-[#0f766e] font-bold bg-teal-50 p-2 rounded-md border border-[#0f766e]/10 uppercase italic text-center">
                        * Verifique que el documento sectorial se encuentre vigente al momento de la solicitud.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Inmueble patrimonio cultural */}
              <div className={`pt-2 px-1 rounded-xl transition-all duration-300 ${isPatrimonioCultural ? 'bg-teal-50/30 p-4 border border-[#0f766e]/10' : ''}`}>
                <label className="flex items-center gap-3 cursor-pointer group mb-4 ml-1">
                  <Switch 
                    checked={watch("declaracion.monumento")}
                    onCheckedChange={(val) => {
                      setValue("declaracion.monumento", val);
                      if (!val) {
                        setValue("declaracion.aut_entidad", "");
                        setValue("declaracion.aut_denominacion", "");
                        setValue("declaracion.aut_fecha", "");
                        setValue("declaracion.aut_numero", "");
                      }
                    }}
                    className="data-[state=checked]:bg-[#0f766e] data-[state=unchecked]:bg-slate-200"
                  />
                  <span className="text-[11px] font-black text-slate-600 group-hover:text-[#0f766e] transition-colors uppercase tracking-tight">
                    ¿El inmueble es Patrimonio Cultural de la Nación? 
                    <span className="block text-[9px] text-slate-400 font-bold italic normal-case">
                      (Verifique la condición del inmueble en el Ministerio de Cultura)
                    </span>
                  </span>
                </label>

                {/* SECCIÓN CONDICIONAL */}
                {isPatrimonioCultural && (
                  <div className="grid grid-cols-12 gap-4 pt-4 border-t border-[#0f766e]/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    
                    <div className="col-span-12 flex items-start gap-2 bg-white p-3 rounded-lg border border-[#0f766e]/20 shadow-sm">
                      <Checkbox 
                        checked={watch('declaracion.aut_ministerio_cultura')}
                        onCheckedChange={(val) => {
                          setValue("declaracion.aut_ministerio_cultura", val);
                          if (!val) {
                            setValue("declaracion.num_aut_ministerio_cultura", "");
                            setValue("declaracion.fecha_aut_ministerio_cultura", "");
                            setValue("declaracion.archivo_aut_ministerio_cultura", "");
                          }
                        }}
                        className="data-[state=checked]:bg-[#0f766e] data-[state=checked]:border-[#0f766e]"
                      />
                      <label htmlFor="monitoreo" className="text-[10px] leading-tight text-[#0f766e] font-black uppercase cursor-pointer">
                        El Ministerio de Cultura participó en la remodelación/monitoreo previo 
                        <span className="block text-[9px] text-slate-400 font-bold">(Exonerado de adjuntar copia conforme a Ley N° 28296)</span>
                      </label>
                    </div>

                    {!watch('declaracion.aut_ministerio_cultura') && (
                      <>
                        <div className="col-span-12 md:col-span-7">
                          <Label className={labelClasses}>N° de Autorización del Ministerio de Cultura</Label>
                          <input 
                            placeholder="Ej. AUT-2026-MC-001" 
                            className={inputClasses} 
                            {...register("declaracion.num_aut_ministerio_cultura")}
                          />
                        </div>
                        
                        <div className="col-span-12 md:col-span-5">
                          <Label className={labelClasses}>Fecha de Expeditación</Label>
                          <input 
                            type="date" 
                            className={`${inputClasses} uppercase`} 
                            {...register("declaracion.fecha_aut_ministerio_cultura")}
                          />
                        </div>

                        <div className="col-span-12">
                          <Label className={labelClasses}>Adjuntar Copia Simple (PDF/JPG)</Label>
                          
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png"
                          />

                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`mt-1 flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl transition-all cursor-pointer group
                              ${fileUploaded 
                                ? 'border-[#0f766e] bg-teal-50/50' 
                                : 'border-slate-300 bg-white hover:border-[#0f766e] hover:bg-teal-50/20'
                              }`}
                          >
                            {fileUploaded ? (
                              <div className="flex flex-col items-center p-4">
                                <div className="bg-[#0f766e] p-2 rounded-full mb-2">
                                  <Check size={18} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black text-[#0f766e] uppercase">Documento Seleccionado</span>
                                <span className="text-[9px] text-slate-500 font-bold truncate max-w-[250px] mt-1">
                                  {fileUploaded instanceof File ? fileUploaded.name : 'Archivo cargado'}
                                </span>
                                <button 
                                  type="button"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setValue("declaracion.archivo_aut_ministerio_cultura", null); 
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                  }}
                                  className="mt-2 text-[9px] text-red-500 font-black uppercase hover:text-red-700 transition-colors"
                                >
                                  [ Eliminar y cambiar ]
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 text-center">
                                <UploadCloud className="mx-auto h-8 w-8 text-slate-400 group-hover:text-[#0f766e] transition-colors" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-600 font-black uppercase">Haga clic para subir archivo</span>
                                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-1">PDF, JPG o PNG (Máx. 5MB)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

            </fieldset>
          </SeccionCard>
        
        </div>

        <div className="w-full">
          <SeccionCard title="" >
            {/* SECCIÓN: DATOS DEL EXPEDIENTE */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-end mb-8">
              {/* N.º Expediente */}
              <div className="md:col-span-5 flex flex-col gap-1.5">
                <label className={labelClasses}>
                  N.º de Expediente
                </label>
                <div className="flex gap-2">
                  <input 
                    autoComplete="off"
                    className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs 
                              focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-400" 
                    placeholder="Ingrese número..."
                    {...register("numero_expediente")}
                  />
                  <BuscarExpedienteDialog
                    fetchExpedientes={fetchExpedientes}
                    onPick={(exp) => setNumeroExpediente(exp.numero)}
                    trigger={
                      <button
                        type="button"
                        className={buttonClasses}
                      >
                        <Search className="mr-2 h-3.5 w-3.5" />
                        Buscar
                      </button>
                    }
                  />
                </div>
              </div>

              {/* Fecha Recepción */}
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className={labelClasses}>
                  Fecha de Recepción
                </label>
                <input 
                  type="date" 
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs 
                            focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 outline-none transition-all text-slate-700" 
                  {...register("licencia.fecha_recepcion")}
                />
              </div>

              {/* Estado */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className={labelClasses}>
                  Estado del Trámite
                </label>
                <div className="relative group">
                  <select 
                    className={`w-full h-9 rounded-lg border px-3 text-[10px] font-black outline-none transition-all appearance-none cursor-pointer tracking-tight
                      ${estado === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        estado === 'RECHAZADO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        estado === 'OBSERVADO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-white text-slate-700 border-slate-300 focus:border-[#0f766e]'}
                    `}
                    {...register("estado")}
                  >
                    <option value="EN_EVALUACION">🟡 EN EVALUACIÓN</option>
                    <option value="OBSERVADO">🟠 OBSERVADO</option>
                    <option value="APROBADO">🟢 APROBADO</option>
                    <option value="RECHAZADO">🔴 RECHAZADO</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* SUBTÍTULO SECCIONADOR 06 */}
            <div className="w-full mt-4 mb-6 py-2 border-b border-slate-300/60">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#0f766e] opacity-20"></span>
                <h2 className="text-lg font-black text-slate-700 tracking-tight uppercase">
                  Seguridad e inspección técnica
                </h2>
              </div>
            </div>

            {/* SECCIÓN: RIESGO E ITSE */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Nivel de Riesgo - Selección Visual */}
                <div className="md:col-span-7 flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#0f766e] rounded-full"></span>
                    Nivel de Riesgo
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'BAJO', label: 'Bajo', color: 'bg-emerald-500' },
                      { id: 'MEDIO', label: 'Medio', color: 'bg-amber-500' },
                      { id: 'ALTO', label: 'Alto', color: 'bg-orange-500' },
                      { id: 'MUY_ALTO', label: 'Muy Alto', color: 'bg-rose-500' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setValue("licencia.nivel_riesgo", r.id as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all gap-1
                          ${nivelRiesgo === r.id 
                            ? 'border-slate-800 bg-slate-800 text-white shadow-md scale-[1.02]' 
                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}
                        `}
                      >
                        <div className={`w-2 h-2 rounded-full ${r.color}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Indicador de Tipo de Inspección (Informativo) */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procedimiento ITSE</label>
                  <div className={`flex items-center gap-4 p-3 rounded-xl border-2 h-[58px] transition-all duration-500
                    ${itseRequierePrevia 
                      ? 'bg-rose-50 border-rose-100 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'}
                  `}>
                    {itseRequierePrevia ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase leading-none">
                        {itseRequierePrevia ? "Inspección Previa" : "Inspección Posterior"}
                      </span>
                      <span className="text-[9px] font-medium opacity-80 leading-tight">
                        {itseRequierePrevia 
                          ? "Requiere aprobación antes de la licencia." 
                          : "Licencia automática sujeta a verificación."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox de declaro bajo juramento */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 border-dashed">
                <label className="flex items-center gap-3 cursor-pointer group mb-4 ml-1">
                  <Switch 
                    checked={chk_bajoJuramento}
                    onCheckedChange={(val) => setValue("licencia.bajo_juramento", val)}
                    className="data-[state=checked]:bg-[#0f766e] data-[state=unchecked]:bg-slate-200"
                  />
                  <span className="text-[11px] font-black text-slate-600 group-hover:text-[#0f766e] transition-colors tracking-tight">
                    Declaro bajo juramento que el local cumple con las condiciones de seguridad vigente.
                    <span className="block text-[9px] text-slate-400 font-bold italic normal-case">
                      Obligatorio para procesar el trámite
                    </span>
                  </span>
                </label>
              </div>

              {/* SECCIÓN CONDICIONAL: Datos ITSE Previa */}
              {itseRequierePrevia && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                  
                  {/* Campo Nro ITSE */}
                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">N.º ITSE Vigente</label>
                    <input 
                      className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold focus:border-[#0f766e] outline-none transition-all placeholder:text-slate-300 uppercase" 
                      placeholder="Ej: CERT-2026-001"
                      {...register("licencia.numero_itse")}
                    />
                  </div>

                  {/* Dropzone Estilizado para ITSE */}
                  <div className="md:col-span-8 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Certificado ITSE (PDF)</label>
                    
                    {/* Input Oculto */}
                    <input 
                      type="file" 
                      ref={itseInputRef} 
                      onChange={handleItseFileChange} 
                      className="hidden" 
                      accept=".pdf"
                    />

                    <div 
                      onClick={() => itseInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl transition-all cursor-pointer group
                        ${itseArchivo 
                          ? 'border-[#0f766e] bg-teal-50/50' 
                          : 'border-slate-300 bg-white hover:border-[#0f766e] hover:bg-teal-50/20'
                        }`}
                    >
                      {itseArchivo ? (
                        <div className="flex items-center gap-3 px-4 w-full">
                          <div className="bg-[#0f766e] p-2 rounded-lg shrink-0">
                            <Check size={16} className="text-white" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[10px] font-black text-[#0f766e] uppercase">Certificado Cargado</span>
                            <span className="text-[9px] text-slate-500 font-bold truncate">
                              {itseArchivo instanceof File ? itseArchivo.name : 'Archivo_itse.pdf'}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setValue("licencia.doc_itse", null); 
                              if (itseInputRef.current) itseInputRef.current.value = "";
                            }} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-[#0f766e] transition-colors" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-600 font-black uppercase">Cargar certificado ITSE</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Solo formato PDF (Máx. 5MB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-12">
                    <p className="text-[9px] text-amber-600 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                      <AlertCircle size={12} />
                      PARA RIESGOS ALTOS/MUY ALTOS, EL CERTIFICADO ITSE DEBE ESTAR VIGENTE Y CARGADO OBLIGATORIAMENTE.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBTÍTULO SECCIONADOR  */}
              <div className="w-full mt-4 mb-6 py-2 border-b border-slate-300/60">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0f766e] opacity-20">02-03</span>
                  <h2 className="text-lg font-black text-slate-700 tracking-tight uppercase">
                    Solicitante, Representante
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* 1. LADO IZQUIERDO: SOLICITANTE */}
                <div className="relative" ref={solicitanteRef}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className={labelClasses}>
                      Solicitante
                    </label>
                    <button 
                      type="button"
                      onClick={() => { setEditingPersona(null); setOpenPersona(true); }}
                      className="text-[9px] text-blue-600 hover:text-blue-700 font-black"
                    >
                      [+ NUEVO]
                    </button>

                    <PersonaModal 
                      open={openPersona}
                      onOpenChange={setOpenPersona}
                      editingPersona={editingPersona}
                      onSuccess={(personaCreada) => {
                        console.log(personaCreada);
                        // Seteamos los valores en Hook Form
                        setValue("id_persona", personaCreada.id_persona);
                        setValue("nombre_razon_social", personaCreada.nombre_razon_social);
                        setValue("tipo_persona", personaCreada.tipo_persona);
                        setValue("licencia.tiene_apoderado", false);

                        // 2. ACTUALIZAMOS EL ESTADO LOCAL DEL INPUT (para la UI)
                        // Este es el paso que te falta para que el texto aparezca en pantalla
                        setValorInput(personaCreada.nombre_razon_social);

                        // 3. Cerramos sugerencias por si estaban abiertas
                        setShowSuggestionsSolicitante(false);

                        // 4. (Opcional) Si quieres que se carguen los representantes de esta nueva persona:
                        obtenerRepresentantes(personaCreada.id_persona);

                      }}
                    />
                  </div>
                  
                  <div className="relative">
                    <BuscadorSolicitante 
                      setValue={setValue}
                      getValues={getValues}
                      setShowSuggestions={setShowSuggestionsSolicitante}
                      onSearch={(termino: string) => setDq(termino)}
                      defaultValue={valorInput} // valorInput se actualiza en handleSelectPersona
                    />

                    {/* Tu Lista Desplegable Solicitante sugerenciasFiltradasSolicitante */}
                    {showSuggestionsSolicitante && !watch("id_persona") && (
                      <div className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="max-h-52 overflow-y-auto bg-white">
                          
                          {/* 2. Estado: CARGANDO (Feedback inmediato al hacer click o escribir) */}
                          {cargandoSolicitantes && (
                            <div className="flex items-center justify-center py-4 bg-slate-50/50">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-[10px] text-slate-500 font-medium">Buscando en registros...</span>
                            </div>
                          )}

                          {/* 3. Feedback de cantidad (Solo si ya terminó de cargar y hay resultados) */}
                          {!cargandoSolicitantes && totalSolicitantesRegistrados > 0 && (
                            <div className="px-4 py-1 bg-slate-100 text-[8px] text-slate-400 font-bold uppercase sticky top-0 z-10">
                              Se encontraron {totalSolicitantesRegistrados} resultados
                            </div>
                          )}

                          {/* 4. Lista de Resultados */}
                          {!cargandoSolicitantes && solicitantesParaSeleccion.map((persona) => (
                            <div 
                              key={persona.id_persona}
                              onClick={() => {
                                handleSelectPersona(persona);
                                setShowSuggestionsSolicitante(false);
                              }}
                              className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center group border-b border-slate-50 last:border-none"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 uppercase">
                                  {persona.nombre_razon_social}
                                </div>
                                <div className="text-[9px] text-slate-500 font-medium">{persona.ruc}</div>
                              </div>
                              <i className="fi fi-rr-angle-small-right text-slate-300 group-hover:text-blue-400"></i>
                            </div>
                          ))}

                          {/* 5. Estado: SIN RESULTADOS (Solo si terminó de cargar y el array está vacío) */}
                          {!cargandoSolicitantes && solicitantesParaSeleccion.length === 0 && !errorCargaSolicitantes && (
                            <div className="px-4 py-6 text-center">
                              <p className="text-[10px] text-slate-400 font-medium">No se encontraron coincidencias</p>
                            </div>
                          )}

                          {/* 6. Feedback de Error */}
                          {errorCargaSolicitantes && (
                            <div className="px-4 py-3 bg-red-50 text-[9px] text-red-500 border-t border-red-100">
                              {errorCargaSolicitantes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CHECKBOX DE APODERADO (Solo para Personas Naturales) */}
                  {watch("id_persona") && watch("tipo_persona") === 'NATURAL' && (
                    <div className="mt-2 ml-1 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-1">
                      <Switch 
                        id="chkApoderado"
                        checked={watch("licencia.tiene_apoderado")}
                        onCheckedChange={(val) => {
                          setValue("licencia.tiene_apoderado", val);
                        }}
                        className="data-[state=checked]:bg-[#0f766e] data-[state=unchecked]:bg-slate-200"
                      />
                      <label htmlFor="chkApoderado" className="text-[9px] font-black text-slate-500 uppercase cursor-pointer select-none">
                        ¿Actúa mediante un apoderado?
                      </label>
                    </div>
                  )}
                </div>

                {/* 2. LADO DERECHO: REPRESENTANTE */}
                <div 
                  className={`relative transition-all duration-500 ${
                    !(getValues("tipo_persona") === 'JURIDICA' || getValues("licencia.tiene_apoderado"))
                      ? 'opacity-30 grayscale pointer-events-none scale-[0.98]' 
                      : 'opacity-100 scale-100'
                  }`} 
                  ref={representanteRef}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-tight ml-0.5 text-slate-500`}>
                      {getValues("tipo_persona") === 'JURIDICA' ? 'Representante Legal' : 'Apoderado'}
                    </label>
                    
                    {(getValues("tipo_persona") === 'JURIDICA' || getValues("licencia.tiene_apoderado")) && (
                      <button 
                        type="button"
                        onClick={() => setOpenRep(true)}                       
                        className="text-[9px] text-blue-600 hover:text-blue-700 font-black"
                      >
                        [+ NUEVO]
                      </button> 
                    )}

                    <RepresentanteModal 
                      open={openRep}
                      onOpenChange={setOpenRep}
                      editingRep={null}
                      juridicas={[]}
                      solicitanteDirecto={{
                        id_persona: Number(getValues("id_persona")),
                        nombre_razon_social: getValues("nombre_razon_social"),
                        tipo_persona: getValues("tipo_persona")
                      }}
                      onSuccess={(repCreado) => {
                        console.log("Datos recibidos del modal:", repCreado);

                        setValue("licencia.nombre_representante", repCreado.nombres);
                        setValue("licencia.id_representante", repCreado.id_representante);
                        obtenerRepresentantes(Number(getValues("id_persona")));
                      }}
                    />                   

                  </div>

                  <div className="relative">
                    <input
                      autoComplete="off"
                      disabled={!(getValues("tipo_persona") === 'JURIDICA' || getValues("licencia.tiene_apoderado"))}
                      className={`${inputClasses} ${
                        !(getValues("tipo_persona") === 'JURIDICA' || getValues("licencia.tiene_apoderado")) 
                          ? 'bg-slate-50 border-transparent shadow-none cursor-not-allowed' 
                          : 'bg-white'
                      }`}
                      placeholder={
                        getValues("tipo_persona") === 'JURIDICA' 
                          ? "Buscar representante legal..." 
                          : "Buscar apoderado..."
                      }
                      {...register("licencia.nombre_representante")}
                      value={nombreRepresentante || ""}
                      onFocus={() => setShowSuggestionsRepresentante(true)}
                      onChange={(e) => {
                        setValue("licencia.nombre_representante", e.target.value);
                        if (watch("licencia.id_representante")) setValue("licencia.id_representante", "");
                        setShowSuggestionsRepresentante(true);
                      }}
                    />

                    {/* Lista de Sugerencias Representante */}
                    {showSuggestionsRepresentante && (
                      <div className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="max-h-52 overflow-y-auto bg-white">
                          
                          {/* 1. Feedback de carga (opcional, por si la API aún responde) */}
                          {cargandoRepresentantes && (
                            <div className="px-4 py-3 text-center text-[10px] text-slate-400 font-bold uppercase animate-pulse">
                              Buscando representantes...
                            </div>
                          )}

                          {/* 2. Listado directo desde el array cargado */}
                          {!cargandoRepresentantes && representantesParaSeleccion.length > 0 ? (
                            representantesParaSeleccion.map((rep) => (
                              <div
                                key={rep.id_representante}
                                onClick={() => {
                                  handleSelectRepresentante(rep);
                                  setShowSuggestionsRepresentante(false);
                                }}
                                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center group border-b border-slate-50 last:border-none"
                              >
                                <div>
                                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase">
                                    {rep.nombres}
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-medium">
                                    Doc: <span className="text-blue-600">{rep.numero_documento}</span>
                                  </div>
                                </div>
                                <span className="text-[8px] font-black text-blue-500 opacity-0 group-hover:opacity-100 uppercase tracking-tighter">
                                  Seleccionar
                                </span>
                              </div>
                            ))
                          ) : (
                            /* 3. Mensaje si no hay nada cargado aún */
                            !cargandoRepresentantes && (
                              <div className="px-4 py-6 text-center animate-in fade-in duration-300">
                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                                  Sin registros vinculados
                                </div>
                                <p className="text-[10px] text-slate-500 italic leading-tight">
                                  No se encontraron representantes. <br />
                                  Use el botón <span className="text-blue-600 font-bold"> [+ NUEVO] </span> para registrar uno.
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mensaje de estado cuando está bloqueado */}
                  {/*!mostrarRepresentante && idSolicitante &&*/ (
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md w-fit">
                      <div className="w-1 h-1 bg-slate-400 rounded-full" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">
                        Tramite Personal / Sin Apoderado
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full mt-4 mb-6 py-2 border-b border-slate-300/60">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#0f766e] opacity-20">05</span>
                  <h2 className="text-lg font-black text-slate-700 tracking-tight uppercase">
                    Declaración jurada
                  </h2>
                </div>
              </div>

              {/* 1. Bloque de Compromisos Legales */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'vigencia_poder',
                    text: "Cuento con poder suficiente vigente para actuar como representante legal de la persona jurídica o natural.",
                    sub: "(Si aplica)",
                  },
                  {
                    id: 'condiciones_seguridad',
                    text: "El establecimiento cumple con las condiciones de seguridad en edificaciones y me someto a la inspección ITSE correspondiente.",
                    sub: "Obligatorio",
                  },
                  {
                    id: 'titulo_profesional',
                    text: "Cuento con título y habilitación vigente para servicios de salud.",
                    sub: "(Si corresponde)",
                  }
                ].map((item) => {
                  const fieldName = `declaracion.${item.id}`;
                  const isActive = watch(fieldName as any);
                  return (
                    <label 
                      key={item.id} 
                      className={`flex flex-col gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm
                        ${isActive ? 'border-[#0f766e] bg-[#0f766e]/5' : 'border-slate-200 bg-white hover:border-slate-300'}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <Switch 
                          checked={isActive} 
                          onCheckedChange={(val: boolean) => setValue(fieldName as any, val)}
                          className="data-[state=checked]:bg-[#0f766e] data-[state=unchecked]:bg-slate-200"
                        />
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter
                          ${isActive ? 'bg-[#0f766e] text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {isActive ? 'Aceptado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug font-bold text-slate-700">
                        {item.text} <br/>
                        <span className="text-[9px] text-slate-400 font-medium italic">{item.sub}</span>
                      </p>
                    </label>
                  );
                })}
              </div>

              {/* AVISO DE FISCALIZACIÓN POSTERIOR */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 border-dashed">
                <label className="flex items-center gap-3 cursor-pointer group mb-4 ml-1">
                  <Switch 
                    checked={chk_aceptacion}
                    onCheckedChange={(val) => setValue("declaracion.aceptacion", val)}
                    className="data-[state=checked]:bg-[#0f766e] data-[state=unchecked]:bg-slate-200"
                  />
                  <span className="text-[11px] font-black text-slate-600 group-hover:text-[#0f766e] transition-colors tracking-tight">
                    Aviso de Fiscalización posterior
                    <span className="block text-[9px] text-slate-400 font-bold italic normal-case">
                      De comprobarse falsedad o inexactitud en esta declaración, se aplicarán las sanciones administrativas y penales correspondientes (Ley N° 27444)
                    </span>
                  </span>
                </label>
              </div>

              {/* 3. Observaciones */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClasses}>
                  Observaciones o comentarios adicionales
                </label>
                <textarea 
                  rows={2} 
                  autoComplete="off"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50/50 p-3 text-xs focus:bg-white focus:border-[#0f766e] outline-none transition-all resize-none"
                  placeholder="Opcional: Detalles relevantes para la evaluación..." 
                  {...register("declaracion.observaciones")}
                />
              </div>

              <div className="space-y-4 border p-4 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Información de Pagos
                  </h3>
                </div>

                {fieldsPagos.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative">
                    
                    {/* Nro de Recibo */}
                    <div className="col-span-12 md:col-span-4">
                      <Label className={labelClasses}>Nro. Recibo / Operación</Label>
                      <input 
                        {...register(`pagos.${index}.nro_recibo`)} 
                        className={inputClasses} 
                        placeholder="000-XXXXX" 
                        autoComplete="off"
                      />
                    </div>

                    {/* Fecha de Pago */}
                    <div className="col-span-12 md:col-span-4">
                      <Label className={labelClasses}>Fecha de Pago</Label>
                      <input 
                        type="date"
                        {...register(`pagos.${index}.fecha_pago`)} 
                        className={inputClasses} 
                      />
                    </div>

                    {/* Monto e Icono de Quitar */}
                    <div className="col-span-12 md:col-span-4 flex items-center gap-2">
                      <div className="flex-1">
                        <Label className={labelClasses}>Monto (S/.)</Label>
                        <input 
                          type="number"
                          step="0.01"
                          {...register(`pagos.${index}.monto`, { valueAsNumber: true })} 
                          className={inputClasses} 
                          placeholder="0.00"
                        />
                      </div>
                      
                      {/* Botón Quitar: Solo si hay más de un elemento o según tu preferencia */}
                      <button
                        type="button"
                        onClick={() => removePago(index)}
                        className="mb-0.5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Quitar pago"
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botón Agregar Pago */}
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => appendPago({ concepto: "DERECHO DE TRÁMITE", nro_recibo: "", fecha_pago: "", monto: 0 })}
                    className="flex items-center gap-1.5 text-[10px] font-black text-[#0f766e] hover:text-teal-800 transition-colors uppercase tracking-tight"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Agregar pago
                  </button>
                </div>
              </div>









            </div>
          </SeccionCard>
        </div>
      </div>
    </div>

    {/* BOTONES */}
    <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-end gap-4 w-full">
      {/* Botón Cancelar - Más ancho y estilizado */}
      <button 
        type="button"
        className="w-full md:w-auto md:min-w-[160px] flex items-center justify-center gap-3 px-8 h-12 bg-white border border-slate-300 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
      >
        <ChevronLeft size={18} className="text-slate-400" /> 
        <span>Cancelar</span>
      </button>
      
      {/* Botón Guardar - Significativamente más ancho */}
      <button 
        type="submit"
        className={buttonPrimary}
      >
        <Save size={18} /> 
        <span>Guardar Registro</span>
      </button>
    </div>
  </form>  
  </>
  );
}