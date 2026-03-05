import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expedientes, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
import { Play, Plus, Pencil, Trash2, Shield, Users, Key, Edit2, Search , 
  MoreVertical, Trash,
  Eye, Paperclip, CreditCard, Calendar, Printer, Filter, RotateCcw,
  FileText, DollarSign, Scale, CheckCircle,
  FileBadge,
  Copyright,
  Coins
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

import { ModalPagos } from './ModalPagos';
import { ModalResolucion } from "./FormModalGenerarResolucion";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";
import { pago_tramiteApi } from "../../services/pago_tramite";

const obtenerPasoPorAcciones = (row) => {
  const licencia = row.expediente_licencia?.[0];
  const pago = row.pago_tramite?.[0];

  // Acción 4: Licencia (Si ya tiene número de certificado)
  if (licencia?.numero_certificado) return 4;

  // Acción 3: Resolución (Si ya se generó la resolución)
  if (licencia?.numero_resolucion) return 3;

  // Acción 2: Pago (Si existe un registro de pago con ID)
  // Validamos que el array tenga elementos y que el primer elemento tenga un id_pago
  if (pago && pago.id_pago) return 2;

  // Acción 1: Registro / DDJJ (Estado base si no se ha cumplido lo anterior)
  // Si llegó aquí es porque no tiene resolución, ni certificado, ni pago registrado.
  return 1;
};

const StatusSteps = ({ row }) => {
  const pasoActual = obtenerPasoPorAcciones(row);
  
  const steps = [
    { id: 1, label: 'DDJJ' },
    { id: 2, label: 'Pago' },
    { id: 3, label: 'Resolución' },
    { id: 4, label: 'Licencia' },
  ];

  // Cálculo del porcentaje de la barra
  const progressWidth = ((pasoActual - 1) / (steps.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-center justify-between w-[220px] px-1">
        
        {/* Línea de fondo gris */}
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-zinc-100 -translate-y-1/2 rounded-full" />

        {/* Línea de progreso color esmeralda */}
        <div 
          className="absolute top-1/2 left-0 h-[3px] bg-emerald-500 -translate-y-1/2 transition-all duration-500 rounded-full" 
          style={{ width: `${progressWidth}%` }}
        />

        {/* Círculos indicadores */}
        {steps.map((step) => {
          const activado = pasoActual >= step.id;
          return (
            <div 
              key={step.id} 
              className={`relative z-10 w-3 h-3 rounded-full border-2 transition-colors duration-300
                ${activado ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-zinc-200'}`}
            />
          );
        })}
      </div>

      {/* Etiquetas debajo de los puntos */}
      <div className="flex justify-between w-[220px] px-0">
        {steps.map((step) => (
          <span 
            key={step.id} 
            className={`text-[9px] font-bold uppercase ${pasoActual >= step.id ? 'text-emerald-700' : 'text-zinc-400'}`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function ExpedientesList() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);

  // ===== Modal de Pagos =====
  const [isPagosOpen, setIsPagosOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedExpediente, setSelectedExpediente] = useState<number | null>(null);

  // Modal Generar Resolución
  const [isFormModalGenerarResolucion, setIsFormModalGenerarResolucion] = useState(false);

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
  //const [selectedExpediente, setSelectedExpediente] = useState(true);

  async function loadData(currentFilters, currentPage, currentLimit){

    const params = {
      ...currentFilters, // Esto incluye expediente, razonSocial, fechaDesde, etc.
      page: currentPage,
      limit: currentLimit,
    };

    const [expedienteResponse] = await Promise.all([
      await expedientesApi.list(params)
    ]);
    console.log(expedienteResponse.data)
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

  //const abrirEventos = (row: Expedientes) => alert(`Eventos de expediente ${row.id_expediente}`);
  const LicenciaPDF = async (row: Expedientes) => {
    try {
      const blob = await expedientesApi.getPdfCarton(row.id_expediente);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al generar el Carton:", error);
    }
  }

  const generarPago = (row: any) => {
    setSelectedExpediente(row.id_expediente);
    
    if (row.pago_tramite?.length > 0) {
      console.log('view')
      setModalMode('view'); // Si ya tiene pago, solo ver
    } else {
      console.log('edit')
      setModalMode('edit'); // Si no tiene, abrir para registrar
    }
    
    setIsPagosOpen(true);
  };

  const generarResolucion = (row: Expedientes) => {
    setSelectedExpediente(row.id_expediente);
    setIsFormModalGenerarResolucion(true)
  }
  
  const resolucionPDF = async (row: Expedientes) => {
    try {
      console.log(row.id_expediente);
      const blob = await expedientesApi.getPdfResolucion(row.id_expediente);

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
            
            <Link
              to="/licfuncionamiento/nueva"
              className="h-9 px-4 bg-[#0f766e] text-white rounded-lg font-bold text-[10px] uppercase tracking-tighter hover:bg-[#0a5a54] transition-all flex items-center gap-2 shadow-sm shadow-[#0f766e]/20
              "
            >
              <Plus className="w-5 h-5 stroke-[2.5]" /> 
              <span>Nuevo DJ</span>
            </Link>

          </div>

          {/* GRUPO DERECHO: Acciones principales */}
          {/* <div className="flex items-center gap-2">
            <Link
              to="/licfuncionamiento/nueva"
              className="h-9 px-4 bg-[#0f766e] text-white rounded-lg font-bold text-[10px] uppercase tracking-tighter hover:bg-[#0a5a54] transition-all flex items-center gap-2 shadow-sm shadow-[#0f766e]/20
              "
            >
              <Plus className="w-5 h-5 stroke-[2.5]" /> 
              <span>Nuevo DJ</span>
            </Link>
          </div> */}
        </div>
      </div>
    );
  }

  const getColorClasses = (estado: any) => {
    // Aseguramos que el estado se maneje en minúsculas para consistencia
    const normalizedEstado = estado ? estado.toLowerCase() : '';
    console.log(normalizedEstado)
    switch (normalizedEstado) {
      case 'licencia':
      case 'aprobado':
        // Estado final: Verde (Éxito total)
        return 'border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-50';
      
      case 'resolucion':
        // Penúltimo paso: Azul (Avance significativo)
        return 'border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-50';
        
      case 'pagado':
        // Proceso en marcha: Amarillo/Ámbar (Validado pero pendiente de emitir documentos)
        return 'border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-50';
        
      case 'registro':
        // Estado inicial: Gris/Slate (Aún no hay acción de tesorería)
        return 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-50';
        
      case 'anular':
      case 'anulado':
        // Estado crítico: Rojo (Cancelación)
        return 'border-red-300 bg-red-100 text-red-700 hover:bg-red-50';
        
      default:
        // Fallback para cualquier otro valor no mapeado
        return 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100';
    }
  };

  const handleGuardarResolucion = async (data: { id_expediente: number, numero_resolucion: string, fecha_resolucion: string, numero_certificado: string }) => {
    try {

      console.log(data);

      const response = await expedientesApi.generaResolucion({
        id_expediente: data.id_expediente,
        numero_resolucion: data.numero_resolucion,
        resolucion_fecha: data.fecha_resolucion,
        numero_certificado: data.numero_certificado
      });

      if (response.success) {
        swalSuccess("Resolución registrada y expediente actualizado.");
        loadData(activeFilters, page, limit)
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      swalError(error.message || "Error al registrar resolución");
      throw error;
    }
  }

  const handleGuardarPago = async (data: {id_expediente: number, concepto: string, nro_recibo: string, fecha_pago: string, monto: number}) => {
    try {
      console.log(data);

      const response = await pago_tramiteApi.generaPago({
        id_expediente: data.id_expediente,
        concepto: data.concepto,
        nro_recibo: data.nro_recibo,
        fecha_pago: data.fecha_pago,
        monto: data.monto
      });

      if (response.success) {
        swalSuccess("Pago actualizado.");
        loadData(activeFilters, page, limit)
      } else {
        throw new Error(response.message);
      }

    } catch(error: any) {
      swalError(error.message || "Error al registrar pago");
      throw error;
    }

  }

  return (
    <Card className="rounded-2xl shadow">
      <CardHeader>
        <CardTitle>Gestión de Expedientes de Licencia</CardTitle>
        <CardDescription>Administración y seguimiento del flujo de licencias municipales</CardDescription>
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
                <th className="text-left p-3">Solicitante</th>
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
                    <StatusSteps row={row} />
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
                      <Button size="sm" 
                        onClick={() => verExpediente(row)} 
                        variant="ghost" 
                        disabled={!row.pago_tramite?.[0]?.id_pago}
                        className="text-red-600">
                        <FileText className="w-4 h-4 mr-1"/> DDJJ
                      </Button>

                      {row.pago_tramite?.[0]?.id_pago && (
                        <Button size="sm" 
                          onClick={() => generarPago(row)} 
                          variant="ghost" 
                          className="text-green-600">
                          <CreditCard className="w-4 h-4 mr-1"/> Pagos
                        </Button>
                      )}
                      
                      {/* <Button size="sm" onClick={() => abrirAnexos(row)} variant="ghost" className="text-indigo-600">
                        <Paperclip className="w-4 h-4 mr-1"/> Anexos
                      </Button> */}

                      {row.expediente_licencia?.[0]?.numero_certificado && (
                        <Button size="sm" onClick={() => resolucionPDF(row)} variant="ghost" className="text-indigo-600">
                          <Copyright className="w-4 h-4 mr-2 text-gray-600" /> Resolución
                        </Button>
                      )}
                      
                      {row.expediente_licencia?.[0]?.numero_certificado && (
                        <Button size="sm" onClick={() => LicenciaPDF(row)} variant="ghost" className="text-indigo-600">
                          <FileBadge className="w-4 h-4 mr-2 text-gray-600" /> Licencia
                        </Button>
                      )}
                      
                      {/* Menú de Tres Puntitos */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Más opciones</DropdownMenuLabel>

                          {<DropdownMenuItem 
                            onClick={() => generarPago(row)} 
                            className="cursor-pointer"
                            disabled={!!row.pago_tramite?.[0]?.id_pago}>
                            <Coins className="w-4 h-4 mr-2 text-gray-600" /> R. Pago
                          </DropdownMenuItem>}
                          
                          {<DropdownMenuItem 
                            onClick={() => generarResolucion(row)} 
                            className="cursor-pointer"
                            disabled={!!row.expediente_licencia?.[0]?.numero_certificado}
                          >
                            <Copyright className={`w-4 h-4 mr-2 ${ row.expediente_licencia?.[0]?.numero_certificado ? 'text-gray-400' : 'text-amber-600' }`} />
                            <span>
                              {row.expediente_licencia?.[0]?.numero_certificado 
                                ? 'Resolución ya registrada' 
                                : 'R. Resolución'}
                            </span>
                          </DropdownMenuItem>}
                          
                          
                          <DropdownMenuSeparator />
                          {/* <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Trash className="w-4 h-4 mr-2" /> Eliminar
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ModalPagos 
          isOpen={isPagosOpen} 
          onClose={() => setIsPagosOpen(false)} 
          idExpediente={selectedExpediente} 
          mode={modalMode}
          onGuardar={handleGuardarPago}
        />

        <ModalResolucion
          isOpen={isFormModalGenerarResolucion}
          onClose={() => setIsFormModalGenerarResolucion(false)}
          idExpediente={selectedExpediente}
          onGuardar={handleGuardarResolucion}
        />

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
    // Usamos 'en-GB' o 'es-PE' para formato DD/MM/YYYY y forzamos UTC
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // <--- Esto es la clave
    }).format(d);
  } catch {
    return iso;
  }
}
