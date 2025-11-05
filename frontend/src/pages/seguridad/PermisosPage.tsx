import { Permiso } from "@/types/Permiso";
import Pagination from "../../components/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import { Toast } from "../../lib/toast";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { permisosApi } from "../../services/permisosService";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

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

export default function PermisoPage() {
    const [q, setQ] = useState("");
    const dq = useDebounce(q, 400);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [openPermiso, setOpenPermiso] = useState(false);
    const [editingPermiso, setEditingPermiso] = useState<Permiso | null>(null);
    const [permisoSaving, setPermisoSaving] = useState(false);
    const [deletingIds, setDeletingIds] = useState<{per: Record<number, boolean>}>({
        per: {}
    });

    // Permisos
    const [permisoRows, setPermisoRows] = useState<Permiso[]>([]);  

    async function loadData() {
        const [permisoResponse] = await Promise.all([
            await permisosApi.list(dq, page, limit)
        ]);

        setPermisoRows(permisoResponse.data);
        setTotal(permisoResponse.total);
        
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
            setLoading(true);
            setError("");
            
            loadData()

            } catch (e: any) {
            if (!cancelled) setError(e?.message ?? "Error al cargar");
            } finally {
            if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [dq, page, limit]);

    const onOpenNewPermiso = () => {
        setEditingPermiso({
            id: 0,
            nombre: ""
        } as unknown as Permiso);
        setOpenPermiso(true);
    }

    const onOpenEditPermiso = (row: Permiso) => {
        setEditingPermiso({ ...row });
        setOpenPermiso(true);
    }

    async function onDeletePermiso(id: number, nombre: string) {
        const ok = await swalConfirm({
          title: "¿Eliminar permiso?",
          text: `Se eliminará "${nombre}". Esta acción no se puede deshacer.`,
          icon: "warning",
          confirmButtonText: "Sí, eliminar",
        });
        if (!ok) return;
    
        setDeletingIds((prev) => ({ ...prev, per: { ...prev.per, [id]: true } }));
        try {
          await permisosApi.remove(id);
          Toast.fire({ icon: "warning", title: "Permiso eliminada" });
    
          const { data, total } = await permisosApi.list(dq, page, limit);
          setPermisoRows(data);
          setTotal(total);
    
        } catch (err: any) {
          await swalError(err?.message ?? "Error al eliminar persona");
        } finally {
          setDeletingIds((prev) => ({ ...prev, per: { ...prev.per, [id]: false } }));
        }
    }

    const onSubmitPermiso: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const payload = {
          nombre: String(f.get("nombre") || "").trim()
        } as const;
    
        if (!payload.nombre) {
          await swalError("Ingresa el nombre");
          return;
        }
    
        setPermisoSaving(true);
        try {
          if (editingPermiso?.id) {
            await permisosApi.update(editingPermiso.id, payload);
            await swalSuccess("Permiso actualizada");
          } else {
            await permisosApi.create(payload);
            await swalSuccess("Permiso creada");
          }
    
          const { data, total } = await permisosApi.list(dq, page, limit);
          setPermisoRows(data);
          setTotal(total);
    
          setOpenPermiso(false);
    
        } catch (err: any) {
          await swalError(err?.message ?? "Error al guardar permiso");
        } finally {
          setPermisoSaving(false);
        }    
    }

    return (
        <div className="min-h-[90vh] w-full p-6">           
            <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                    <h1 className="text-2xl font-bold tracking-tight">Permisos</h1>
                    <p className="text-sm text-gray-500">Listado de permisos</p>
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
                        placeholder="Buscar por nombre"
                        className="w-72 rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-xs sm:text-sm outline-none ring-0 transition focus:border-gray-400"
                        />
                    </div>
                    <button
                        onClick={onOpenNewPermiso}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
                    >
                        <Plus size={18} /> Nuevo
                    </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm mb-4">
                    <table className="min-w-full table-auto text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-right p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && permisoRows.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                            No hay resultados.
                            </td>
                        </tr>
                        )}
                        {permisoRows.map((p) => {
                        const deleting = !!deletingIds.per[p.id];
                        return (
                            <tr key={p.id} className="border-t last:border-b">
                            <td className="p-3">{p.id}</td>
                            <td className="p-3">{p.nombre}</td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onOpenEditPermiso(p)}
                                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                                    title="Editar permiso" >
                                    <Edit2 size={16} /> Editar
                                </button>
                                <button
                                    onClick={() => onDeletePermiso(p.id, p.nombre)}
                                    disabled={deleting}
                                    className={cn(
                                    "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] sm:text-xs font-medium",
                                    deleting
                                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                        : "border-red-300 text-red-600 hover:bg-red-50"
                                    )}
                                    title="Eliminar permiso" >
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

                <Modal
                    open={openPermiso}
                    onClose={() => setOpenPermiso(false)}
                    title={editingPermiso?.id ? "Editar permiso" : "Nuevo permiso"}
                >
                    <form onSubmit={onSubmitPermiso} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Nombre</label>
                        <input
                        name="nombre"
                        defaultValue={editingPermiso?.nombre ?? ""}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        required
                        />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                        <button
                        type="button"
                        onClick={() => setOpenPermiso(false)}
                        className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-50"
                        disabled={permisoSaving}
                        > Cancelar
                        </button>

                        <button
                        type="submit"
                        className="rounded-xl bg-black px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                        disabled={permisoSaving}
                        >
                        {permisoSaving
                            ? "Guardando…"
                            : editingPermiso?.id
                            ? "Guardar cambios"
                            : "Crear"}
                        </button>
                    </div>
                    </form>

                </Modal>

            </div>
            
        </div>
    );

}