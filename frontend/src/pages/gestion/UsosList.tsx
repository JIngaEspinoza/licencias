import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usosApi, Uso } from "../../services/usos";
import Swal from 'sweetalert2';
import { Toast } from "../../lib/toast";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Play, Plus, Pencil, Trash2, Shield, Users, Key, Edit2, Search  } from "lucide-react";
import { Button } from "../../types/components/ui/button";
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

type Usos = {
  codigo: string;
  descripcion?: string;
};

const labelClasses = "mb-1 block text-sm font-medium";
const inputClasses = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm";

export default function UsosList() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [rows, setRows] = useState<Uso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [deletingIds, setDeletingIds] = useState<{ uso: Record<string, boolean> }>({
    uso: {}
  });

  const [openUso, setOpenUso] = useState(false);
  const [editingUso, setEditingUso] = useState<Usos | null>(null);
  const [usoSaving, setUsoSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      //const data = await usosApi.list(q);
      const {data, total} = await usosApi.list(dq, page, limit);
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

  const onSubmitUso: React.FormEventHandler<HTMLFormElement> = async (e) => {
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

    setUsoSaving(true);
    try {
      if (editingUso?.codigo) {
        await usosApi.update(editingUso.codigo, payload);
        await swalSuccess("Uso actualizada");
      } else {
        await usosApi.create(payload);
        await swalSuccess("Uso creada");
      }

      const { data, total } = await usosApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

      setOpenUso(false);
    } catch (err: any) {
      await swalError(err?.message ?? "Error al guardar uso");
    } finally {
      setUsoSaving(false);
    }
  };

  async function onDeleteUso(id: string, descripcion: string) {
    const ok = await swalConfirm({
      title: "¿Eliminar uso?",
      text: `Se eliminará "${descripcion}". Esta acción no se puede deshacer.`,
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
    });
    if (!ok) return;

    setDeletingIds((prev) => ({ ...prev, uso: { ...prev.uso, [id]: true } }));
    try {
      await usosApi.remove(id);
      Toast.fire({ icon: "warning", title: "Uso eliminado" });

      const { data, total } = await usosApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

    } catch (err: any) {
      await swalError(err?.message ?? "Error al eliminar uso");
    } finally {
      setDeletingIds((prev) => ({ ...prev, uso: { ...prev.uso, [id]: false } }));
    }
  }

  const onOpenEditUso = (row: Uso) => {
    setEditingUso({ ...row });
    setOpenUso(true);
  };

  const NUEVA_USO_BASE: Uso = {
    codigo: "", 
    descripcion: ""
  };

  const onOpenNewUso = () => {
    setEditingUso(NUEVA_USO_BASE);
    setOpenUso(true);
  };

  return (
    <Card className="rounded-2xl shadow">
      <CardHeader>
        <CardTitle>Usos</CardTitle>
        <CardDescription>Administra los Usos</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="grow">
            <Label htmlFor="buscarR">Buscar por uso</Label>
            <Input id="buscarR" placeholder="" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
          </div>
          <Button
            onClick={onOpenNewUso}
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
                const deleting = !!deletingIds.uso[u.codigo];
                return (
                  <tr key={u.codigo} className="border-t">
                    <td className="p-3">{u.codigo}</td>
                    <td className="p-3">{u.descripcion}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" 
                          onClick={() => onOpenEditUso(u)}
                          variant="outline" 
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          ><Pencil className="w-4 h-4 mr-1"/>Editar</Button>

                        <Button size="sm" 
                          onClick={() => onDeleteUso(u.codigo, u.descripcion)}
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

        <Dialog open={openUso} onOpenChange={setOpenUso}>
          <DialogContent
            className="sm:max-w-[800px]"
            onInteractOutside={(e) => {
              e.preventDefault(); 
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {editingUso?.codigo ? "Editar uso" : "Nuevo uso"}
              </DialogTitle>
              <DialogDescription>
                Completa los campos para {editingUso?.codigo ? "Editar el uso" : "Crear nuevo uso"}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmitUso} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 mt-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <Label className={labelClasses}>Código</Label>
                    <Input
                      name="codigo"
                      defaultValue={editingUso?.codigo ?? ""}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className={labelClasses}>Descripción</Label>
                    <Input
                      name="descripcion"
                      defaultValue={editingUso?.descripcion ?? ""}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setOpenUso(false)}
                  variant="outline"
                  disabled={usoSaving}
                  className="text-xs sm:text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={usoSaving}
                  className="text-xs sm:text-sm font-medium"
                >
                  {usoSaving
                    ? "Guardando…"
                    : editingUso?.codigo
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