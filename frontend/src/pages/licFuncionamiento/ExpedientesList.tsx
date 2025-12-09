import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expedientes, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
import { Play, Plus, Pencil, Trash2, Shield, Users, Key, Edit2, Search , Eye, Paperclip, CreditCard, Calendar, Printer} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Button } from "../../types/components/ui/button";
import Pagination from "../../components/Pagination";
import { Badge } from "../../types/components/ui/badge";

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
  const verExpediente = (row: Expedientes) => alert(`Ver expediente ${row.numero_expediente}`);
  const abrirAnexos = (row: Expedientes) => alert(`Anexos de expediente ${row.id_expediente}`);
  const abrirPagos = (row: Expedientes) => alert(`Pagos de expediente ${row.id_expediente}`);
  const abrirEventos = (row: Expedientes) => alert(`Eventos de expediente ${row.id_expediente}`);
  const imprimir = (row: Expedientes) => alert(`Imprimir expediente ${row.id_expediente}`);

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

    useEffect(() => {
      setCriterios(initialCriterios);
    }, [activeFilters]);

    const handleChange = (e) => {
      const { name, value } = e.target;

      setCriterios((prev) => ({
        ...prev,
        [name]: value,
      }));
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

      Object.keys(mappedCriterios).forEach(key => {
        const value = mappedCriterios[key];
        if (value !== '' && value !== null && value !== undefined) {
          cleanParams[key] = value;
        }
      });

      console.log("Criterios limpios para API:", cleanParams);

      if (onSearch) {
        onSearch(cleanParams);
      }
    };

    const handleNuevoDJ = () => {
      console.log("Iniciando la creación de una nueva Declaración Jurada...");
    };

    const opcionesModalidad = [
      { value: '', label: 'Todas las Modalidades' },
      { value: 'nuevo', label: 'Nuevo' },
      { value: 'cambio_giro', label: 'Cambio de Giro' },
      { value: 'ampliacion_area', label: 'Ampliación de Área' }
    ];

    return (
      <div className="flex gap-2 items-end flex-wrap">
        <div>
          <Label>Expediente</Label>
          <Input 
            name="expediente" 
            className="w-40" 
            placeholder="Ej: 2023-001234" 
            value={criterios.expediente} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <Label>Razón Social</Label>
          <Input 
            id="razonSocial" 
            name="razonSocial" 
            className="w-60" 
            placeholder="Ej: Empresa S.A.C." 
            value={criterios.razonSocial} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <Label htmlFor="ruc">RUC</Label>
          <Input 
            id="ruc" 
            name="ruc" 
            className="w-40" 
            placeholder="Ej: 20XXXXXXXXX" 
            value={criterios.ruc} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <Label htmlFor="modalidadTramite">Modalidad de Trámite</Label>
          <select 
            id="modalidadTramite" 
            name="modalidadTramite" 
            className="w-48 border border-gray-300 p-2 rounded-md" 
            value={criterios.modalidadTramite} 
            onChange={handleChange}
          >
             {opcionesModalidad.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
          </select>
        </div>

        <div>
          <Label htmlFor="fechaInicio">Fecha Desde</Label>
          <Input 
            type="date" 
            id="fechaInicio" 
            name="fechaInicio" 
            className="w-36" 
            value={criterios.fechaInicio} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <Label htmlFor="fechaFin">Fecha Hasta</Label>
          <Input 
            type="date" 
            id="fechaFin" 
            name="fechaFin" 
            className="w-36" 
            value={criterios.fechaFin} 
            onChange={handleChange} 
          />
        </div>

        <Button
          onClick={handleBuscar}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs sm:text-sm font-medium text-white shadow hover:bg-blue-700 active:bg-blue-800"
        >
          <Search className="w-4 h-4 mr-1"/> Buscar
        </Button>

        <div 
          className="flex justify-end"
          
          >
          <Link
            to="/licfuncionamiento/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
          >
            <Plus className="w-4 h-4 mr-2"/> Nuevo DJ
          </Link>
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
                    <span className="flex flex-wrap gap-2">
                      <Badge key={row.estado} 
                        className={`rounded-2xl px-3 py-1 ${getColorClasses(row.estado)}`}>
                        {row.estado ?? ""} 
                      </Badge>
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <Button size="sm"
                        onClick={() => verExpediente(row)} 
                        variant="outline" 
                        className="border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Eye className="w-4 h-4 mr-1"/>Ver
                      </Button>
                      <Button 
                        onClick={() => abrirAnexos(row)} 
                        variant="outline" 
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                        <Paperclip className="w-4 h-4 mr-1"/>Anexos
                      </Button>
                      <Button 
                        onClick={() => abrirPagos(row)} 
                        variant="outline" 
                        className="border-green-300 text-green-700 hover:bg-green-50">
                        <CreditCard className="w-4 h-4 mr-1"/>Pagos
                      </Button>
                      <Button 
                        onClick={() => abrirEventos(row)} 
                        variant="outline" 
                        className="border-amber-300 text-amber-700 hover:bg-amber-50">
                        <Calendar className="w-4 h-4 mr-1"/>Eventos
                      </Button>
                      <Button 
                        onClick={() => imprimir(row)} 
                        variant="outline" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Printer className="w-4 h-4 mr-1"/>Imprimir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
