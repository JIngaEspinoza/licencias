import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { licenciasApi, Licencia } from "../services/licencias";

export default function LicenciasList() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Licencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await licenciasApi.list(q);
      setRows(data);
    } catch (e: any) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar licencia?")) return;
    try {
      await licenciasApi.remove(id);
      fetchData();
    } catch (e: any) {
      alert(e.message || "No se pudo eliminar");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Licencias</h2>
        <Link to="/licencias/nueva" className="px-3 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">
          Nueva Licencia
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Buscar por expediente, estado…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchData()}
        />
        <button onClick={fetchData} className="px-3 py-2 border rounded-lg">Buscar</button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">#</th>
              <th className="p-3">Expediente</th>
              <th className="p-3">Fecha Solicitud</th>
              <th className="p-3">Estado</th>
              <th className="p-3 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-3" colSpan={5}>Cargando…</td></tr>
            )}
            {!loading && rows.map((l) => (
              <tr key={l.id_licencia} className="border-t">
                <td className="p-3">{l.id_licencia}</td>
                <td className="p-3">{l.numero_expediente}</td>
                <td className="p-3">{new Date(l.fecha_solicitud).toLocaleDateString()}</td>
                <td className="p-3">{l.estado}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => navigate(`/licencias/${l.id_licencia}/editar`)}>Editar</button>
                    <button className="px-2 py-1 border rounded" onClick={() => eliminar(l.id_licencia)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td className="p-3 text-gray-500" colSpan={5}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/*import { Link, useNavigate } from 'react-router-dom'

export default function LicenciasList() {
    const navigate = useNavigate()
    const rows = [
        { id: 1, numero_expediente: 'EXP-0001', fecha_solicitud: '2025-08-22', estado: 'PENDIENTE' },
        { id: 2, numero_expediente: 'EXP-0002', fecha_solicitud: '2025-08-15', estado: 'APROBADA' }
    ]

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Licencias</h2>
                <Link to="/licencias/nueva" className="px-3 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">Nueva Licencia</Link>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr className="text-left">
                        <th className="p-3">#</th>
                        <th className="p-3">Expediente</th>
                        <th className="p-3">Fecha Solicitud</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 w-40">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((l) => (
                            <tr key={l.id} className="border-t">
                                <td className="p-3">{l.id}</td>
                                <td className="p-3">{l.numero_expediente}</td>
                                <td className="p-3">{new Date(l.fecha_solicitud).toLocaleDateString()}</td>
                                <td className="p-3">{l.estado}</td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button className="px-2 py-1 border rounded" onClick={() => navigate(`/licencias/${l.id}/editar`)}>Editar</button>
                                        <button className="px-2 py-1 border rounded">Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}*/