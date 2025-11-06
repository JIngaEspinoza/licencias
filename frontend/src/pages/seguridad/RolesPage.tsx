import { useEffect, useState } from "react";
import { rolesApi } from "../../services/rolesService";
import { permisosApi } from "../../services/permisosService";
import { rolePermisoApi } from "../../services/role-permisoService";

import { Permiso } from "@/types/Permiso";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";
import { Play, Plus, Pencil, Trash2, Shield, Users, Key, Edit2, Search  } from "lucide-react";
import { Toast } from "../../lib/toast";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import { Role } from "@/types/Role";
import { RolePermiso } from "@/types/Role-permiso";
import { Badge } from "../../types/components/ui/badge";
import { Checkbox } from "../../types/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Button } from "../../types/components/ui/button";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function RolesPage() {
    const [q, setQ] = useState("");
    const dq = useDebounce(q, 400);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [deletingIds, setDeletingIds] = useState<{ rol: Record<number, boolean> }>({
        rol: {}
    });

    // Role
    const [totalRole, setTotalRole] = useState(0);
    const [roleRows, setRoleRows] = useState<Role[]>([]);

    const [openRole, setOpenRole] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleSaving, setRoleSaving] = useState(false);

    // Role-permiso
    const [rolePermisoRows, setRolePermisoRows] = useState<RolePermiso[]>([]);

    // Permisos
    const [permisoRows, setPermisoRows] = useState<Permiso[]>([]); 

    async function loadData() {
        const [permisoResponse, roleResponse, rolePermisoResponse] = await Promise.all([
            await permisosApi.listWithoutPagination(),
            await rolesApi.list(dq, page, limit),
            await rolePermisoApi.list()
        ]);

        setRoleRows(roleResponse.data);
        setTotalRole(roleResponse.total);

        setPermisoRows(permisoResponse);

        setRolePermisoRows(rolePermisoResponse);
        
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


    function permisosOfRole(rid: number): Permiso[] {
        const ids = rolePermisoRows.filter(rp => rp.roleId === rid).map(rp => rp.permisoId);
        return permisoRows.filter(p => ids.includes(p.id));
    }

    function EditorPermisosDeRol({role, allPerms, selectedPermIds, onChangePerms}: {
        role: Role; allPerms: Permiso[]; selectedPermIds: number[]; onChangePerms: (ids: number[]) => void;
    }) {
        const [ids, setIds] = useState<number[]>(selectedPermIds);
        const [saving, setSaving] = useState(false);

        async function togglePersist(permId: number, checked: boolean) {
        const prev = ids;
        const next = checked ? [...ids, permId] : ids.filter(x => x !== permId);

        setIds(next);
        onChangePerms(next);

        try {
            setSaving(true);
            if (checked) {
            await rolePermisoApi.create({ roleId: role.id, permisoId: permId });
            } else {
            await rolePermisoApi.removeByComposite({ roleId: role.id, permisoId: permId });
            }
        } catch (err) {
            setIds(prev);
            onChangePerms(prev);
            console.error(err);
            alert("No se pudo guardar el cambio de permiso.");
        } finally {
            setSaving(false);
        }
        }

        return (
        <div className="border rounded-xl px-3 py-2 bg-zinc-50">
            <div className="text-xs mb-2 font-medium">Permisos de {role.nombre}</div>

            <div className="flex flex-wrap gap-2 max-w-[540px]">
            {allPerms.map(p => {
                const checked = ids.includes(p.id);
                return (
                <label key={p.id} className="flex items-center gap-2 border rounded-xl px-2 py-1">
                    <Checkbox
                    checked={checked}
                    onCheckedChange={(state: CheckedState) =>
                        togglePersist(p.id, state === true)
                    }
                    disabled={saving}
                    />
                    <span className="text-sm">{p.nombre}</span>
                </label>
                );
            })}
            </div>

            <div className="flex justify-end mt-2">
            <Button size="sm" className="rounded-xl" onClick={() => onChangePerms(ids)} disabled={saving}>
                Guardar permisos
            </Button>
            </div>
        </div>
        );
    }

    function setPermsForRole(roleId: number, permisoIds: number[]) {
        setRolePermisoRows(prev => {
        const remaining = prev.filter(rp => rp.roleId !== roleId);
        let base = remaining.length ? Math.max(...remaining.map(r => r.id)) : 0;
        const toAdd: RolePermiso[] = permisoIds.map((pid, i) => ({ id: base + i + 1, roleId, permisoId: pid }));
        return [...remaining, ...toAdd];
        });
    }

    function CrearRol({ onCreate }: { onCreate: (nombre: string) => void }) {
        const [nombre, setNombre] = useState("");
        return (
            <div className="flex gap-2 items-end">
            <div>
                <Label>Nombre del rol</Label>
                <Input placeholder="ADMIN" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <Button className="rounded-xl" onClick={() => { onCreate(nombre.trim()); setNombre(""); }}>
                <Plus className="w-4 h-4 mr-2"/> Crear
            </Button>
            </div>
        );
    }

    async function createRole(nombre: string) {
        const name = nombre.trim();
        if (!name) return;

        if (roleRows.some(r => r.nombre.toLocaleLowerCase() === name.toLowerCase())) {
            await swalError("Ese rol ya existe");
        }

        try {
            const created = await rolesApi.create({nombre: nombre});
            setRoleRows(prev => [...prev, created]);
        } catch (e: any) {
            if (e?.status === 409) {
                await swalError(e?.message ?? "El rol ya existe");
                return;
            }
            throw e;
        }
    }

    async function deleteRole(id: number, nombre: string) {
        const ok = await swalConfirm({
            title: "¿Eliminar rol?",
            text: `Se eliminará "${nombre}". Esta acción no se puede deshacer.`,
            icon: "warning",
            confirmButtonText: "Sí, eliminar",
        });
        if (!ok) return;

        setDeletingIds((prev) => ({ ...prev, rol: { ...prev.rol, [id]: true } }));
        try {
            await rolesApi.remove(id);
            Toast.fire({ icon: "warning", title: "Rol eliminado" });

            const { data, total } = await rolesApi.list(dq, page, limit);
            setRoleRows(data);
            setTotal(total);

        } catch (err: any) {
            await swalError(err?.message ?? "Error al eliminar rol");
        } finally {
            setDeletingIds((prev) => ({ ...prev, rol: { ...prev.rol, [id]: false } }));
        }
    }

    function EditorRol({ role, onSave, onCancel }: { role: Role; onSave: (r: Role) => void; onCancel: () => void }) {
        const [nombre, setNombre] = useState(role.nombre);
        return (
            <div className="border rounded-2xl p-4 space-y-3 bg-zinc-50">
            <h3 className="font-semibold">Renombrar rol #{role.id}</h3>
            <div>
                <Label>Nombre</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" className="rounded-xl" onClick={onCancel}>Cancelar</Button>
                <Button className="rounded-xl" onClick={() => onSave({ ...role, nombre })}>Guardar</Button>
            </div>
            </div>
        );
    }

    function updateRole(r: Role) {
        setRoleRows(prev => prev.map(x => x.id === r.id ? r : x));
        setEditingRole(null);
    }

    return (
        <Card className="rounded-2xl shadow">
            <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Administra los roles y sus permisos</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="flex items-end gap-3 flex-wrap">
                  <div className="grow">
                    <Label htmlFor="buscarR">Buscar por nombre</Label>
                    <Input id="buscarR" placeholder="ADMIN" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
                  </div>
                  <CrearRol onCreate={createRole} />
                </div>

                <div className="overflow-auto border rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="text-left p-3">Id</th>
                                <th className="text-left p-3">Nombre</th>
                                <th className="text-left p-3">Permisos</th>
                                <th className="text-right p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roleRows.map((r) => {
                            const deleting = !!deletingIds.rol[r.id];
                            return (
                                <tr key={r.id} className="border-t">
                                <td className="p-3">{r.id}</td>
                                <td className="p-3">{r.nombre}</td>
                                <td className="p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {permisosOfRole(r.id).map(p => (
                                        <Badge key={p.id} className="rounded-2xl px-3 py-1">
                                            {p.nombre}
                                        </Badge>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <EditorPermisosDeRol
                                            role={r}
                                            allPerms={permisoRows}
                                            selectedPermIds={rolePermisoRows.filter(rp => rp.roleId === r.id).map(rp => rp.permisoId)}
                                            onChangePerms={(ids) => setPermsForRole(r.id, ids)}
                                        />
                                        
                                        <Button size="sm" 
                                            variant="outline" 
                                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                            onClick={() => setEditingRole(r)}><Pencil className="w-4 h-4 mr-1"/>Renombrar</Button>
                                        
                                        <Button 
                                            onClick={() => deleteRole(r.id, r.nombre)}
                                            disabled={deleting}
                                            className={cn(
                                                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] sm:text-xs font-medium",
                                                deleting
                                                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                                    : "border-red-300 text-red-600 hover:bg-red-50"
                                            )}
                                            size="sm" 
                                            variant="outline"
                                            ><Trash2 className="w-4 h-4 mr-1"/>Eliminar</Button>
                                    </div>
                                </td>
                                </tr>
                            )
                            })}
                        </tbody>
                    </table>
                </div>
                {editingRole && (
                  <EditorRol key={editingRole.id} role={editingRole} onSave={updateRole} onCancel={() => setEditingRole(null)} />
                )}
            </CardContent>
        </Card>        
    );
}