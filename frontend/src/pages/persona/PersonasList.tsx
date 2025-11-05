import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Search, ChevronLeft, ChevronRight, Users, BriefcaseBusiness, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { personasApi } from "../../services/personas";
import { representantesApi } from "../../services/representantes";
import type { Personas } from "@/types/persona";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";
import { Toast } from "../../lib/toast";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";

// ===== util =====
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// ===== UI helpers =====
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ===== tipos locales para reps =====
type TipoDoc = "DNI" | "CE" | "PAS";

type RepApi = {
  id_representante: number;
  id_persona: number;
  nombres?: string | null;
  tipo_documento?: string | null;
  numero_documento?: string | null;
  sunarp_partida_asiento?: string | null;
};
type RepSave = {
  id_persona: number;
  nombres: string;
  tipo_documento: string;
  numero_documento: string;
  sunarp_partida_asiento?: string | null;
};
type Rep = {
  id_representante: number;
  id_persona: number;
  nombres: string;
  tipo_documento: TipoDoc;
  numero_documento: string;
  sunarp_partida_asiento: string | null;
  persona?: Personas | null;
};

const DOC_TYPES: { value: TipoDoc; label: string }[] = [
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "Carné de Extranjería" },
  { value: "PAS", label: "Pasaporte" },
];

