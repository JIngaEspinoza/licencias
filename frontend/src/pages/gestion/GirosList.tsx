import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { girosApi, Giro } from "../../services/giros";
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

type Giros = {
  id_giro: number;
  codigo: string;
  nombre: string;
};

const labelClasses = "mb-1 block text-sm font-medium";
const inputClasses = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm";

export default function GirosList() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [rows, setRows] = useState<Giro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [deletingIds, setDeletingIds] = useState<{ giro: Record<string, boolean> }>({
    giro: {}
  });

  const [openGiro, setOpenGiro] = useState(false);
  const [editingGiro, setEditingGiro] = useState<Giros | null>(null);
  const [giroSaving, setGiroSaving] = useState(false);

  const giroById = useMemo(
    () => new Map(rows.map((p) => [p.id_giro, p] as const)),
    [rows]
  );

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const {data, total} = await girosApi.list(dq, page, limit);
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

  const onOpenEditGiro = (row: Giro) => {
    setEditingGiro({ ...row });
    setOpenGiro(true);
  };

  const NUEVA_GIRO_BASE: Giro = {
    id_giro: 0,
    codigo: "", 
    nombre: ""
  };

  const onOpenNewGiro = () => {
    setEditingGiro(NUEVA_GIRO_BASE);
    setOpenGiro(true);
  };

  async function onDeleteGiro(id: number) {
    const p = giroById.get(id);
    const codigo = p?.codigo ?? `ID ${id}`;

    const ok = await swalConfirm({
      title: "¿Eliminar giro?",
      text: `Se eliminará "${codigo}". Esta acción no se puede deshacer.`,
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
    });
    if (!ok) return;

    setDeletingIds((prev) => ({ ...prev, giro: { ...prev.giro, [id]: true } }));
    try {
      await girosApi.remove(id);
      Toast.fire({ icon: "warning", title: "Giro eliminado" });

      const { data, total } = await girosApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

    } catch (err: any) {
      await swalError(err?.message ?? "Error al eliminar el giro");
    } finally {
      setDeletingIds((prev) => ({ ...prev, giro: { ...prev.giro, [id]: false } }));
    }
  }

  const onSubmitGiro: React.FormEventHandler<HTMLFormElement> = async (e) => {
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
      nombre: descripcion
    } as const;

    setGiroSaving(true);
    try {
      if (editingGiro?.codigo) {
        await girosApi.update(editingGiro.id_giro, payload);
        await swalSuccess("Giro actualizada");
      } else {
        await girosApi.create(payload);
        await swalSuccess("Giro creada");
      }

      const { data, total } = await girosApi.list(dq, page, limit);
      setRows(data);
      setTotal(total);

      setOpenGiro(false);
    } catch (err: any) {
      await swalError(err?.message ?? "Error al guardar giro");
    } finally {
      setGiroSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow">
      <CardHeader>
        <CardTitle>Giros</CardTitle>
        <CardDescription>Administra los giros</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="grow">
            <Label htmlFor="buscarR">Buscar por giro</Label>
            <Input id="buscarR" placeholder="" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
          </div>
          <Button
            onClick={onOpenNewGiro}
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
                const deleting = !!deletingIds.giro[u.codigo];
                return (
                  <tr key={u.codigo} className="border-t">
                    <td className="p-3">{u.codigo}</td>
                    <td className="p-3">{u.nombre}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" 
                          onClick={() => onOpenEditGiro(u)}
                          variant="outline" 
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          ><Pencil className="w-4 h-4 mr-1"/>Editar</Button>

                        <Button size="sm" 
                          onClick={() => onDeleteGiro(u.id_giro)}
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

          <Dialog open={openGiro} onOpenChange={setOpenGiro}>
            <DialogContent
              className="sm:max-w-[800px]"
              onInteractOutside={(e) => {
                e.preventDefault(); 
              }}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingGiro?.codigo ? "Editar giro" : "Nueva giro"}
                </DialogTitle>
                <DialogDescription>
                  Completa los campos para {editingGiro?.codigo ? "Editar el giro" : "Crear nuevo giro"}.
                </DialogDescription>
              </DialogHeader>
  
              <form onSubmit={onSubmitGiro} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2 mt-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <Label className={labelClasses}>Código</Label>
                      <Input
                        name="codigo"
                        defaultValue={editingGiro?.codigo ?? ""}
                        className={inputClasses}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className={labelClasses}>Descripción</Label>
                      <Input
                        name="descripcion"
                        defaultValue={editingGiro?.nombre ?? ""}
                        className={inputClasses}
                        required
                      />
                    </div>
                  </div>
                </div>
  
                <DialogFooter className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => setOpenGiro(false)}
                    variant="outline"
                    disabled={giroSaving}
                    className="text-xs sm:text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={giroSaving}
                    className="text-xs sm:text-sm font-medium"
                  >
                    {giroSaving
                      ? "Guardando…"
                      : editingGiro?.codigo
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