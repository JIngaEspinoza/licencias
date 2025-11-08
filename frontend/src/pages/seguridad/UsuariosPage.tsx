import { useEffect, useState } from "react";
import { usersApi } from "../../services/usersService";
import { rolesApi } from "../../services/rolesService";
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
import { Button } from "../../types/components/ui/button";
import { Switch } from "../../types/components/ui/switch";
import { UserRole } from "@/types/User-role";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function isoNow() { return new Date().toISOString(); }

function nextId(list: { id: number }[]) {
  return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
}

export default function UsuariosPage() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<{ usr: Record<number, boolean>; rol: Record<number, boolean> }>({
    usr: {},
    rol: {}
  });
  const [savingActive, setSavingActive] = useState<Record<number, boolean>>({});

  // Users
  const [usersRows, setUsersRows] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // User-role
  const [userRoleRows, SetUserRoleRows] = useState<UserRole[]>([]);

  // Role
  const [totalRole, setTotalRole] = useState(0);
  const [roleRows, setRoleRows] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Role-permiso
  const [rolePermisoRows, setRolePermisoRows] = useState<RolePermiso[]>([]);

  // Permisos
  const [permisoRows, setPermisoRows] = useState<Permiso[]>([]);

  async function loadData() {
    const [usuarioResponse, roleResponse, userRoleResponse] = await Promise.all([
      await usersApi.list(dq, page, limit),
      await rolesApi.listWithoutPagination(),
      await userRoleApi.list()
    ]);

    setUsersRows(usuarioResponse.data);
    setTotal(usuarioResponse.total);

    setRoleRows(roleResponse);

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

  async function createUser(data: { email: string; passwordHash: string; activo: boolean; roleIds?: number[] }) {
    const email = data.email.trim();
      if (!email) return;

    if (usersRows.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      await swalError("Ese email ya existe (local)");
      throw new Error("Email duplicado en el estado local");
    }

    try {
      const created = await usersApi.create({
        email,
        passwordHash: data.passwordHash,
        activo: data.activo,
      });

      setUsersRows(prev => [...prev, created]);
      Toast.fire({ icon: "success", title: "Usuario creado" });
      return created;

    } catch (e: any) {
      const status = e?.status as number | undefined;

      if (status === 409) {
        await swalError(e.message || "Email ya registrado");
      } else if (status === 400 || status === 422) {
        const detail =
          Array.isArray(e?.details?.message) ? e.details.message.join("\n") :
          (e?.details?.message || e.message);
        await swalError(detail || "Datos inválidos");
      } else if (status === 500) {
        await swalError("Error interno del servidor");
      } else {
        await swalError(e?.message || "No se pudo crear el usuario");
      }

      throw e;
    }

  }

  function CrearUsuario({ onCreate }: { onCreate: (data: { email: string; passwordHash: string; activo: boolean }) => void }) {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [activo, setActivo] = useState(true);

    return (
      <div className="flex gap-2 items-end flex-wrap">
        <div>
          <Label>Email</Label>
          <Input className="w-80" placeholder="nuevo@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <Label>Contraseña</Label>
          <Input type="password" placeholder="hash o placeholder" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        </div>

        <Button           
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
          onClick={() => { 
            onCreate({ email, passwordHash: pwd || "hash-placeholder", activo }); 
            setActivo(true); }}>
          <Plus className="w-4 h-4 mr-2"/> Crear
        </Button>
      </div>
    );
  }

  function updateUser(u: User) {
    setUsersRows(prev => prev.map(x => x.id === u.id ? { ...u, updatedAt: isoNow() } : x));
    setEditingUser(null);
  }

  function rolesOfUser(uid: number): Role[] {
    const ids = userRoleRows.filter(ur => ur.userId === uid).map(ur => ur.roleId);
    return roleRows.filter(r => ids.includes(r.id));
  }

  async function deleteUser(id: number, nombre: string) {
    const ok = await swalConfirm({
        title: "¿Eliminar usuario?",
        text: `Se eliminará "${nombre}". Esta acción no se puede deshacer.`,
        icon: "warning",
        confirmButtonText: "Sí, eliminar",
    });
    if (!ok) return;

    setDeletingIds((prev) => ({ ...prev, usr: { ...prev.usr, [id]: true } }));
    try {
      await usersApi.remove(id);
      Toast.fire({ icon: "warning", title: "Usuario eliminado" });

      const { data, total } = await usersApi.list(dq, page, limit);
      setUsersRows(data);
      setTotal(total);

    } catch (err: any) {
      await swalError(err?.message ?? "Error al eliminar rol");
    } finally {
      setDeletingIds((prev) => ({ ...prev, usr: { ...prev.usr, [id]: false } }));
    }

    /*setUsersRows(prev => prev.filter(x => x.id !== id));
    SetUserRoleRows(prev => prev.filter(ur => ur.userId !== id));*/
  }

  function Pill({ children }: { children: React.ReactNode }) {
    return <Badge className="rounded-2xl px-3 py-1">{children}</Badge>;
  }

  function EditorUsuario({ user, onSave, onCancel, allRoles, selectedRoleIds, onChangeRoles }: {
    user: User; 
    onSave: (u: User) => void; 
    onCancel: () => void; 
    allRoles: Role[]; 
    selectedRoleIds: number[]; 
    onChangeRoles: (ids: number[]) => void;
  }) {
    const [email, setEmail] = useState(user.email);
    const [pwd, setPwd] = useState("");
    const [activo, setActivo] = useState(user.activo);
    const [roleIds, setRoleIds] = useState<number[]>(selectedRoleIds);
    const [saving, setSaving] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);

    async function toggleRole(id: number) {
      setRoleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    async function handleSave () {
      setSaving(true);
      try {
        const payload = { email, activo };

        const savedUser = await usersApi.update(user.id, payload);
        const userId = savedUser.id;

        const prev = selectedRoleIds.map(Number);
        const next = roleIds.map(Number);

        const toAdd = next.filter(id => !prev.includes(id));
        const toRemove = prev.filter(id => !next.includes(id));

        await Promise.all(toAdd.map(rid =>
          userRoleApi.create({ userId, roleId: rid})
        ));

        await Promise.all(toRemove.map(rid => 
          userRoleApi.removeByComposite({ userId, roleId: rid})
        ))

        onChangeRoles(roleIds);
        onSave({ ...user, ...savedUser });
      } catch (err: any) {
        await swalError(err?.message ?? "Error al guardar usuario");
      } finally {
        setSaving(false);
      }
    
    }

    async function handleChangePassword() {
      if (!user?.id || !pwd) return;
      setSavingPwd(true);
      try {
        // Ajusta a tu API real:
        await usersApi.changePassword(user.id, pwd);
        Toast.fire({ icon: "success", title: "Contraseña actualizada" });
        setPwd("");
      } catch (err: any) {
        await swalError(err?.message ?? "No se pudo cambiar la contraseña");
      } finally {
        setSavingPwd(false);
      }
    }

    return (
      <div className="border rounded-2xl p-4 space-y-3 bg-zinc-50">
        <h3 className="font-semibold">Editar usuario #{user.id}</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Nueva contraseña (opcional)</Label>
            <Input type="password" value={pwd}
              onChange={e => setPwd(e.target.value)} placeholder="Dejar en blanco para no cambiar" />
          </div>
          <div>
            <Button
              className="rounded-xl ml-auto"
              onClick={handleChangePassword}
              disabled={!pwd || savingPwd || !user?.id}
              title={!pwd ? "Ingresa una nueva contraseña" : ""}
            >
              {savingPwd ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label>Activo</Label>
            <Switch checked={activo} onCheckedChange={(v) => setActivo(!!v)} />
          </div>
        </div>
        <div>
          <Label>Roles</Label>
          <div className="flex flex-wrap gap-3">
            {allRoles.map(r => (
              <label key={r.id} className="flex items-center gap-2 border rounded-xl px-3 py-2">
                <Checkbox checked={roleIds.includes(r.id)} onCheckedChange={() => toggleRole(r.id)} />
                <span>{r.nombre}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" className="rounded-xl" onClick={onCancel}>Cancelar</Button>
          <Button className="rounded-xl" 
            onClick={handleSave}
            disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
        </div>
      </div>
    );
  }

  function setUserRolesFor(userId: number, roleIds: number[]) {
    // eliminar los existentes de ese usuario
    SetUserRoleRows(prev => {
      const remaining = prev.filter(ur => ur.userId !== userId);
      const toAdd: UserRole[] = roleIds.map(rid => ({ id: nextId([...remaining]), userId, roleId: rid }));
      // asegurar ids únicos incrementales
      let base = remaining.length ? Math.max(...remaining.map(r => r.id)) : 0;
      const withIds = toAdd.map((r, i) => ({ ...r, id: base + i + 1 }));
      return [...remaining, ...withIds];
    });
  }

  async function toggleUserActive(u: User, next: boolean) {
    const prevRows = usersRows;
    setUsersRows(rows =>
      rows.map(x => (x.id === u.id ? { ...x, activo: next, updatedAt: isoNow() } : x))
    );
    setSavingActive(s => ({ ...s, [u.id]: true }));

    try {
      await usersApi.update(u.id, { activo: next });
      const { data, total } = await usersApi.list(dq, page, limit);
      setUsersRows(data); setTotal(total);
    } catch (err: any) {
      setUsersRows(prevRows);
      await swalError(err?.message ?? "No se pudo actualizar el estado");
    } finally {
      setSavingActive(s => ({ ...s, [u.id]: false }));
    }
  }

  return (
    <Card className="rounded-2xl shadow">
        <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Administra los Usuarios</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="grow">
                <Label htmlFor="buscarR">Buscar por nombre</Label>
                <Input id="buscarR" placeholder="ADMIN" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
              </div>
              <CrearUsuario onCreate={createUser} />
            </div>

            <div className="overflow-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Activo</th>
                    <th className="text-left p-3">Roles</th>
                    <th className="text-left p-3">Creado</th>
                    <th className="text-left p-3">Actualizado</th>
                    <th className="text-right p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usersRows.map((u) => {
                    const deleting = !!deletingIds.usr[u.id];
                    return (
                      <tr key={u.id} className="border-t">
                        <td className="p-3">{u.id}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                          <Switch checked={u.activo} 
                          onCheckedChange={(v) => toggleUserActive(u, !!v)}
                          disabled={!!savingActive[u.id]}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {rolesOfUser(u.id).map(r => <Pill key={r.id}>{r.nombre}</Pill>)}
                          </div>
                        </td>
                        <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
                        <td className="p-3">{new Date(u.updatedAt).toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" 
                              onClick={() => setEditingUser(u)}
                              variant="outline" 
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              ><Pencil className="w-4 h-4 mr-1"/>Editar</Button>

                            <Button size="sm" 
                              onClick={() => deleteUser(u.id, u.email)}
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

            {editingUser && (
              <EditorUsuario
                key={editingUser.id}
                user={editingUser}
                onCancel={() => setEditingUser(null)}
                onSave={updateUser}
                allRoles={roleRows}
                selectedRoleIds={userRoleRows.filter(ur => ur.userId === editingUser.id).map(ur => ur.roleId)}
                onChangeRoles={(roleIds) => setUserRolesFor(editingUser.id, roleIds)}
              />
            )}
        </CardContent>
    </Card>        
);


}