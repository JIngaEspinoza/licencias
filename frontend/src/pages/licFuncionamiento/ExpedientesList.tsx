import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expediente, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

export default function ExpedientesList() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);

  const [rows, setRows] = useState<Expediente[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    expedientesApi
      .list(dq, page, limit)
      .then((res) => {
        if (!alive) return;
        setRows(Array.isArray(res.data) ? res.data : []);
        setTotal(Number(res.total) || 0);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "Error al listar expedientes");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [dq, page, limit]);

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
  const verExpediente = (row: Expediente) => alert(`Ver expediente ${row.numero_expediente}`);
  const abrirAnexos = (row: Expediente) => alert(`Anexos de expediente ${row.id_expediente}`);
  const abrirPagos = (row: Expediente) => alert(`Pagos de expediente ${row.id_expediente}`);
  const abrirEventos = (row: Expediente) => alert(`Eventos de expediente ${row.id_expediente}`);
  const imprimir = (row: Expediente) => alert(`Imprimir expediente ${row.id_expediente}`);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Declaraciones Juradas</h1>
          <p className="text-sm text-gray-500">Listado de expedientes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={18} />
            <input
                value={q}
                onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
                }}
                placeholder="Buscar (n° expediente / persona / RUC)"
                className="w-72 rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-xs sm:text-sm outline-none ring-0 transition focus:border-gray-400"
            />
          </div>
          <Link 
            to="/licfuncionamiento/nueva"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white 
                 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 
                 disabled:opacity-60 disabled:cursor-not-allowed"
            >
            <Plus size={18} /> Nueva DJ
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">N° Expediente</th>
              <th className="px-4 py-2 font-medium">Fecha</th>
              <th className="px-4 py-2 font-medium">Persona</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Acciones</th>
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
              <tr key={row.id_expediente} className="border-t border-green-700">
                <td className="px-4 py-2">{row.numero_expediente}</td>
                <td className="px-4 py-2">{formatDate(row.fecha)}</td>
                <td className="px-4 py-2">
                  {row.persona?.nombre_razon_social ?? `#${row.id_persona}`}
                  {row.persona?.ruc ? <span className="text-gray-500"> — RUC {row.persona.ruc}</span> : null}
                </td>
                <td className="px-4 py-2"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{row.estado ?? "—"}</span></td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => verExpediente(row)} className="rounded-lg border px-2 py-1 hover:bg-gray-50">Ver</button>
                    <button onClick={() => abrirAnexos(row)} className="rounded-lg border px-2 py-1 hover:bg-gray-50">Anexos</button>
                    <button onClick={() => abrirPagos(row)} className="rounded-lg border px-2 py-1 hover:bg-gray-50">Pagos</button>
                    <button onClick={() => abrirEventos(row)} className="rounded-lg border px-2 py-1 hover:bg-gray-50">Eventos</button>
                    <button onClick={() => imprimir(row)} className="rounded-lg border px-2 py-1 hover:bg-gray-50">Imprimir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">Página {page} de {totalPages} • {total} resultado(s)</p>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          <button className="rounded-lg border px-3 py-1 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</button>
        </div>
      </div>

      {/* Errores */}
      {error && <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>}

      {/* ============ MODAL: NUEVA DJ COMPLETA ============ */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-lg font-semibold">Nueva Declaración Jurada</h2>
              <button onClick={closeNew} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">Cerrar</button>
            </div>

            <form onSubmit={handleCreate} className="px-5 py-4 space-y-6">
              {/* Datos base */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Datos base</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">ID Persona</label>
                    <input
                      type="number"
                      value={newForm.id_persona || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, id_persona: Number(e.target.value) }))}
                      required
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. 123"
                    />
                  </div>
                </div>
              </section>

              {/* ExpedienteLicencia */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Expediente de Licencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">ID Representante</label>
                    <input
                      type="number"
                      value={newForm.expedienteLicencia.id_representante || 0}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, id_representante: Number(e.target.value) },
                        }))
                      }
                      required
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. 45"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Fecha de recepción</label>
                    <input
                      type="date"
                      value={newForm.expedienteLicencia.fecha_recepcion || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, fecha_recepcion: e.target.value },
                        }))
                      }
                      required
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Tipo de trámite</label>
                    <input
                      value={newForm.expedienteLicencia.tipo_tramite || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({ ...s, expedienteLicencia: { ...s.expedienteLicencia, tipo_tramite: e.target.value } }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. ORDINARIO / SILENCIO / OTRO"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Modalidad</label>
                    <input
                      value={newForm.expedienteLicencia.modalidad || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({ ...s, expedienteLicencia: { ...s.expedienteLicencia, modalidad: e.target.value } }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. DEFINITIVA / PROVISIONAL"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">N° Licencia Origen</label>
                    <input
                      value={newForm.expedienteLicencia.numero_licencia_origen || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, numero_licencia_origen: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Inicio de plazo</label>
                    <input
                      type="date"
                      value={newForm.expedienteLicencia.fecha_inicio_plazo || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, fecha_inicio_plazo: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Fin de plazo</label>
                    <input
                      type="date"
                      value={newForm.expedienteLicencia.fecha_fin_plazo || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, fecha_fin_plazo: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">N° Resolución</label>
                    <input
                      value={newForm.expedienteLicencia.numero_resolucion || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, numero_resolucion: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Fecha Resolución</label>
                    <input
                      type="date"
                      value={newForm.expedienteLicencia.resolucion_fecha || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, resolucion_fecha: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm font-medium">Nueva denominación</label>
                    <input
                      value={newForm.expedienteLicencia.nueva_denominacion || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, nueva_denominacion: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">N° Certificado</label>
                    <input
                      value={newForm.expedienteLicencia.numero_certificado || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, numero_certificado: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm font-medium">Detalle / Otros</label>
                    <textarea
                      value={newForm.expedienteLicencia.detalle_otros || ""}
                      onChange={(e) =>
                        setNewForm((s) => ({
                          ...s,
                          expedienteLicencia: { ...s.expedienteLicencia, detalle_otros: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Observaciones, etc."
                    />
                  </div>
                </div>
              </section>

              {/* DeclaracionJurada */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Declaración Jurada</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Fecha DJ</label>
                    <input
                      type="date"
                      value={newForm.declaracionJurada.fecha || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, fecha: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="aceptacion"
                      type="checkbox"
                      checked={!!newForm.declaracionJurada.aceptacion}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, aceptacion: e.target.checked } }))}
                    />
                    <label htmlFor="aceptacion" className="text-sm">Aceptación de términos</label>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Nombre comercial</label>
                    <input
                      value={newForm.declaracionJurada.nombre_comercial || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, nombre_comercial: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. Bodega San Miguel"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Actividad</label>
                    <input
                      value={newForm.declaracionJurada.actividad || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, actividad: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. Venta de abarrotes"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Código CIIU</label>
                    <input
                      value={newForm.declaracionJurada.codigo_ciiu || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, codigo_ciiu: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. G4711"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Zonificación</label>
                    <input
                      value={newForm.declaracionJurada.zonificacion || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, zonificacion: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. CZ"
                    />
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Vía (tipo)</label>
                    <input
                      value={newForm.declaracionJurada.via_tipo || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, via_tipo: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Av., Jr., Psje., etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Vía (nombre)</label>
                    <input
                      value={newForm.declaracionJurada.via_nombre || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, via_nombre: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Número</label>
                    <input
                      value={newForm.declaracionJurada.numero || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, numero: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Interior</label>
                    <input
                      value={newForm.declaracionJurada.interior || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, interior: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Mz</label>
                    <input
                      value={newForm.declaracionJurada.mz || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, mz: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Lt</label>
                    <input
                      value={newForm.declaracionJurada.lt || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, lt: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Otros (dirección)</label>
                    <input
                      value={newForm.declaracionJurada.otros || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, otros: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Urb/AA.HH./Otros</label>
                    <input
                      value={newForm.declaracionJurada.urb_aa_hh_otros || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, urb_aa_hh_otros: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Provincia</label>
                    <input
                      value={newForm.declaracionJurada.provincia || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, provincia: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Booleans clave */}
                  <div className="flex items-center gap-2">
                    <input
                      id="tiene_aut_sectorial"
                      type="checkbox"
                      checked={!!newForm.declaracionJurada.tiene_aut_sectorial}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, tiene_aut_sectorial: e.target.checked } }))}
                    />
                    <label htmlFor="tiene_aut_sectorial" className="text-sm">Tiene autorización sectorial</label>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Entidad</label>
                      <input
                        value={newForm.declaracionJurada.aut_entidad || ""}
                        onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, aut_entidad: e.target.value } }))}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Denominación</label>
                      <input
                        value={newForm.declaracionJurada.aut_denominacion || ""}
                        onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, aut_denominacion: e.target.value } }))}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Fecha Autorización</label>
                      <input
                        type="date"
                        value={newForm.declaracionJurada.aut_fecha || ""}
                        onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, aut_fecha: e.target.value } }))}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm font-medium">Observaciones</label>
                    <textarea
                      value={newForm.declaracionJurada.observaciones || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, observaciones: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Firmante y checks */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Firmante (tipo)</label>
                    <input
                      value={newForm.declaracionJurada.firmante_tipo || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, firmante_tipo: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="REP. LEGAL / TITULAR"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Firmante (nombre)</label>
                    <input
                      value={newForm.declaracionJurada.firmante_nombre || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, firmante_nombre: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Doc. Tipo</label>
                    <input
                      value={newForm.declaracionJurada.firmante_doc_tipo || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, firmante_doc_tipo: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="DNI / CE / Pasaporte"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Doc. Número</label>
                    <input
                      value={newForm.declaracionJurada.firmante_doc_numero || ""}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, firmante_doc_numero: e.target.value } }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="vigencia_poder"
                      type="checkbox"
                      checked={!!newForm.declaracionJurada.vigencia_poder}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, vigencia_poder: e.target.checked } }))}
                    />
                    <label htmlFor="vigencia_poder" className="text-sm">Vigencia de poder</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="condiciones_seguridad"
                      type="checkbox"
                      checked={!!newForm.declaracionJurada.condiciones_seguridad}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, condiciones_seguridad: e.target.checked } }))}
                    />
                    <label htmlFor="condiciones_seguridad" className="text-sm">Condiciones de seguridad</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="titulo_profesional"
                      type="checkbox"
                      checked={!!newForm.declaracionJurada.titulo_profesional}
                      onChange={(e) => setNewForm((s) => ({ ...s, declaracionJurada: { ...s.declaracionJurada, titulo_profesional: e.target.checked } }))}
                    />
                    <label htmlFor="titulo_profesional" className="text-sm">Título profesional</label>
                  </div>
                </div>
              </section>

              {/* Botonera */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeNew} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={creating} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">
                  {creating ? "Creando..." : "Crear DJ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
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
