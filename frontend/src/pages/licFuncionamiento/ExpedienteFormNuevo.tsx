import React, { useEffect, useMemo, useState, useRef, memo } from "react";
import { useForm } from "react-hook-form";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from "react-router-dom";
import { expedientesApi } from "../../services/expedientes";
import { ChevronLeft, ChevronDown, Upload, Building2, AlertTriangle, ShieldCheck, Plus, 
  MapPin, LocateFixed, X, Loader2, 
  AlertCircle, Copy, FileText, Save, Search, UploadCloud, Check } from "lucide-react";
import type { NuevaDJTransaccionalRequest } from "@/types/declaracionJurada";

import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Checkbox } from "../../types/components/ui/checkbox";
import { Switch } from "../../types/components/ui/switch";

import { PersonaModal } from '../persona/PersonaModal';
import type { Personas } from "@/types/persona";
import { RepresentanteModal } from "../persona/RepresentanteModal";

import BuscarExpedienteDialog, { Expediente } from "../../components/BuscarExpedientesDialog";
import { personasApi } from "../../services/personas";
import { useDebounce } from "../../hooks/useDebounce";
import { SeccionCard } from './SeccionCard';

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
  // ESTILOS GENERALES
  const labelClasses = "text-[10px] font-black text-slate-800 uppercase tracking-tight mb-1.5 block ml-0.5";
  const inputClasses = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal";
  const inputStyle = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-400";

  // ESTADOS
  const [esPatrimonio, setEsPatrimonio] = useState(false);
  const [tieneMonitoreo, setTieneMonitoreo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [numeroExpediente, setNumeroExpediente] = React.useState("");
  //const [modo, setModo] = React.useState<"NUEVA" | "MODIFICACION">("NUEVA");

  // II Datos del solicitante
  const [tipoPersona, setTipoPersona] = React.useState<"NATURAL" | "JURIDICA">("NATURAL");
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
  const itseRequierePrevia = React.useMemo(() => ["ALTO", "MUY_ALTO"].includes(nivel), [nivel]);
  const [itseNumero, setItseNumero] = React.useState("");
  const [itseArchivo, setItseArchivo] = React.useState("");

  // Anexos (simulados)
  const [anexoNombre, setAnexoNombre] = React.useState("");
  const [anexos, setAnexos] = React.useState<string[]>([]);

  // DJ generales
  const [fechaRecepcion, setFechaRecepcion] = React.useState(new Date().toISOString().slice(0, 10));
  const [estado, setEstado] = React.useState("EN_EVALUACION");

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
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
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
  const suggestionsRef = React.useRef(null);
  const [error, setError] = React.useState<string>("");

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      tipo_licencia: 'NUEVA',
      modalidad: 'INDETERMINADA',
      fechaIni: '',
      fechaFin: '',
      tipoAnuncio: '',
      licenciaPrincipal: '',
      anuncio: false, 
      cesionario: false,
      mercado: false
    }
  });

  const modalidad = watch("modalidad");
  const modo = watch("tipo_licencia");

  const isModBasica =
    modo === "MODIFICACION" &&
    ["CAMBIO_DENOMINACION", "TRANSFERENCIA", "CESE"].includes(accion);   

  const alEnviar = (data) => {
    console.log("Datos limpios recolectados:", data);
    // Aquí data ya trae: { modalidad: "TEMPORAL", fechaIni: "2024-01-01", ... }
  };

  // Base de datos de ejemplo
  const [dbPersonas] = React.useState([
    { id: 1, nombre: 'CORPORACIÓN ALPHA S.A.C.', ruc: '20123456789', correo: 'contacto@alpha.com', tel: '987654321' },
    { id: 2, nombre: 'INVERSIONES TECH PERU S.A.', ruc: '20987654321', correo: 'admin@techperu.pe', tel: '912345678' },
    { id: 3, nombre: 'JUAN ALBERTO PEREZ COTRINA', ruc: '10456789123', correo: 'jperez@gmail.com', tel: '945566778' },
    { id: 4, nombre: 'MUNICIPALIDAD DE LIMA', ruc: '20131370998', correo: 'info@munlima.gob.pe', tel: '014110000' },
  ]);

  const sugerenciasFiltradas = dbPersonas.filter(p => {
    const query = nombreRazon.toLowerCase();
    return p.nombre.toLowerCase().includes(query) || p.ruc.includes(query);
  });

  const juridicas = useMemo(
    () => rows.filter((p) => p.tipo_persona === "JURIDICA"),
    [rows]
  );

  const handleSelectPersona = (persona) => {
    setNombreRazon(persona.nombre);
    setRuc(persona.ruc);
    setCorreo(persona.correo || "");
    setTelefono(persona.tel || "");
    setShowSuggestions(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data, total } = await personasApi.list(dq, page, limit);
        if (!cancelled) {
          setRows(data);
          setTotal(total);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error al cargar personas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

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
  }, [djFirmanteTipo, nombreRazon, docTipo, docNumero, repNombre, repDocTipo, repDocNumero, tipoPersona, dq, page, limit]);

  return (  
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
                {...register("tipo_licencia")}
                
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
                {...register("tipo_licencia")}
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
                        { id: 'INDETERMINADA', label: 'Indeterminada' },
                        { id: 'TEMPORAL', label: 'Temporal' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setValue('modalidad', m.id);
                            if (m.id === 'INDETERMINADA') {
                              setValue('fechaIni', '');
                              setValue('fechaFin', '');
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
                          <label className="text-[9px] font-black text-slate-700 uppercase ml-1">Desde</label>
                          <input 
                            type="date" 
                            className={inputClasses}
                            {...register("fechaIni")}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-slate-700 uppercase ml-1">Hasta</label>
                          <input 
                            type="date" 
                            className={inputClasses}
                            {...register("fechaFin")}
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
                        const isActive = watch(op.id as any);
                        return (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => {
                              const nextValue = !isActive;
                              setValue(op.id as any, !isActive);

                              if (!nextValue) {
                                if (op.id === 'anuncio') setValue('tipoAnuncio', '');
                                if (op.id === 'cesionario') setValue('licenciaPrincipal', '');
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
                      {watch("anuncio") && (
                        <div className="animate-in slide-in-from-right-2 duration-200 flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-slate-700 uppercase ml-1">Descripción del Anuncio</label>
                          <input 
                            className={inputClasses}
                            placeholder="Ej: Letrero luminoso" 
                            {...register("tipoAnuncio")}
                          />
                        </div>
                      )}
                      {watch("cesionario") && (
                        <div className="animate-in slide-in-from-right-2 duration-200 flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-slate-700 uppercase ml-1">Referencia Principal</label>
                          <input 
                            className={inputClasses}
                            placeholder="Nº Licencia Titular Principal" 
                            {...register("licenciaPrincipal")}
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                    Tipo de Acción Solicitada
                  </label>
                  <div className="relative group">
                    <select 
                      className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-black focus:border-[#0f766e] outline-none transition-all appearance-none cursor-pointer tracking-tight"
                      value={accion} 
                      onChange={(e) => setAccion(e.target.value)}
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

                {accion && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-1 duration-200">
                    {(["CAMBIO_DENOMINACION","TRANSFERENCIA","CESE"].includes(accion)) && (
                      <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                        <label className="text-[9px] font-bold text-amber-700 uppercase ml-1">N.º Licencia de Origen</label>
                        <input 
                          className="mt-1 w-full h-9 rounded-md border border-amber-200 bg-white px-3 text-xs font-bold text-amber-900 focus:border-amber-500 outline-none transition-all" 
                          placeholder="Ej. LIC-2020-XXXX" 
                          value={nroLicenciaOrigen} 
                          onChange={(e) => setnroLicenciaOrigen(e.target.value)} 
                        />
                      </div>
                    )}
                    {accion === "CAMBIO_DENOMINACION" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nueva denominación</label>
                        <input 
                          className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-[#0f766e] outline-none transition-all" 
                          placeholder="Ingrese nuevo nombre..."
                          value={nuevaDenominacion} 
                          onChange={(e) => setnuevaDenominacion(e.target.value)} 
                        />
                      </div>
                    )}
                    {accion === "OTROS" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Detalle del cambio</label>
                        <textarea 
                          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs focus:border-[#0f766e] outline-none transition-all resize-none" 
                          rows={3} 
                          value={detalleOtros} 
                          onChange={(e) => setdetalleOtros(e.target.value)} 
                        />
                      </div>
                    )}
                  </div>
                )}

                {!accion && modo === 'MODIFICACION' && (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <FileText size={32} className="text-slate-200 mb-2" />
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">Seleccione una acción para continuar</p>
                  </div>
                )}
              </fieldset>
            </SeccionCard>
          </div>

          <SeccionCard title="">
            <div className="w-full mt-4 mb-6 py-2 border-b border-slate-300/60">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#0f766e] opacity-20">04</span>
                <h2 className="text-lg font-black text-slate-700 tracking-tight uppercase">
                  Datos del Establecimiento
                </h2>
              </div>
            </div>

            <fieldset disabled={isModBasica} className={`space-y-4 ${isModBasica ? 'opacity-50' : ''}`}>

              {/* 1. Identificación y Actividad */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-end">
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Nombre Comercial</label>
                  <input
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-[#0f766e] outline-none transition-all font-bold"
                    placeholder="Ej. Restaurante Sazón Peruana"
                    value={estNombreComercial}
                    onChange={(e) => setEstNombreComercial(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Código CIIU</label>
                  <input
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-[#0f766e] outline-none transition-all text-center font-mono"
                    placeholder="5610"
                    value={estCiiu}
                    onChange={(e) => setEstCiiu(e.target.value)}
                  />
                </div>

                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Giro(s) del Negocio*</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-[#0f766e] outline-none"
                      placeholder="Ej. Venta de abarrotes..."
                      value={estGiroInput}
                      onChange={(e) => setEstGiroInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="h-9 px-4 bg-[#0f766e] text-white rounded-lg font-bold text-[10px] uppercase tracking-tighter hover:bg-[#0a5a54] transition-all flex items-center gap-2 shadow-sm shadow-[#0f766e]/20"
                      onClick={() => {
                        const v = estGiroInput.trim();
                        if (v) { setEstGiros((prev) => [...prev, v]); setEstGiroInput(""); }
                      }}
                    >
                      <Plus size={14} /> Agregar
                    </button>
                  </div>
                </div>

                {/* Chips de giros */}
                {estGiros.length > 0 && (
                  <div className="md:col-span-12 flex flex-wrap gap-2 pt-1">
                    {estGiros.map((g, i) => (
                      <span key={i} className="inline-flex items-center gap-2 bg-[#0f766e]/5 text-[#0f766e] border border-[#0f766e]/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase animate-in zoom-in-95">
                        {g}
                        <button type="button" onClick={() => setEstGiros(estGiros.filter((_, idx) => idx !== i))} className="hover:text-rose-600 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
                <div className="md:col-span-10 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Actividad Específica</label>
                  <input
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#0f766e] transition-all"
                    placeholder="Detalle la actividad principal..."
                    value={estActividad}
                    onChange={(e) => setEstActividad(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Zonificación</label>
                  <input
                    readOnly
                    className="w-full h-9 rounded-lg border border-[#0f766e]/30 bg-teal-50/50 px-3 text-xs outline-none font-black text-[#0f766e] transition-all"
                    placeholder="Detectando..."
                    value={estZonificacion}
                  />
                </div>
              </div>

              {/* MAPA */}
              

              {/* 2. Ubicación Física */}
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-widest mb-3 block ml-1">Ubicación del Establecimiento</span>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 flex gap-2">
                    <select className="w-20 h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] font-bold outline-none" value={estViaTipo} onChange={(e) => setEstViaTipo(e.target.value)}>
                      <option>Av.</option><option>Jr.</option><option>Ca.</option><option>Pje.</option>
                    </select>
                    <input className="flex-1 h-9 rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#0f766e]" 
                    placeholder="Nombre de vía"  />
                  </div>
                  
                  <div className="md:col-span-7 grid grid-cols-5 gap-2">
                    <input className="h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-center outline-none" placeholder="N°" />
                    <input className="h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-center outline-none" placeholder="Int." value={estInterior} onChange={(e) => setEstInterior(e.target.value)} />
                    <input className="h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-center outline-none" placeholder="Mz" value={estMz} onChange={(e) => setEstMz(e.target.value)} />
                    <input className="h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-center outline-none" placeholder="Lt" value={estLt} onChange={(e) => setEstLt(e.target.value)} />
                    <input className="h-9 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-center outline-none" placeholder="Otros" value={estOtrosDir} onChange={(e) => setEstOtrosDir(e.target.value)} />
                  </div>

                  <div className="md:col-span-6">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Urb. / AA.HH. / Sector</label>
                    <input className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#0f766e]"   />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Provincia / Distrito</label>
                    <input className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#0f766e]"  />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Área Total (m²)</label>
                    <div className="relative">
                      <input type="number" className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 pr-8 text-xs font-bold text-[#0f766e] outline-none" value={estAreaTotal} onChange={(e) => setEstAreaTotal(e.target.value)} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">m²</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Autorización Sectorial */}
              <div className={`pt-2 px-1 rounded-xl transition-all duration-300 ${estTieneAutSectorial ? 'bg-teal-50/30 p-4 border border-[#0f766e]/10' : ''}`}>
                <label className="flex items-center gap-3 cursor-pointer group mb-4 ml-1">
                  <Switch 
                    checked={estTieneAutSectorial} 
                    onCheckedChange={setEstTieneAutSectorial}
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
                {estTieneAutSectorial && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-[#0f766e]/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-700 uppercase mb-1.5 block ml-1">Entidad</label>
                      <input 
                        className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 uppercase" 
                        placeholder="EJ. MINSA, MTC" 
                        value={estAutEntidad} 
                        onChange={(e) => setEstAutEntidad(e.target.value)} 
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[10px] font-black text-slate-700 uppercase mb-1.5 block ml-1">Denominación del Permiso</label>
                      <input 
                        className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 uppercase" 
                        placeholder="NOMBRE DEL DOCUMENTO..." 
                        value={estAutDenominacion} 
                        onChange={(e) => setEstAutDenominacion(e.target.value)} 
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-700 uppercase mb-1.5 block ml-1">Fecha Emisión</label>
                      <input 
                        type="date" 
                        className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all uppercase" 
                        value={estAutFecha} 
                        onChange={(e) => setEstAutFecha(e.target.value)} 
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-700 uppercase mb-1.5 block ml-1">N° Resolución / Código</label>
                      <input 
                        className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all uppercase" 
                        placeholder="EJ. 123-2024/MINSA"
                        value={estAutNumero} 
                        onChange={(e) => setEstAutNumero(e.target.value)} 
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
              <div className={`pt-2 px-1 rounded-xl transition-all duration-300 ${esPatrimonio ? 'bg-teal-50/30 p-4 border border-[#0f766e]/10' : ''}`}>
                <label className="flex items-center gap-3 cursor-pointer group mb-4 ml-1">
                  <Switch 
                    checked={esPatrimonio} 
                    onCheckedChange={setEsPatrimonio}
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
                {esPatrimonio && (
                  <div className="grid grid-cols-12 gap-4 pt-4 border-t border-[#0f766e]/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    
                    <div className="col-span-12 flex items-start gap-2 bg-white p-3 rounded-lg border border-[#0f766e]/20 shadow-sm">
                      <Checkbox 
                        id="monitoreo" 
                        checked={tieneMonitoreo}
                        onCheckedChange={(v) => setTieneMonitoreo(!!v)}
                        className="data-[state=checked]:bg-[#0f766e] data-[state=checked]:border-[#0f766e]"
                      />
                      <label htmlFor="monitoreo" className="text-[10px] leading-tight text-[#0f766e] font-black uppercase cursor-pointer">
                        El Ministerio de Cultura participó en la remodelación/monitoreo previo 
                        <span className="block text-[9px] text-slate-400 font-bold">(Exonerado de adjuntar copia conforme a Ley N° 28296)</span>
                      </label>
                    </div>

                    {!tieneMonitoreo && (
                      <>
                        <div className="col-span-12 md:col-span-7">
                          <Label className={labelClasses}>N° de Autorización del Ministerio de Cultura</Label>
                          <Input 
                            name="num_autorizacion_mc" 
                            placeholder="Ej. AUT-2026-MC-001" 
                            className={inputClasses} 
                          />
                        </div>
                        
                        <div className="col-span-12 md:col-span-5">
                          <Label className={labelClasses}>Fecha de Expeditación</Label>
                          <Input 
                            type="date" 
                            name="fecha_autorizacion_mc" 
                            className={`${inputClasses} uppercase`} 
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
                              ${fileName 
                                ? 'border-[#0f766e] bg-teal-50/50' 
                                : 'border-slate-300 bg-white hover:border-[#0f766e] hover:bg-teal-50/20'
                              }`}
                          >
                            {fileName ? (
                              <div className="flex flex-col items-center p-4">
                                <div className="bg-[#0f766e] p-2 rounded-full mb-2">
                                  <Check size={18} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black text-[#0f766e] uppercase">Documento Seleccionado</span>
                                <span className="text-[9px] text-slate-500 font-bold truncate max-w-[250px] mt-1">{fileName}</span>
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setFileName(null); }} 
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
          <SeccionCard >
            {/* SECCIÓN: DATOS DEL EXPEDIENTE */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-end mb-8">
              {/* N.º Expediente */}
              <div className="md:col-span-5 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                  N.º de Expediente
                </label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs 
                              focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-400" 
                    placeholder="Ingrese número..."
                    value={numeroExpediente} 
                    onChange={(e) => setNumeroExpediente(e.target.value)} 
                  />
                  <BuscarExpedienteDialog
                    fetchExpedientes={fetchExpedientes}
                    onPick={(exp) => setNumeroExpediente(exp.numero)}
                    trigger={
                      <button
                        type="button"
                        className="h-9 px-4 inline-flex items-center whitespace-nowrap rounded-lg
                                  bg-[#0f766e] text-white font-bold text-[10px] uppercase tracking-tighter
                                  hover:bg-[#0a5a54] transition-all focus:outline-none shadow-sm shadow-[#0f766e]/20 active:scale-95"
                      >
                        <Search className="mr-2 h-3.5 w-3.5" />
                        Buscar Expediente
                      </button>
                    }
                  />
                </div>
              </div>

              {/* Fecha Recepción */}
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                  Fecha de Recepción
                </label>
                <input 
                  type="date" 
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs 
                            focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 outline-none transition-all text-slate-700" 
                  value={fechaRecepcion} 
                  onChange={(e) => setFechaRecepcion(e.target.value)} 
                />
              </div>

              {/* Estado */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">
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
                    value={estado} 
                    onChange={(e) => setEstado(e.target.value)}
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
                        onClick={() => setNivel(r.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all gap-1
                          ${nivel === r.id 
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

              {/* Checkbox de compromiso */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 border-dashed">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e] transition-all"
                    checked={condSeguridad} 
                    onChange={(e) => setCondSeguridad(e.target.checked)} 
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#0f766e] transition-colors">
                      Declaro bajo juramento que el local cumple con las condiciones de seguridad vigentes.
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-medium">Obligatorio para procesar el trámite</span>
                  </div>
                </label>
              </div>

              {/* SECCIÓN CONDICIONAL: Datos ITSE Previa */}
              {itseRequierePrevia && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                  <div className="md:col-span-5 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">N.º ITSE Vigente</label>
                    <input 
                      className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold focus:border-rose-500 outline-none transition-all" 
                      placeholder="Ej: CERT-2026-001"
                      value={itseNumero} 
                      onChange={(e) => setItseNumero(e.target.value)} 
                    />
                  </div>
                  
                  <div className="md:col-span-7 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Documento Sustentatorio (PDF)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          className="w-full h-9 rounded-lg border border-slate-200 bg-slate-100 px-3 text-[10px] outline-none text-slate-500 font-medium italic" 
                          value={itseArchivo || "No se ha cargado archivo..."} 
                          readOnly 
                        />
                      </div>
                      <button className="h-9 px-4 bg-slate-800 text-white rounded-lg font-black text-[10px] uppercase hover:bg-rose-600 transition-all flex items-center gap-2 active:scale-95 shadow-sm">
                        <Upload size={14} /> Cargar
                      </button>
                    </div>
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
                <div className="relative" ref={suggestionsRef}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-0.5">
                      Solicitante
                    </label>
                    <button 
                      type="button"
                      onClick={() => { setEditingPersona(null); setOpenPersona(true); }}
                      className="text-[9px] text-blue-600 hover:text-blue-700 font-black"
                    >
                      [+ NUEVO]
                    </button>

                    {/* El Modal Reutilizable (Se mantiene aquí o fuera del grid) */}
                    <PersonaModal 
                      open={openPersona}
                      onOpenChange={setOpenPersona}
                      editingPersona={editingPersona}
                      onSuccess={(personaCreada) => {
                        setNombreRazon(personaCreada.nombre_razon_social);
                        setIdPersona(personaCreada.id_persona);
                      }}
                    />
                  </div>
                  
                  <div className="relative">
                    <input 
                      className={inputStyle}
                      placeholder="Escriba el nombre o RUC del solicitante"
                      value={nombreRazon} 
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setNombreRazon(e.target.value);
                        setShowSuggestions(true);
                      }} 
                    />

                    {/* Lista Desplegable Dinámica */}
                    {showSuggestions && sugerenciasFiltradas.length > 0 && (
                      <div className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="max-h-52 overflow-y-auto bg-white">
                          {sugerenciasFiltradas.map((persona) => (
                            <div 
                              key={persona.id}
                              onClick={() => handleSelectPersona(persona)}
                              className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center group border-b border-slate-50 last:border-none"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase">{persona.nombre}</div>
                                <div className="text-[9px] text-slate-500 font-medium">RUC: <span className="text-blue-600">{persona.ruc}</span></div>
                              </div>
                              <span className="text-[8px] font-black text-blue-500 opacity-0 group-hover:opacity-100 uppercase tracking-tighter">Seleccionar</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. LADO DERECHO: REPRESENTANTE */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-0.5">
                      Representante
                    </label>
                    <button 
                      onClick={() => setOpenRep(true)}
                      type="button"
                      className="text-[9px] text-blue-600 hover:text-blue-700 font-black"
                    >
                      [+ NUEVO]
                    </button>               

                    <RepresentanteModal 
                      open={openRep}
                      onOpenChange={setOpenRep}
                      editingRep={null}
                      juridicas={juridicas} 
                      onSuccess={(repCreado) => {
                        console.log("Representante recibido:", repCreado);

                        setNombreRep(repCreado.nombres);
                        setIdRepresentante(repCreado.id_representante);
                      }}
                    />

                  </div>
                  <div className="relative">
                    <input
                      className={inputStyle}
                      placeholder="Nombre del representante"
                      value={nombreRep}
                      onChange={(e) => {
                        setNombreRep(e.target.value);
                      }}
                    />
                  </div>
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
                    id: 'poder',
                    state: djDeclaroPoder,
                    setter: setDjDeclaroPoder,
                    text: "Cuento con poder suficiente vigente para actuar como representante legal de la persona jurídica o natural.",
                    sub: "(Si aplica)"
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
                    text: "Cuento con título y habilitación vigente para servicios de salud.",
                    sub: "(Si corresponde)"
                  }
                ].map((item) => (
                  <label 
                    key={item.id} 
                    className={`flex flex-col gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm
                      ${item.state ? 'border-[#0f766e] bg-[#0f766e]/5' : 'border-slate-200 bg-white hover:border-slate-300'}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e]"
                        checked={item.state} 
                        onChange={(e) => item.setter(e.target.checked)} 
                      />
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter
                        ${item.state ? 'bg-[#0f766e] text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {item.state ? 'Aceptado' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug font-bold text-slate-700">
                      {item.text} <br/>
                      <span className="text-[9px] text-slate-400 font-medium italic">{item.sub}</span>
                    </p>
                  </label>
                ))}
              </div>

              {/* 2. Advertencia de Fiscalización (Banner Compacto) */}
              <div className="relative overflow-hidden bg-slate-900 text-white p-5 rounded-xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
                  <div className="bg-amber-400/20 p-2.5 rounded-full text-amber-400">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.15em] mb-1 text-amber-400">Aviso de Fiscalización Posterior</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      De comprobarse falsedad o inexactitud en esta declaración, se aplicarán las sanciones administrativas y penales correspondientes (Ley N° 27444).
                    </p>
                  </div>
                  <label className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-none text-amber-500 focus:ring-amber-500 bg-white/20"
                      checked={djAcepto} 
                      onChange={(e) => setDjAcepto(e.target.checked)} 
                    />
                    <span className="text-[10px] font-black uppercase tracking-tight group-hover:text-amber-400 transition-colors">Acepto bajo juramento</span>
                  </label>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#0f766e]/20 -mr-8 -mt-8 rounded-full blur-2xl"></div>
              </div>

              {/* 3. Observaciones */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                  Observaciones o comentarios adicionales
                </label>
                <textarea 
                  rows={2} 
                  className="w-full rounded-lg border border-slate-300 bg-slate-50/50 p-3 text-xs focus:bg-white focus:border-[#0f766e] outline-none transition-all resize-none"
                  placeholder="Opcional: Detalles relevantes para la evaluación..." 
                  value={djObservaciones}
                  onChange={(e) => setDjObservaciones(e.target.value)} 
                />
              </div>


            </div>
          </SeccionCard>
        </div>
      </div>
    </div>

    {/* Acciones Finales */}
    <div className="flex items-center gap-3 w-full md:w-auto">
      <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-11 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
        <ChevronLeft size={16} /> Cancelar
      </button>
      
      <button 
        type="submit"
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 h-11 bg-[#0f766e] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#0a5a54] transition-all shadow-lg shadow-[#0f766e]/20 active:scale-95"
      >
        <Save size={16} /> Guardar
      </button>
    </div>
  </form>  
  );
}