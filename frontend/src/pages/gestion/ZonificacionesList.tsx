import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zonificacionesApi, Zonificacion } from "../../services/zonificaciones";
import Swal from 'sweetalert2';
import { Toast } from "../../lib/toast";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Button } from "../../types/components/ui/button";
import { Play, Plus, Pencil, Trash2, Shield, Users, Key, Edit2, Search  } from "lucide-react";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";

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

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type Zonificaciones = {
  id_zonificacion: number;
  codigo: string;
  descripcion: string;
};

const labelClasses = "mb-1 block text-sm font-medium";
const inputClasses = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm";

export default function ZonificacionesList() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [rows, setRows] = useState<Zonificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [deletingIds, setDeletingIds] = useState<{ zon: Record<string, boolean> }>({
    zon: {}
  });

  const [openZonificacion, setOpenZonificacion] = useState(false);
  const [editingZonificacion, setEditingZonificacion] = useState<Zonificaciones | null>(null);
  const [zonificacionSaving, setZonificacionSaving] = useState(false);

  const zonificacionById = useMemo(
    () => new Map(rows.map((p) => [p.id_zonificacion, p] as const)),
    [rows]
  );
  
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      //const data = await zonificacionesApi.list(q);
      const {data, total} = await zonificacionesApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);
    } catch (e: any) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dq, page]);

  const onOpenEditZonificacion = (row: Zonificacion) => {
    setEditingZonificacion({ ...row });
    setOpenZonificacion(true);
  };

  const NUEVA_ZONIFICACION_BASE: Zonificacion = {
    id_zonificacion: 0,
    codigo: "", 
    descripcion: ""
  };

  const onOpenNewZonificacion = () => {
    setEditingZonificacion(NUEVA_ZONIFICACION_BASE);
    setOpenZonificacion(true);
  };

  async function onDeleteZonificacion(id: number) {
    const p = zonificacionById.get(id);
    const codigo = p?.codigo ?? `ID ${id}`;

    const ok = await swalConfirm({
      title: "¿Eliminar zonificación?",
      text: `Se eliminará "${codigo}". Esta acción no se puede deshacer.`,
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
    });
    if (!ok) return;

    setDeletingIds((prev) => ({ ...prev, zon: { ...prev.zon, [id]: true } }));
    try {
      await zonificacionesApi.remove(id);
      Toast.fire({ icon: "warning", title: "Zonificación eliminado" });

      const { data, total } = await zonificacionesApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

    } catch (err: any) {
      await swalError(err?.message ?? "Error al eliminar la Zonificación");
    } finally {
      setDeletingIds((prev) => ({ ...prev, zon: { ...prev.zon, [id]: false } }));
    }
  }

  const onSubmitZonificacion: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const f = new FormData(e.currentTarget);
    const codigo = String(f.get("codigo")).trim();
    const descripcion = String(f.get("descripcion")).trim();

    if (!codigo) {
      await swalError("Ingresa el código");
      return;
    }

    if (!descripcion) {
      await swalError("Ingresa la descripción");
      return;
    }

    const payload = {
      codigo: codigo.toUpperCase(),
      descripcion: descripcion
    } as const;

    setZonificacionSaving(true);
    try {
      if (editingZonificacion?.codigo) {
        await zonificacionesApi.update(editingZonificacion.id_zonificacion, payload);
        await swalSuccess("Zonficación actualizada");
      } else {
        await zonificacionesApi.create(payload);
        await swalSuccess("Zonficación creada");
      }

      const { data, total } = await zonificacionesApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

      setOpenZonificacion(false);
    } catch (err: any) {
      await swalError(err?.message ?? "Error al guardar zonficación");
    } finally {
      setZonificacionSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow">
      <CardHeader>
        <CardTitle>Zonificaciones</CardTitle>
        <CardDescription>Administra las zonificaciones</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="grow">
            <Label htmlFor="buscarR">Buscar por uso</Label>
            <Input id="buscarR" placeholder="" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
          </div>
          <Button
            onClick={onOpenNewZonificacion}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
          >
            <Plus size={18} /> Nuevo
          </Button>
        </div>

         <div className="overflow-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="text-left p-3">Código</th>
                <th className="text-left p-3">Descripción</th>
                <th className="text-right p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const deleting = !!deletingIds.zon[u.codigo];
                return (
                  <tr key={u.codigo} className="border-t">
                    <td className="p-3">{u.codigo}</td>
                    <td className="p-3">{u.descripcion}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" 
                          onClick={() => onOpenEditZonificacion(u)}
                          variant="outline" 
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          ><Pencil className="w-4 h-4 mr-1"/>Editar</Button>

                        <Button size="sm" 
                          onClick={() => onDeleteZonificacion(u.id_zonificacion)}
                          disabled={deleting}
                          variant="outline" 
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] sm:text-xs font-medium",
                            deleting
                              ? "border-gray-300 text-gray-400 cursor-not-allowed"
                              : "border-red-300 text-red-600 hover:bg-red-50"
                          )}
                          ><Trash2 className="w-4 h-4 mr-1"/>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                )
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

          <Dialog open={openZonificacion} onOpenChange={setOpenZonificacion}>
            <DialogContent
              className="sm:max-w-[800px]"
              onInteractOutside={(e) => {
                e.preventDefault(); 
              }}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingZonificacion?.codigo ? "Editar zonificación" : "Nueva zonificación"}
                </DialogTitle>
                <DialogDescription>
                  Completa los campos para {editingZonificacion?.codigo ? "Editar la zonificación" : "Crear nueva zonificación"}.
                </DialogDescription>
              </DialogHeader>
  
              <form onSubmit={onSubmitZonificacion} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2 mt-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <Label className={labelClasses}>Código</Label>
                      <Input
                        name="codigo"
                        defaultValue={editingZonificacion?.codigo ?? ""}
                        className={inputClasses}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className={labelClasses}>Descripción</Label>
                      <Input
                        name="descripcion"
                        defaultValue={editingZonificacion?.descripcion ?? ""}
                        className={inputClasses}
                        required
                      />
                    </div>
                  </div>
                </div>
  
                <DialogFooter className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => setOpenZonificacion(false)}
                    variant="outline"
                    disabled={zonificacionSaving}
                    className="text-xs sm:text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={zonificacionSaving}
                    className="text-xs sm:text-sm font-medium"
                  >
                    {zonificacionSaving
                      ? "Guardando…"
                      : editingZonificacion?.codigo
                      ? "Guardar cambios"
                      : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
  
            </DialogContent>
          </Dialog>

      </CardContent>
    </Card>
  );
}