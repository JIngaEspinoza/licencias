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

// ===== UI helpers =====
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

function isoNow() { return new Date().toISOString(); }

export default function UsuariosPage() {
  const [tab, setTab] = useState<"usuarios" | "roles" | "permisos">("usuarios");
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
  const [deletingIds, setDeletingIds] = useState<{ usr: Record<number, boolean>; per: Record<number, boolean>; rol: Record<number, boolean> }>({
    usr: {},
    per: {},
    rol: {}
  });

  // Users
  const [UserRows, setUserRows] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Permisos
  const [permisoRows, setPermisoRows] = useState<Permiso[]>([]);  

  // Role
  const [totalRole, setTotalRole] = useState(0);
  const [roleRows, setRoleRows] = useState<Role[]>([]);

  const [openRole, setOpenRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);

  // Role-permiso
  const [rolePermisoRows, setRolePermisoRows] = useState<RolePermiso[]>([]);

  // User-role
  const [userRoleRows, SetUserRoleRows] = useState<UserRole[]>([]);

  async function loadData() {
    const [usuarioResponse, permisoResponse, roleResponse, rolePermisoResponse, userRoleResponse] = await Promise.all([
      await usersApi.list(dq, page, limit),
      await permisosApi.list(dq, page, limit),
      await rolesApi.list(dq, page, limit),
      await rolePermisoApi.list(),
      await userRoleApi.list()
    ]);

    setUserRows(usuarioResponse.data);
    setTotal(usuarioResponse.total);

    setPermisoRows(permisoResponse.data);
    setTotal(roleResponse.total);
    
    setRoleRows(roleResponse.data);
    setTotalRole(roleResponse.total);

    setRolePermisoRows(rolePermisoResponse);
    SetUserRoleRows(userRoleResponse);
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

  function updateUser(u: User) {
    setUserRows(prev => prev.map(x => x.id === u.id ? { ...u, updatedAt: isoNow() } : x));
    setEditingUser(null);
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

  function rolesOfUser(uid: number): Role[] {
    const ids = userRoleRows.filter(ur => ur.userId === uid).map(ur => ur.roleId);
    console.log(ids);
    return roleRows.filter(r => ids.includes(r.id));
  }

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

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6" /> Módulo de Seguridad</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm shadow",
            tab === "usuarios"
              ? "bg-black text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
          onClick={() => setTab("usuarios")}
        >
          <Users size={18} /> Usuarios
        </button>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm shadow",
            tab === "roles"
              ? "bg-black text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
          onClick={() => setTab("roles")}
        >
          <Key size={18} /> Roles
        </button>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm shadow",
            tab === "permisos"
              ? "bg-black text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
          onClick={() => setTab("permisos")}
        >
          <Key size={18} /> Permisos
        </button>
      </div>

      {/* Usuarios */}
      {tab === "usuarios" && (
        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
              <p className="text-sm text-gray-500">Listado de Usuarios</p>
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
                  placeholder="Buscar por usuario"
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
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Activo</th>
                  <th className="text-left p-3">Roles</th>
                  <th className="text-left p-3">Creado</th>
                  <th className="text-left p-3">Actualizado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                  {UserRows.map((u) => {
                    const deleting = !!deletingIds.usr[u.id];
                    return (
                      <tr key={u.id} className="border-t last:border-b">
                        <td className="p-3">{u.id}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                          <Switch checked={u.activo} onCheckedChange={(v) => updateUser({ ...u, activo: !!v })} />
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {rolesOfUser(u.id).map(r => (
                              <Badge key={r.id} className="rounded-2xl px-3 py-1">
                                {r.nombre}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">{u.createdAt}</td>
                        <td className="p-3">{u.updatedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              
                              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                              title="Editar usuario" >
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
                              title="Eliminar usuario" >
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
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Roles */}
      {tab === "roles" && (
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
                              onClick={() => onOpenEditPermiso(r)}
                              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                              title="Editar permiso" >
                              <Edit2 size={16} /> Editar
                            </button>
                            <button
                              onClick={() => onDeletePermiso(r.id, r.nombre)}
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
      )}

      {/* Permisos */}
      {tab === "permisos" && (
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

          {/* Modal permiso */}

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
      )}
    </div>
  );
}