// =============================
// Componente principal
// =============================
export default function PersonasList() {
  const navigate = useNavigate();

  // ------- pestañas -------
  const [tab, setTab] = useState<"personas" | "representantes">("personas");

  // ------- estado PERSONAS (server-side) -------
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [rows, setRows] = useState<Personas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // cargar personas desde el servicio
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
    return () => {
      cancelled = true;
    };
  }, [dq, page, limit]);

  const totalPagesP = Math.max(1, Math.ceil(total / limit));
  const currentPageP = page;
  const showingFromP = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingToP = Math.min(page * limit, total);

  // ------- estado REPRESENTANTES (on-demand por persona) -------
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  const [reps, setReps] = useState<Rep[]>([]);
  const [repsLoading, setRepsLoading] = useState(false);
  const [repsError, setRepsError] = useState<string>("");

  const personasById = useMemo(
    () => new Map(rows.map((p) => [p.id_persona, p] as const)),
    [rows]
  );
  const repsWithPersona = useMemo(
    () => reps.map((r) => ({ ...r, persona: personasById.get(r.id_persona) ?? null })),
    [reps, personasById]
  );
  const repsForSelected = useMemo(
    () =>
      selectedPersonaId == null
        ? []
        : repsWithPersona.filter((r) => r.id_persona === selectedPersonaId),
    [repsWithPersona, selectedPersonaId]
  );
  const juridicas = useMemo(
    () => rows.filter((p) => p.tipo_persona === "JURIDICA"),
    [rows]
  );

  // normalizador API -> estado local
  const mapRep = (r: RepApi): Rep => ({
    id_representante: r.id_representante,
    id_persona: r.id_persona,
    nombres: r.nombres ?? "",
    tipo_documento: ((r.tipo_documento ?? "DNI") as TipoDoc),
    numero_documento: r.numero_documento ?? "",
    sunarp_partida_asiento: r.sunarp_partida_asiento ?? null,
  });

  // handler botón "Ver representantes" por persona
  async function onVerRepresentantes(personaId: number) {
    setTab("representantes");
    setSelectedPersonaId(personaId);
    setRepsError("");
    setRepsLoading(true);
    try {
      const data = (await representantesApi.getByPersona(personaId)) as RepApi[];
      const nuevos = data.map(mapRep);

      setReps((prev) => {
        const prevSinEsta = prev.filter((r) => r.id_persona !== personaId);
        const dedup = new Map<number, Rep>(prevSinEsta.map((r) => [r.id_representante, r]));
        for (const r of nuevos) dedup.set(r.id_representante, r);
        return Array.from(dedup.values());
      });
    } catch (e: any) {
      setRepsError(e?.message ?? "Error cargando representantes");
    } finally {
      setRepsLoading(false);
    }
  }

  // ------- UI: modal persona (create/update conectado) -------
  const [openPersona, setOpenPersona] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Personas | null>(null);
  const [personaSaving, setPersonaSaving] = useState(false);

  /*const [toast, setToast] = useState({ show: false, message: "" });
  const showToast = (m: string) => {
    setToast({ show: true, message: m });
    setTimeout(() => setToast({ show: false, message: "" }), 1600);
  };*/

  const onOpenNewPersona = () => {
    setEditingPersona({
      id_persona: 0,
      tipo_persona: "JURIDICA",
      nombre_razon_social: "",
      ruc: "",
      telefono: "",
      correo: "",
      via_tipo: "",
      via_nombre: "",
      numero: "",
      interior: "",
      mz: "",
      lt: "",
      otros: "",
      urb_aa_hh_otros: "",
      distrito: "",
      provincia: "",
      departamento: "",
    } as unknown as Personas);
    setOpenPersona(true);
  };
  const onOpenEditPersona = (row: Personas) => {
    setEditingPersona({ ...row });
    setOpenPersona(true);
  };
  const onSubmitPersona: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      tipo_persona: String(f.get("tipo_persona") || "JURIDICA") as "JURIDICA" | "NATURAL",
      nombre_razon_social: String(f.get("nombre") || "").trim(),
      ruc: (String(f.get("ruc") || "").trim() || null),
      telefono: (String(f.get("telefono") || "").trim() || null),
      correo: (String(f.get("correo") || "").trim() || null),
      via_tipo: (String(f.get("via_tipo") || "").trim() || null),
      via_nombre: (String(f.get("via_nombre") || "").trim() || null),
      numero: (String(f.get("numero") || "").trim() || null),
      interior: (String(f.get("interior") || "").trim() || null),
      mz: (String(f.get("mz") || "").trim() || null),
      lt: (String(f.get("lt") || "").trim() || null),
      otros: (String(f.get("otros") || "").trim() || null),
      urb_aa_hh_otros: (String(f.get("urb_aa_hh_otros") || "").trim() || null),
      distrito: (String(f.get("distrito") || "").trim() || null),
      provincia: (String(f.get("provincia") || "").trim() || null),
      departamento: (String(f.get("departamento") || "").trim() || null),
    } as const;

    if (!payload.nombre_razon_social) {
      await swalError("Ingresa el nombre / razón social");
      return;
    }

    if (payload.tipo_persona === "JURIDICA" && !payload.ruc) {
      const ok = await swalConfirm({
        title: "¿Continuar sin RUC?",
        text: "Esta persona es JURÍDICA pero no tiene RUC.",
        icon: "warning",
        confirmButtonText: "Sí, continuar",
      });
      if (!ok) return;
    }

    setPersonaSaving(true);
    try {
      if (editingPersona?.id_persona) {
        await personasApi.update(editingPersona.id_persona, payload);
        await swalSuccess("Persona actualizada");
      } else {
        await personasApi.create(payload);
        await swalSuccess("Persona creada");
      }
      // refrescar la lista manteniendo búsqueda/paginación
      const { data, total } = await personasApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

      setOpenPersona(false);
    } catch (err: any) {
      await swalError(err?.message ?? "Error al guardar persona");
    } finally {
      setPersonaSaving(false);
    }
  };

  // ------- reps: modal (create/update conectado) -------
  const [openRep, setOpenRep] = useState(false);
  const [editingRep, setEditingRep] = useState<Rep | null>(null);
  const [repSaving, setRepSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState<{ rep: Record<number, boolean>; per: Record<number, boolean> }>({
    rep: {},
    per: {},
  });

  const onOpenNewRep = () => {
    const defaultPersonaId = selectedPersonaId ?? juridicas[0]?.id_persona ?? null;
    if (!defaultPersonaId) {
      alert("Primero selecciona o crea una PERSONA JURÍDICA para registrar representantes.");
      setTab("personas");
      return;
    }
    setEditingRep({
      id_representante: 0,
      id_persona: defaultPersonaId,
      nombres: "",
      tipo_documento: "DNI",
      numero_documento: "",
      sunarp_partida_asiento: "",
    });
    setOpenRep(true);
  };

  const onOpenEditRep = (row: Rep) => {
    setEditingRep({ ...row });
    setOpenRep(true);
  };

  const onSubmitRep: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!editingRep) return;

    const f = new FormData(e.currentTarget);
    const payload: RepSave = {
      id_persona: Number(f.get("id_persona")),
      nombres: String(f.get("nombres") || "").trim(),
      tipo_documento: String(f.get("tipo_documento") || "DNI"),
      numero_documento: String(f.get("numero_documento") || "").trim(),
      sunarp_partida_asiento: String(f.get("sunarp") || "").trim() || null,
    };

    const personaSel = personasById.get(payload.id_persona);
    if (!personaSel) return swalError("Selecciona una persona válida");
    if (personaSel.tipo_persona !== "JURIDICA")
      return swalError("Solo se pueden asignar representantes a PERSONAS JURÍDICAS");
    if (!payload.nombres) return swalError("Ingresa nombres del representante");
    if (!payload.numero_documento) return swalError("Ingresa número de documento");

    setRepSaving(true);
    try {
      if (editingRep.id_representante) {
        const updated = (await representantesApi.update(editingRep.id_representante, payload)) as RepApi;
        const rep = mapRep(updated);
        setReps((prev) => prev.map((x) => (x.id_representante === rep.id_representante ? rep : x)));
        Toast.fire({ icon: "success", title: "Representante actualizado" });
      } else {
        const created = (await representantesApi.create(payload)) as RepApi;
        const rep = mapRep(created);
        setReps((prev) => {
          if (selectedPersonaId && rep.id_persona !== selectedPersonaId) return prev;
          const map = new Map(prev.map((r) => [r.id_representante, r]));
          map.set(rep.id_representante, rep);
          return Array.from(map.values());
        });
        if (!selectedPersonaId) setSelectedPersonaId(rep.id_persona);
        Toast.fire({ icon: "success", title: "Representante creado" });
      }
      setOpenRep(false);
    } catch (err: any) {
      await swalError(err?.message ?? "Error guardando representante");
    } finally {
      setRepSaving(false);
    }
  };

  // ------- eliminar PERSONA -------
  async function onDeletePersona(id: number) {
    const p = personasById.get(id);
    const name = p?.nombre_razon_social ?? `ID ${id}`;
    //if (!confirm(`¿Eliminar a "${name}"? Esta acción no se puede deshacer.`)) return;

    const ok = await swalConfirm({
      title: "¿Eliminar persona?",
      text: `Se eliminará "${name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
    });
    if (!ok) return;

    setDeletingIds((prev) => ({ ...prev, per: { ...prev.per, [id]: true } }));
    try {
      await personasApi.remove(id);
      Toast.fire({ icon: "warning", title: "Persona eliminada" });
      // refrescar la lista manteniendo filtros/paginación si es posible
      const { data, total } = await personasApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

      // limpiar reps del seleccionado si corresponde
      if (selectedPersonaId === id) {
        setSelectedPersonaId(null);
      }
      setReps((prev) => prev.filter((r) => r.id_persona !== id));
    } catch (err: any) {
      await swalError(err?.message ?? "Error al eliminar persona");
    } finally {
      setDeletingIds((prev) => ({ ...prev, per: { ...prev.per, [id]: false } }));
    }
  }

  // ------- eliminar REPRESENTANTE -------
  async function onDeleteRep(id_representante: number) {
    const rep = reps.find((r) => r.id_representante === id_representante);
    const label =
      rep?.nombres ||
      (rep?.numero_documento ? `Doc ${rep.numero_documento}` : `ID ${id_representante}`);
    //if (!confirm(`¿Eliminar al representante "${label}"?`)) return;

    const ok = await swalConfirm({
      title: "¿Eliminar representante?",
      text: `Se eliminará "${label}".`,
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
    });
    if (!ok) return;
    
    setDeletingIds((prev) => ({ ...prev, rep: { ...prev.rep, [id_representante]: true } }));
    try {
      await representantesApi.remove(id_representante);
      setReps((prev) => prev.filter((r) => r.id_representante !== id_representante));
      Toast.fire({ icon: "warning", title: "Representante eliminado" });
    } catch (err: any) {
      await swalError(err?.message ?? "Error al eliminar representante");
    } finally {
      setDeletingIds((prev) => ({ ...prev, rep: { ...prev.rep, [id_representante]: false } }));
    }
  }

  return (
      <div className="mx-auto max-w-6xl p-5 text-[13.5px] sm:text-[14px]">
        {/* <Toast show={toast.show} message={toast.message} /> */}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm shadow",
              tab === "personas"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
            onClick={() => setTab("personas")}
          >
            <Users size={18} /> Personas
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm shadow",
              tab === "representantes"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
            onClick={() => setTab("representantes")}
          >
            <BriefcaseBusiness size={18} /> Representantes{" "}
            <span className="ml-1 text-[11px] text-gray-400">(solo jurídicas)</span>
          </button>
        </div>

        {/* ===== PERSONAS (server) ===== */}
        {tab === "personas" && (
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Personas</h1>
                <p className="text-sm text-gray-500">Listado desde servicio (búsqueda y paginación en servidor).</p>
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
                    placeholder="Buscar por nombre, RUC, contacto, distrito…"
                    className="w-72 rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-xs sm:text-sm outline-none ring-0 transition focus:border-gray-400"
                  />
                </div>
                <button
                  onClick={onOpenNewPersona}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
                >
                  <Plus size={18} /> Nuevo
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm mb-4">
              {loading && <div className="px-4 py-3 text-sm text-gray-500">Cargando…</div>}
              {error && !loading && <div className="px-4 py-3 text-sm text-red-600">{error}</div>}

              <table className="min-w-full table-auto text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="w-[45%] md:w-[55%] px-4 py-3 font-semibold">Nombre / Razón social</th>
                    <th className="px-4 py-3 font-semibold">RUC</th>
                    <th className="px-4 py-3 font-semibold">Correo</th>
                    <th className="px-4 py-3 font-semibold w-[1%] whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No hay resultados.
                      </td>
                    </tr>
                  )}
                  {rows.map((p) => {
                    const deleting = !!deletingIds.per[p.id_persona];
                    return (
                      <tr key={p.id_persona} className="border-t last:border-b">
                        <td className="px-4 py-3 text-gray-500">{p.id_persona}</td>
                        <td className="px-4 py-3">{p.tipo_persona}</td>
                        <td className="w-[45%] md:w-[55%] px-4 py-3 font-medium">{p.nombre_razon_social}</td>
                        <td className="px-4 py-3 tabular-nums">{(p as any).ruc ?? "—"}</td>
                        <td className="px-4 py-3">{(p as any).correo || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-xs">
                            {p.tipo_persona === "JURIDICA" && (
                              <button
                                onClick={() => onVerRepresentantes(p.id_persona)}
                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-[11px] sm:text-xs hover:bg-gray-50"
                                title="Ver representantes"
                              >
                                Ver reps
                              </button>
                            )}
                            <button
                              onClick={() => onOpenEditPersona(p)}
                              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                              title="Editar persona"
                            >
                              <Edit2 size={16} /> Editar
                            </button>
                            <button
                              onClick={() => onDeletePersona(p.id_persona)}
                              disabled={deleting}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] sm:text-xs font-medium",
                                deleting
                                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                  : "border-red-300 text-red-600 hover:bg-red-50"
                              )}
                              title="Eliminar persona"
                            >
                              <Trash2 size={16} />
                              {deleting ? "Eliminando…" : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
            />

            {/* Modal Persona */}
            <Modal
              open={openPersona}
              onClose={() => setOpenPersona(false)}
              title={editingPersona?.id_persona ? "Editar persona" : "Nueva persona"}
            >
              <form onSubmit={onSubmitPersona} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Tipo de persona</label>
                  <select
                    name="tipo_persona"
                    defaultValue={editingPersona?.tipo_persona ?? "JURIDICA"}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="JURIDICA">JURÍDICA</option>
                    <option value="NATURAL">NATURAL</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Nombre / Razón social</label>
                  <input
                    name="nombre"
                    defaultValue={editingPersona?.nombre_razon_social ?? ""}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">RUC (solo jurídicas)</label>
                  <input
                    name="ruc"
                    defaultValue={(editingPersona as any)?.ruc ?? ""}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="###########"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Teléfono</label>
                  <input
                    name="telefono"
                    defaultValue={(editingPersona as any)?.telefono ?? ""}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Correo</label>
                  <input
                    name="correo"
                    defaultValue={(editingPersona as any)?.correo ?? ""}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    type="email"
                  />
                </div>

                {/* Dirección (opcional) */}
                <div className="md:col-span-2 mt-2">
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Dirección (opcional)</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <label className="mb-1 block text-sm font-medium">Tipo de vía</label>
                      <input name="via_tipo" defaultValue={(editingPersona as any)?.via_tipo ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" placeholder="Av., Jr., Psje., Calle…" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">Nombre de vía</label>
                      <input name="via_nombre" defaultValue={(editingPersona as any)?.via_nombre ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" placeholder="Ej. AV. PERÚ" />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Número</label>
                      <input name="numero" defaultValue={(editingPersona as any)?.numero ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Interior</label>
                      <input name="interior" defaultValue={(editingPersona as any)?.interior ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" placeholder="Dpto., Int., Of." />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">MZ</label>
                      <input name="mz" defaultValue={(editingPersona as any)?.mz ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">LT</label>
                      <input name="lt" defaultValue={(editingPersona as any)?.lt ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">Otros</label>
                      <input name="otros" defaultValue={(editingPersona as any)?.otros ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" placeholder="Referencia adicional" />
                    </div>

                    <div className="md:col-span-3">
                      <label className="mb-1 block text-sm font-medium">Urb./AA.HH./Otros</label>
                      <input name="urb_aa_hh_otros" defaultValue={(editingPersona as any)?.urb_aa_hh_otros ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" placeholder="Urbanización, AA.HH., etc." />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Distrito</label>
                      <input name="distrito" defaultValue={(editingPersona as any)?.distrito ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Provincia</label>
                      <input name="provincia" defaultValue={(editingPersona as any)?.provincia ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Departamento</label>
                      <input name="departamento" defaultValue={(editingPersona as any)?.departamento ?? ""} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenPersona(false)}
                    className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50"
                    disabled={personaSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-black px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                    disabled={personaSaving}
                  >
                    {personaSaving
                      ? "Guardando…"
                      : editingPersona?.id_persona
                      ? "Guardar cambios"
                      : "Crear"}
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* ===== REPRESENTANTES (on-demand por persona) ===== */}
        {tab === "representantes" && (
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Representantes</h1>
                <p className="text-sm text-gray-500">Mantenimiento opcional y solo para Personas JURÍDICAS.</p>
                {selectedPersonaId != null && (
                  <div className="mt-1 text-sm text-gray-700">
                    Persona seleccionada:{" "}
                    <span className="font-semibold">
                      {personasById.get(selectedPersonaId)?.nombre_razon_social ?? `ID ${selectedPersonaId}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenNewRep}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
                >
                  <Plus size={18} /> Nueva
                </button>
              </div>
            </div>

            {!!repsLoading && <div className="px-4 py-2 text-sm text-gray-500">Cargando representantes…</div>}
            {!!repsError && <div className="px-4 py-2 text-sm text-red-600">{repsError}</div>}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full table-auto text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Representante</th>
                    <th className="px-4 py-3 font-semibold">Tipo Doc.</th>
                    <th className="px-4 py-3 font-semibold">N° Documento</th>
                    <th className="px-4 py-3 font-semibold">Persona (JUR.)</th>
                    <th className="px-4 py-3 font-semibold">RUC</th>
                    <th className="px-4 py-3 font-semibold">SUNARP</th>
                    {/* <th className="px-4 py-3 font-semibold">Acciones</th> */}
                    <th className="px-4 py-3 font-semibold w-[1%] whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPersonaId != null && repsForSelected.length === 0 && !repsLoading && !repsError && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        No hay representantes para esta persona.
                      </td>
                    </tr>
                  )}
                  {repsForSelected.map((row) => {
                    const deleting = !!deletingIds.rep[row.id_representante];
                    return (
                      <tr key={row.id_representante} className="border-t last:border-b">
                        <td className="px-4 py-3 text-gray-500">{row.id_representante}</td>
                        <td className="px-4 py-3 font-medium">{row.nombres || "(sin nombre)"}</td>
                        <td className="px-4 py-3">{row.tipo_documento}</td>
                        <td className="px-4 py-3 tabular-nums">{row.numero_documento}</td>
                        <td className="px-4 py-3">{personasById.get(row.id_persona)?.nombre_razon_social ?? "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{(personasById.get(row.id_persona) as any)?.ruc ?? "—"}</td>
                        <td className="px-4 py-3">{row.sunarp_partida_asiento ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-xs">
                            <button
                              onClick={() => onOpenEditRep(row)}
                              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                              title="Editar representante"
                            >
                              <Edit2 size={16} /> Editar
                            </button>
                            <button
                              onClick={() => onDeleteRep(row.id_representante)}
                              disabled={deleting}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] sm:text-xs font-medium",
                                deleting
                                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                  : "border-red-300 text-red-600 hover:bg-red-50"
                              )}
                              title="Eliminar representante"
                            >
                              <Trash2 size={16} />
                              {deleting ? "Eliminando…" : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Rep */}
            <Modal
              open={openRep}
              onClose={() => setOpenRep(false)}
              title={editingRep?.id_representante ? "Editar representante" : "Nuevo representante"}
            >
              <form onSubmit={onSubmitRep} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Persona JURÍDICA</label>
                  <select
                    name="id_persona"
                    defaultValue={
                      editingRep?.id_persona ??
                      selectedPersonaId ??
                      (juridicas[0]?.id_persona || "")
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    {juridicas.map((p) => (
                      <option key={p.id_persona} value={p.id_persona}>
                        {p.nombre_razon_social} — RUC {(p as any).ruc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Nombres del representante</label>
                  <input
                    name="nombres"
                    defaultValue={editingRep?.nombres ?? ""}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Ej. JUAN PEREZ GOMEZ"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Tipo de documento</label>
                  <select
                    name="tipo_documento"
                    defaultValue={editingRep?.tipo_documento ?? "DNI"}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Número de documento</label>
                  <input
                    name="numero_documento"
                    defaultValue={editingRep?.numero_documento ?? ""}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm tabular-nums"
                    placeholder="########"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">SUNARP (Partida / Asiento)</label>
                  <input
                    name="sunarp"
                    defaultValue={editingRep?.sunarp_partida_asiento ?? ""}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Ej. Partida 13001234 - Asiento B1002"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenRep(false)}
                    className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50"
                    disabled={repSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-black px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                    disabled={repSaving}
                  >
                    {repSaving
                      ? "Guardando…"
                      : editingRep?.id_representante
                      ? "Guardar cambios"
                      : "Crear"}
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}
      </div>
      
  );
}