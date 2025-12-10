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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../types/components/ui/tabs";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Button } from "../../types/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay
} from "../../types/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../types/components/ui/select";

import { toast } from "sonner";

// ===== util =====
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// ===== tipos locales para reps =====
type TipoDoc = "DNI" | "CE" | "PAS";

type Representate = {
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
  sunarp_partida_asiento?: string;
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

const labelClasses = "mb-1 block text-sm font-medium";
const inputClasses = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm";

// =============================
// Componente principal
// =============================
export default function PersonasList() {
  const navigate = useNavigate();

  // ------- pestañas -------
  //const [tab, setTab] = useState<"personas" | "representantes">("personas");
  const [activeTab, setActiveTab] = useState("personas");

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
  const mapRep = (r: Representate): Rep => ({
    id_representante: r.id_representante,
    id_persona: r.id_persona,
    nombres: r.nombres ?? "",
    tipo_documento: ((r.tipo_documento ?? "DNI") as TipoDoc),
    numero_documento: r.numero_documento ?? "",
    sunarp_partida_asiento: r.sunarp_partida_asiento ?? null,
  });

  async function onVerRepresentantes(personaId: number) {
    setActiveTab("representantes");
    setSelectedPersonaId(personaId);
    setRepsError("");
    setRepsLoading(true);
    try {
      const data = (await representantesApi.getByPersona(personaId)) as Representate[];
      const nuevos = data.map(mapRep);
      setReps(nuevos);

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

  const NUEVA_PERSONA_BASE: Personas = {
    id_persona: 0, // Indica nuevo
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
  };

  const onOpenNewPersona = () => {
    setEditingPersona(NUEVA_PERSONA_BASE);
    setOpenPersona(true);
  };

  const onOpenEditPersona = (row: Personas) => {
    setEditingPersona({ ...row });
    setOpenPersona(true);
  };

  const onSubmitPersona: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const getOptionalString = (value: FormDataEntryValue | null) => {
      const trimmedValue = String(value || "").trim();
      return trimmedValue === "" ? undefined : trimmedValue;
    };

    const f = new FormData(e.currentTarget);
    const payload = {
      tipo_persona: String(f.get("tipo_persona") || "JURIDICA") as "JURIDICA" | "NATURAL",
      nombre_razon_social: String(f.get("nombre")).trim(),
      ruc: getOptionalString(f.get("ruc")), //(String(f.get("ruc") || "").trim()),
      telefono: getOptionalString(f.get("telefono")), //(String(f.get("telefono") || "").trim()),
      correo: getOptionalString(f.get("correo")), //(String(f.get("correo") || "").trim()),
      via_tipo: getOptionalString(f.get("via_tipo")), //(String(f.get("via_tipo") || "").trim()),
      via_nombre: getOptionalString(f.get("via_nombre")), //(String(f.get("via_nombre") || "").trim()),
      numero:  getOptionalString(f.get("numero")), //(String(f.get("numero") || "").trim()),
      interior: getOptionalString(f.get("interior")), //(String(f.get("interior") || "").trim()),
      mz: getOptionalString(f.get("mz")), //(String(f.get("mz") || "").trim()),
      lt: getOptionalString(f.get("lt")),
      otros: getOptionalString(f.get("otros")), //(String(f.get("otros") || "").trim()),
      urb_aa_hh_otros: getOptionalString(f.get("urb_aa_hh_otros")),
      distrito: getOptionalString(f.get("distrito")), //(String(f.get("distrito") || "").trim()),
      provincia: getOptionalString(f.get("provincia")), //(String(f.get("provincia") || "").trim()),
      departamento: getOptionalString(f.get("departamento")) //(String(f.get("departamento") || "").trim()),
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
      setActiveTab("personas");
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
    const getOptionalString = (value: FormDataEntryValue | null) => {
      const trimmedValue = String(value || "").trim();
      return trimmedValue === "" ? undefined : trimmedValue;
    };

    if (!editingRep) return;

    const f = new FormData(e.currentTarget);
    const payload: RepSave = {
      id_persona: Number(f.get("id_persona")),
      nombres: String(f.get("nombres") || "").trim(),
      tipo_documento: String(f.get("tipo_documento")),
      numero_documento: String(f.get("numero_documento")),
      sunarp_partida_asiento: getOptionalString(String(f.get("sunarp"))),
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
        const updated = (await representantesApi.update(editingRep.id_representante, payload)) as Representate;
        const rep = mapRep(updated);
        setReps((prev) => prev.map((x) => (x.id_representante === rep.id_representante ? rep : x)));
        Toast.fire({ icon: "success", title: "Representante actualizado" });
      } else {
        const created = (await representantesApi.create(payload)) as Representate;
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
  
  async function onDeleteRep(id_representante: number) {
    const rep = reps.find((r) => r.id_representante === id_representante);
    const label =
      rep?.nombres ||
      (rep?.numero_documento ? `Doc ${rep.numero_documento}` : `ID ${id_representante}`);

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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 p-0 h-10">
        <TabsTrigger 
          value="personas"
          className="
          data-[state=active]:bg-black 
          data-[state=active]:text-white
          data-[state=active]:font-bold
          data-[state=active]:shadow-lg
          data-[state=active]:border-b-4
          data-[state=active]:border-black

          // Estilos INACTIVO
          text-gray-600 hover:text-black 
          bg-transparent 
          rounded-lg 
          transition-all duration-300
          "
          >Personas</TabsTrigger>
        <TabsTrigger 
          value="representantes"
          className="
            data-[state=active]:bg-black 
            data-[state=active]:text-white
            data-[state=active]:font-bold
            data-[state=active]:shadow-lg
            data-[state=active]:border-b-4
            data-[state=active]:border-black

            // Estilos INACTIVO
            text-gray-600 hover:text-black 
            bg-transparent 
            rounded-lg 
            transition-all duration-300
          "
          >Representantes</TabsTrigger>
      </TabsList>

      <TabsContent value="personas">
        <Card className="rounded-2xl shadow">
          <CardHeader>
            <CardTitle>Personas</CardTitle>
            <CardDescription>Administra las personas</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="grow">
                <Label htmlFor="buscarR">Buscar por nombre</Label>
                <Input id="buscarR" placeholder="ADMIN" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
              </div>
              <Button
                onClick={onOpenNewPersona}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
              >
                <Plus size={18} /> Nuevo
              </Button>
            </div>

            <div className="overflow-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="text-left p-3">#</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Nombre / Razón social</th>
                    <th className="text-left p-3">RUC</th>
                    <th className="text-left p-3">Correo</th>
                    <th className="text-right p-3">Acciones</th>
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
                              <Button size="sm" 
                                onClick={() => onVerRepresentantes(p.id_persona)}
                                variant="outline" 
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                title="Ver representantes"
                              >
                                Ver reps
                              </Button>
                            )}

                            <Button size="sm" 
                              onClick={() => onOpenEditPersona(p)}
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              title="Editar persona"
                            >
                              <Edit2 size={16} /> Editar
                            </Button>

                            <Button size="sm" 
                              onClick={() => onDeletePersona(p.id_persona)}
                              disabled={deleting}
                              variant="outline" 
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
                            </Button>
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

            <Dialog open={openPersona} onOpenChange={setOpenPersona}>
              <DialogContent 
                className="sm:max-w-[800px]"
                onInteractOutside={(e) => {
                  e.preventDefault(); 
                }}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingPersona?.id_persona ? "Editar persona" : "Nueva persona"}
                  </DialogTitle>
                  <DialogDescription>
                    Completa los campos para {editingPersona?.id_persona ? "Editar la persona" : "Crear una nueva persona"}.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmitPersona} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className={labelClasses}>Tipo de persona</Label>
                    <Select
                      name="tipo_persona"
                      defaultValue={editingPersona?.tipo_persona ?? "JURIDICA"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="JURIDICA">JURÍDICA</SelectItem>
                        <SelectItem value="NATURAL">NATURAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className={labelClasses}>Nombre / Razón social</Label>
                    <Input
                      name="nombre"
                      defaultValue={editingPersona?.nombre_razon_social ?? ""}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <Label className={labelClasses}>RUC (solo jurídicas)</Label>
                    <Input name="ruc" 
                      defaultValue={(editingPersona as any)?.ruc ?? ""} 
                      className={inputClasses} 
                      placeholder="###########" />
                  </div>
                  <div>
                    <Label className={labelClasses}>Teléfono</Label>
                    <Input name="telefono" 
                      defaultValue={(editingPersona as any)?.telefono ?? ""} 
                      className={inputClasses} />
                  </div>
                  <div className="md:col-span-2">
                    <Label className={labelClasses}>Correo</Label>
                    <Input name="correo" 
                    defaultValue={(editingPersona as any)?.correo ?? ""} 
                    className={inputClasses} 
                    type="email" />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Dirección (opcional)</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <Label className={labelClasses}>Tipo de vía</Label>
                        <Input name="via_tipo" 
                          defaultValue={(editingPersona as any)?.via_tipo ?? ""} 
                          className={inputClasses} 
                          placeholder="Av., Jr., Psje., Calle…" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className={labelClasses}>Nombre de vía</Label>
                        <Input name="via_nombre" 
                          defaultValue={(editingPersona as any)?.via_nombre ?? ""} 
                          className={inputClasses} 
                          placeholder="Ej. AV. PERÚ" />
                      </div>
                      <div>
                        <Label className={labelClasses}>Número</Label>
                        <Input name="numero" 
                          defaultValue={(editingPersona as any)?.numero ?? ""} 
                          className={inputClasses} />
                      </div>
                      <div>
                        <Label className={labelClasses}>Interior</Label>
                        <Input name="interior" 
                          defaultValue={(editingPersona as any)?.interior ?? ""} 
                          className={inputClasses} 
                          placeholder="Dpto., Int., Of." />
                      </div>
                      <div>
                        <Label className={labelClasses}>MZ</Label>
                        <Input name="mz" 
                          defaultValue={(editingPersona as any)?.mz ?? ""} 
                          className={inputClasses} />
                      </div>
                      <div>
                        <Label className={labelClasses}>LT</Label>
                        <Input name="lt" 
                          defaultValue={(editingPersona as any)?.lt ?? ""} 
                          className={inputClasses} />
                      </div>
                      <div className="md:col-span-2">
                        <Label className={labelClasses}>Otros</Label>
                        <Input name="otros" 
                          defaultValue={(editingPersona as any)?.otros ?? ""} 
                          className={inputClasses} placeholder="Referencia adicional" />
                      </div>
                      <div className="md:col-span-3">
                        <Label className={labelClasses}>Urb./AA.HH./Otros</Label>
                        <Input name="urb_aa_hh_otros" 
                          defaultValue={(editingPersona as any)?.urb_aa_hh_otros ?? ""} 
                          className={inputClasses} placeholder="Urbanización, AA.HH., etc." />
                      </div>
                      <div>
                        <Label className={labelClasses}>Distrito</Label>
                        <Input name="distrito" 
                          defaultValue={(editingPersona as any)?.distrito ?? ""} 
                          className={inputClasses} />
                      </div>
                      <div>
                        <Label className={labelClasses}>Provincia</Label>
                        <Input name="provincia" 
                          defaultValue={(editingPersona as any)?.provincia ?? ""} 
                          className={inputClasses} />
                      </div>
                      <div>
                        <Label className={labelClasses}>Departamento</Label>
                        <Input name="departamento" 
                          defaultValue={(editingPersona as any)?.departamento ?? ""} 
                          className={inputClasses} />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      onClick={() => setOpenPersona(false)}
                      variant="outline"
                      disabled={personaSaving}
                      className="text-xs sm:text-sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={personaSaving}
                      className="text-xs sm:text-sm font-medium"
                    >
                      {personaSaving
                        ? "Guardando…"
                        : editingPersona?.id_persona
                        ? "Guardar cambios"
                        : "Crear"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="representantes">
        <Card className="rounded-2xl shadow">
          <CardHeader>
            <CardTitle>Representantes</CardTitle>
            <CardDescription>Gestión solo para Personas JURÍDICAS</CardDescription>
            {selectedPersonaId != null && (
              <div className="mt-1 text-sm text-gray-700">
                Persona seleccionada:{" "}
                <span className="font-semibold">
                  {personasById.get(selectedPersonaId)?.nombre_razon_social ?? `ID ${selectedPersonaId}`}
                </span>
              </div>
            )}            
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="grow">
              </div>
              <Button
                onClick={onOpenNewRep}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
              >
                <Plus size={18} /> Nueva
              </Button>
            </div>

            {!!repsLoading && <div className="px-4 py-2 text-sm text-gray-500">Cargando representantes…</div>}
            {!!repsError && <div className="px-4 py-2 text-sm text-red-600">{repsError}</div>}

            <div className="overflow-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Representante</th>
                    <th className="px-4 py-3 font-semibold">Tipo Doc.</th>
                    <th className="px-4 py-3 font-semibold">N° Documento</th>
                    <th className="px-4 py-3 font-semibold">Persona (JUR.)</th>
                    <th className="px-4 py-3 font-semibold">RUC</th>
                    <th className="px-4 py-3 font-semibold">SUNARP</th>
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
                            <Button size="sm" 
                              onClick={() => onOpenEditRep(row)}
                              variant="outline" 
                              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                              title="Editar representante"
                            >
                              <Edit2 size={16} /> Editar
                            </Button>
                            <Button size="sm" 
                              onClick={() => onDeleteRep(row.id_representante)}
                              disabled={deleting}
                              variant="outline" 
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
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Dialog open={openRep} onOpenChange={setOpenPersona}>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRep?.id_representante ? "Editar representante" : "Nuevo representante"}
                  </DialogTitle>
                  <DialogDescription>
                    Completa los campos para {editingRep?.id_representante ? "Editar representante" : "Crear nuevo representante"}.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmitRep} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-sm font-medium">Persona JURÍDICA</Label>
                    <Select
                      name="id_persona"
                      defaultValue={
                        String(
                          editingRep?.id_persona ??
                          selectedPersonaId ??
                          (juridicas[0]?.id_persona || "")
                        )
                      }                      
                      required
                    >
                      <SelectTrigger className="w-full"> 
                        <SelectValue placeholder="Selecciona una Persona Jurídica" /> 
                      </SelectTrigger>

                      <SelectContent>
                        {juridicas.map((p) => (
                          <SelectItem 
                            key={p.id_persona} 
                            value={String(p.id_persona)}>
                            {p.nombre_razon_social} — RUC {(p as any).ruc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-sm font-medium">Nombres del representante</Label>
                    <Input
                      name="nombres"
                      defaultValue={editingRep?.nombres ?? ""}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. JUAN PEREZ GOMEZ"
                      required
                    />
                  </div>

                  <div>
                    <Label className="mb-1 block text-sm font-medium">Tipo de documento</Label>
                    <Select
                      name="tipo_documento"
                      defaultValue={editingRep?.tipo_documento ?? "DNI"}
                      required
                    >
                      <SelectTrigger className="w-full"> 
                        <SelectValue placeholder="Selecciona tipo de documento" /> 
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_TYPES.map((t) => (
                          <SelectItem 
                            key={t.value} 
                            value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1 block text-sm font-medium">Número de documento</Label>
                    <Input
                      name="numero_documento"
                      defaultValue={editingRep?.numero_documento ?? ""}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm tabular-nums"
                      placeholder="########"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="mb-1 block text-sm font-medium">SUNARP (Partida / Asiento)</Label>
                    <Input
                      name="sunarp"
                      defaultValue={editingRep?.sunarp_partida_asiento ?? ""}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Ej. Partida 13001234 - Asiento B1002"
                    />
                  </div>

                  <DialogFooter className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      onClick={() => setOpenRep(false)}
                      variant="outline"
                      disabled={repSaving}
                      className="text-xs sm:text-sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={repSaving}
                      className="text-xs sm:text-sm font-medium"
                    >
                      {repSaving
                        ? "Guardando…"
                        : editingRep?.id_representante
                        ? "Guardar cambios"
                        : "Crear"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>  
  );
}