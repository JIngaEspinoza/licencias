import { useEffect, useState } from "react";
import { usersApi } from "../../services/usersService";
import { rolesApi } from "../../services/rolesService";
import { permisosApi } from "../../services/permisosService";
import { rolePermisoApi } from "../../services/role-permisoService";
import { userRoleApi } from "../../services/users-roleService";

import { Permiso } from "@/types/Permiso";
import { User } from "@/types/User";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";
import { motion } from "framer-motion";
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
import { Switch } from "../../types/components/ui/switch";
import { UserRole } from "@/types/User-role";

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

    return (
        <div className="min-h-[90vh] w-full p-6">
            <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
                    <p className="text-sm text-gray-500">Listado de Roles</p>
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
                        <th className="text-left p-3">Permisos</th>
                        <th className="text-left p-3">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                        {roleRows.map((r) => {
                        const deleting = !!deletingIds.rol[r.id];
                        return (
                            <tr key={r.id} className="border-t last:border-b">
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
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                <EditorPermisosDeRol
                                    role={r}
                                    allPerms={permisoRows}
                                    selectedPermIds={rolePermisoRows.filter(rp => rp.roleId === r.id).map(rp => rp.permisoId)}
                                    onChangePerms={(ids) => setPermsForRole(r.id, ids)}
                                    />
                                <button
                                    
                                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                                    title="Editar permiso" >
                                    <Edit2 size={16} /> Editar
                                </button>
                                <button
                                    
                                    disabled={deleting}
                                    className={cn(
                                    "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] sm:text-xs font-medium",
                                    deleting
                                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                        : "border-red-300 text-red-600 hover:bg-red-50"
                                    )}
                                    title="Eliminar rol" >
                                    <Trash2 size={16} />
                                    {deleting ? "Eliminando…" : "Eliminar"}
                                </button>
                                </div>
                            </td>
                            </tr>
                        )
                        })}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );

}