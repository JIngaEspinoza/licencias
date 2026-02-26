import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expedientes, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
import { Play, Plus, Pencil, Trash2, Shield, Users, Key, Edit2, Search , 
  MoreVertical, Trash,
  Eye, Paperclip, CreditCard, Calendar, Printer, Filter, RotateCcw,
  FileText, DollarSign, Scale, CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Button } from "../../types/components/ui/button";
import Pagination from "../../components/Pagination";
import { Badge } from "../../types/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../types/components/ui/dropdown-menu"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../types/components/ui/popover";

import ValidationPanel from "./ExpedientePagosAnexos";

const StatusSteps = ({ pasoActual, esObservado = false }) => {
  const steps = [
    { id: 1, icon: FileText, label: 'DJ' },
    { id: 2, icon: DollarSign, label: 'Pago' },
    { id: 3, icon: Paperclip, label: 'Anexos' },
    { id: 4, icon: Scale, label: 'Dictamen' },
    { id: 5, icon: CheckCircle, label: 'Licencia' },
  ];

  const progressWidth = ((pasoActual - 1) / (steps.length - 1)) * 100;

  // Definimos colores dinámicos según el estado
  const colorPrimario = esObservado ? 'bg-amber-500' : 'bg-emerald-500';
  const colorBorde = esObservado ? 'border-amber-500' : 'border-emerald-500';
  const colorTexto = esObservado ? 'text-amber-600' : 'text-emerald-600';

  return (
    <div className="relative flex items-center justify-between w-full max-w-[240px] py-4 group">
      
      {/* LINEA DE FONDO */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-100 -translate-y-1/2 z-0" />

      {/* LINEA DE PROGRESO ACTIVA (Cambia a Ámbar si hay observación) */}
      <div 
        className={`absolute top-1/2 left-0 h-[2px] ${colorPrimario} -translate-y-1/2 z-0 transition-all duration-700`} 
        style={{ width: `${progressWidth}%` }}
      />

      {/* ICONOS */}
      {steps.map((step) => {
        const isCompleted = pasoActual > step.id;
        const isCurrent = pasoActual === step.id;
        
        // El icono cambia a un triángulo de alerta si es el paso actual y está observado
        const IconComponent = (isCurrent && esObservado) ? AlertTriangle : step.icon;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div 
              className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 bg-white
                ${isCompleted ? `${colorBorde} ${colorTexto}` : 'border-zinc-100 text-zinc-300'}
                ${isCurrent ? (esObservado ? 'border-amber-500 text-amber-500 ring-4 ring-amber-50 scale-110' : 'border-emerald-500 text-emerald-500 ring-4 ring-emerald-50 scale-110') : ''}
              `}
            >
              <IconComponent size={14} strokeWidth={isCompleted || isCurrent ? 3 : 2} />
            </div>
            
            {/* Label con estado */}
            <span className={`absolute -bottom-6 text-[8px] font-bold uppercase tracking-tighter whitespace-nowrap
              ${isCurrent && esObservado ? 'text-amber-600' : (isCompleted || isCurrent ? 'text-zinc-800' : 'text-zinc-400')}
            `}>
              {isCurrent && esObservado ? 'Observado' : step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ExpedientesList() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rows, setRows] = useState<Expedientes[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    numeroExpediente: '',
    razonSocial: '',
    fechaInicio: '',
    fechaFin: '',
    modalidadTramite: null
  });
  
  // ===== Modal Nueva DJ (completa) =====
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);

  const [newForm, setNewForm] = useState<NuevaDJCompletaInput>({
    id_persona: 0,
    expedienteLicencia: {
      id_representante: 0,
      numero_licencia_origen: "",
      fecha_recepcion: "", // YYYY-MM-DD
      tipo_tramite: "",
      modalidad: "",
      fecha_inicio_plazo: "",
      fecha_fin_plazo: "",
      numero_resolucion: "",
      resolucion_fecha: "",
      nueva_denominacion: "",
      numero_certificado: "",
      qr_certificado: "",
      detalle_otros: "",
    },
    declaracionJurada: {
      fecha: "",
      aceptacion: true,
      nombre_comercial: "",
      codigo_ciiu: "",
      actividad: "",
      zonificacion: "",
      via_tipo: "",
      via_nombre: "",
      numero: "",
      interior: "",
      mz: "",
      lt: "",
      otros: "",
      urb_aa_hh_otros: "",
      provincia: "",
      tiene_aut_sectorial: false,
      aut_entidad: "",
      aut_denominacion: "",
      aut_fecha: "",
      aut_numero: "",
      monumento: false,
      aut_ministerio_cultura: false,
      num_aut_ministerio_cultura: "",
      fecha_aut_ministerio_cultura: "",
      area_total_m2: undefined,
      firmante_tipo: "",
      firmante_nombre: "",
      firmante_doc_tipo: "",
      firmante_doc_numero: "",
      vigencia_poder: false,
      condiciones_seguridad: false,
      titulo_profesional: false,
      observaciones: "",
    },
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  async function loadData(currentFilters, currentPage, currentLimit){

    const params = {
      ...currentFilters, // Esto incluye expediente, razonSocial, fechaDesde, etc.
      page: currentPage,
      limit: currentLimit,
    };

    const [expedienteResponse] = await Promise.all([
      await expedientesApi.list(params)
    ]);

    setRows(expedienteResponse.data);
    setTotal(expedienteResponse.total);

  }

  const handleSearch = (newFilters) => {
    // 1. Guardar los nuevos filtros.
    setActiveFilters(newFilters);

    // 2. Si la página actual es diferente de 1, establecerla a 1.
    // Esto disparará la recarga de datos a través del useEffect.
    // Si ya estamos en la página 1, el useEffect no se dispararía solo por 'page', 
    // pero se disparará por 'activeFilters'.
    if (page !== 1) {
      setPage(1);
    } 
    // Si ya estamos en la página 1, el cambio en activeFilters disparará el useEffect.
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        
        loadData(activeFilters, page, limit)

      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error al cargar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [activeFilters, page, limit]);

  const openNew = () => {
    setNewForm((s) => ({
      ...s,
      id_persona: 0,
      expedienteLicencia: { ...s.expedienteLicencia, id_representante: 0, fecha_recepcion: "" },
      declaracionJurada: { ...s.declaracionJurada, fecha: "" },
    }));
    setIsNewOpen(true);
  };

  const closeNew = () => setIsNewOpen(false);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await expedientesApi.list(dq, page, limit);
      setRows(Array.isArray(res.data) ? res.data : []);
      setTotal(Number(res.total) || 0);
    } catch (e: any) {
      setError(e.message || "Error al refrescar");
    } finally {
      setLoading(false);
    }
  };

  const toISODate = (d: string) => {
    // Recibe "YYYY-MM-DD" (input type="date") y lo retorna igual (tu backend lo parsea como Date)
    // Si necesitas "YYYY-MM-DDT00:00:00.000Z", ajusta aquí.
    return d || "";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const p = newForm;

      if (!p.id_persona || p.id_persona <= 0) throw new Error("Ingresa un id_persona válido.");
      if (!p.expedienteLicencia.id_representante || p.expedienteLicencia.id_representante <= 0) {
        throw new Error("Ingresa un id_representante válido.");
      }
      if (!p.expedienteLicencia.fecha_recepcion) {
        throw new Error("La fecha de recepción (ExpedienteLicencia) es obligatoria.");
      }

      // Normaliza fechas (si usas ISO con Z, cámbialo aquí)
      const payload: NuevaDJCompletaInput = {
        id_persona: p.id_persona,
        expedienteLicencia: {
          ...p.expedienteLicencia,
          fecha_recepcion: toISODate(p.expedienteLicencia.fecha_recepcion),
          fecha_inicio_plazo: p.expedienteLicencia.fecha_inicio_plazo ? toISODate(p.expedienteLicencia.fecha_inicio_plazo) : null,
          fecha_fin_plazo: p.expedienteLicencia.fecha_fin_plazo ? toISODate(p.expedienteLicencia.fecha_fin_plazo) : null,
          resolucion_fecha: p.expedienteLicencia.resolucion_fecha ? toISODate(p.expedienteLicencia.resolucion_fecha) : null,
        },
        declaracionJurada: {
          ...p.declaracionJurada,
          fecha: p.declaracionJurada.fecha ? toISODate(p.declaracionJurada.fecha) : null,
          aut_fecha: p.declaracionJurada.aut_fecha ? toISODate(p.declaracionJurada.aut_fecha) : null,
          fecha_aut_ministerio_cultura: p.declaracionJurada.fecha_aut_ministerio_cultura ? toISODate(p.declaracionJurada.fecha_aut_ministerio_cultura) : null,
        },
      };

      const res = await expedientesApi.crearNuevaDJCompleta(payload);
      if (!res.ok) throw new Error("No se pudo crear la Declaración Jurada completa.");
      await refresh();
      setIsNewOpen(false);
    } catch (err: any) {
      setError(err.message || "Error al crear la DJ");
    } finally {
      setCreating(false);
    }
  };

  // Acciones de fila (placeholders)
  //const verExpediente = (row: Expedientes) => alert(`Ver expediente ${row.numero_expediente}`);

  const verExpediente = async (row: Expedientes) => {
    try {
      const blob = await expedientesApi.getPdfDDJJ(row.id_expediente);
      if (!(blob instanceof Blob)) {
        throw new Error("La respuesta no es un Blob válido");
      }

      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
      
    } catch (error) {
      console.error("Error al imprimir la declaración jurada:", error);
    }
  };
  

  const abrirAnexos = (row: Expedientes) => alert(`Anexos de expediente ${row.id_expediente}`);
  const abrirPagos = (row: Expedientes) => alert(`Pagos de expediente ${row.id_expediente}`);
  //const abrirEventos = (row: Expedientes) => alert(`Eventos de expediente ${row.id_expediente}`);
  const abrirEventos = async (row: Expedientes) => {
    try {
      const blob = await expedientesApi.getPdfCarton(row.id_expediente);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al generar el Carton:", error);
    }
  }
  
  const imprimir = async (row: Expedientes) => {
    try {
      console.log(row.id_expediente);
      const blob = await expedientesApi.getPdf(row.id_expediente);

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  }

  function CrearNewDJ({ onSearch, activeFilters }) {
    const initialCriterios = {
      expediente: activeFilters.numero_expediente || "",
      razonSocial: activeFilters.razonSocial || "",
      ruc: activeFilters.ruc || "",
      modalidadTramite: activeFilters.modalidadTramite || "",
      fechaInicio: activeFilters.fechaInicio || "",
      fechaFin: activeFilters.fechaFin || "",
    };

    const [criterios, setCriterios] = useState(initialCriterios);
    const [showFilters, setShowFilters] = useState(false); // Para control visual si prefieres grilla en vez de Popover

    useEffect(() => {
      setCriterios(initialCriterios);
    }, [activeFilters]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setCriterios((prev) => ({ ...prev, [name]: value }));
    };

    const handleBuscar = () => {
      const cleanParams = {};
      const mappedCriterios = {
        numero_expediente: criterios.expediente,
        razonSocial: criterios.razonSocial,
        ruc: criterios.ruc,
        modalidadTramite: criterios.modalidadTramite,
        fechaInicio: criterios.fechaInicio,
        fechaFin: criterios.fechaFin,
      };

      Object.keys(mappedCriterios).forEach((key) => {
        const value = mappedCriterios[key];
        if (value !== "" && value !== null && value !== undefined) {
          cleanParams[key] = value;
        }
      });
      if (onSearch) onSearch(cleanParams);
    };

    const resetFiltros = () => {
      const reset = {
        expediente: "", razonSocial: "", ruc: "",
        modalidadTramite: "", fechaInicio: "", fechaFin: ""
      };
      setCriterios(reset);
      onSearch({});
    };

    const opcionesModalidad = [
      { value: "", label: "Todas las Modalidades" },
      { value: "nuevo", label: "Nuevo" },
      { value: "cambio_giro", label: "Cambio de Giro" },
      { value: "ampliacion_area", label: "Ampliación de Área" },
    ];

    return (
      <div className="w-full space-y-3 bg-zinc-50/50 p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* GRUPO IZQUIERDO: Búsqueda rápida y Filtros */}
          <div className="flex items-center gap-2 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                name="razonSocial"
                value={criterios.razonSocial}
                onChange={handleChange}
                placeholder="Buscar por Razón Social..."
                className="pl-9 bg-white border-zinc-200 focus:ring-blue-500 rounded-lg"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2 border-zinc-300 hover:bg-zinc-100 cursor-pointer">
                  <Filter className="w-4 h-4 text-zinc-600" />
                  <span>Filtros</span>
                  {Object.values(criterios).filter(v => v !== "").length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold">
                      {Object.values(criterios).filter(v => v !== "").length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-5 shadow-2xl rounded-2xl border-zinc-200" align="start">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">N° Expediente</Label>
                    <Input name="expediente" value={criterios.expediente} onChange={handleChange} placeholder="Ej: 2023-001234" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">RUC</Label>
                    <Input name="ruc" value={criterios.ruc} onChange={handleChange} placeholder="10XXXXXXXXX" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Modalidad</Label>
                    <select
                      name="modalidadTramite"
                      className="w-full flex h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={criterios.modalidadTramite}
                      onChange={handleChange}
                    >
                      {opcionesModalidad.map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fecha Desde</Label>
                    <Input type="date" name="fechaInicio" value={criterios.fechaInicio} onChange={handleChange} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fecha Hasta</Label>
                    <Input type="date" name="fechaFin" value={criterios.fechaFin} onChange={handleChange} />
                  </div>

                  <div className="col-span-2 flex gap-2 pt-4 border-t mt-2">
                    <Button variant="ghost" className="flex-1 cursor-pointer" onClick={resetFiltros}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white" onClick={handleBuscar}>
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleBuscar} className="bg-zinc-800 hover:bg-black text-white px-6 cursor-pointer rounded-lg shadow-sm transition-all">
              Buscar
            </Button>
          </div>

          {/* GRUPO DERECHO: Acciones principales */}
          <div className="flex items-center gap-2">
            <Link
              to="/licfuncionamiento/nueva"
              className="h-9 px-4 bg-[#0f766e] text-white rounded-lg font-bold text-[10px] uppercase tracking-tighter hover:bg-[#0a5a54] transition-all flex items-center gap-2 shadow-sm shadow-[#0f766e]/20
              "
            >
              <Plus className="w-5 h-5 stroke-[2.5]" /> 
              <span>Nuevo DJ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getColorClasses = (estado: any) => {
    // Aseguramos que el estado se maneje en minúsculas para consistencia
    const normalizedEstado = estado ? estado.toLowerCase() : '';
    
    switch (normalizedEstado) {
      case 'aprobado':
      case 'activo':
      case 'completo':
        return 'border-green-300 bg-green-100 text-green-700 hover:bg-green-50';
      case 'pendiente':
      case 'en revisión':
      case 'por pagar':
        return 'border-yellow-300 bg-yellow-100 text-yellow-700 hover:bg-yellow-50';
      case 'cancelado':
      case 'rechazado':
      case 'anulado':
        return 'border-red-300 bg-red-100 text-red-700 hover:bg-red-50';
      case 'en proceso':
      case 'nuevo':
        return 'border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-50';
    }
  };

  return (
    <Card className="rounded-2xl shadow">
      <CardHeader>
        <CardTitle>Declaraciones Juradas</CardTitle>
        <CardDescription>Listado de expedientes</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <CrearNewDJ onSearch={handleSearch} 
            activeFilters={activeFilters}
          />
        </div>

        <div className="overflow-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="text-left p-3">N° Expediente</th>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Persona</th>
                <th className="text-left p-3">Progreso</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Cargando...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sin resultados</td></tr>
              )}
              {!loading && rows.map((row) => (
                <tr key={row.id_expediente} className="border-t ">
                  <td className="p-3">{row.numero_expediente}</td>
                  <td className="p-3">{formatDate(row.fecha)}</td>
                  <td className="p-3">
                    {row.persona?.nombre_razon_social }
                    {row.persona 
                      ? (
                        row.persona.tipo_persona == "JURIDICA" 
                          ? <span className="text-gray-500"> {row.persona.tipo_documento} — {row.persona.ruc}</span> 
                          : <span className="text-gray-500"> {row.persona.tipo_documento} — {row.persona.numero_documento}</span>
                      ) 
                      : <span></span>
                    }
                  </td>
                  <td className="p-3">
                    <StatusSteps pasoActual={5} />
                  </td>
                  <td className="p-3">
                    <span className="flex flex-wrap gap-2">
                      <Badge key={row.estado} 
                        className={`rounded-2xl px-3 py-1 ${getColorClasses(row.estado)}`}>
                        {row.estado ?? ""} 
                      </Badge>
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      {/* Acciones Primarias */}
                      <Button size="sm" onClick={() => verExpediente(row)} variant="ghost" className="text-blue-600">
                        <Eye className="w-4 h-4 mr-1"/> Ver
                      </Button>
                      
                      <Button size="sm" onClick={() => abrirAnexos(row)} variant="ghost" className="text-indigo-600">
                        <Paperclip className="w-4 h-4 mr-1"/> Anexos
                      </Button>

                      <Button size="sm" onClick={() => abrirPagos(row)} variant="ghost" className="text-green-600">
                        <CreditCard className="w-4 h-4 mr-1"/> Pagos
                      </Button>

                      {/* Menú de Tres Puntitos */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Más opciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => abrirEventos(row)} className="cursor-pointer">
                            <Calendar className="w-4 h-4 mr-2 text-amber-600" /> Eventos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => imprimir(row)} className="cursor-pointer">
                            <Printer className="w-4 h-4 mr-2 text-gray-600" /> Imprimir
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Trash className="w-4 h-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedExpediente && (
          <ValidationPanel
            expediente={selectedExpediente} 
            onClose={() => setSelectedExpediente(null)}
          />
        )}

        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>    
  );
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return iso;
  }
}
