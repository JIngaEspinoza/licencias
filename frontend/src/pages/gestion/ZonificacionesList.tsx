import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zonificacionesApi, Zonificacion } from "../../services/zonificaciones";
import Swal from 'sweetalert2';
import { Toast } from "../../lib/toast";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";

export default function UsosList() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [rows, setRows] = useState<Zonificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

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

  const eliminar = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar zonificación?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await zonificacionesApi.remove(id);
      // Si borraste el último de la página, retrocede una página
      const nextPage = (rows.length === 1 && page > 1) ? page - 1 : page;
      setPage(nextPage);
      await fetchData();
      Toast.fire({ icon: "success", title: "Eliminado correctamente" });
    } catch (e: any) {
      Toast.fire({ icon: "error", title: e?.message || "No se pudo eliminar" });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Zonificaciones</h2>
        <Link to="/ciudadanos/nueva" className="px-3 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">
          Nueva Zonificación
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Buscar por código y descripción"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <button onClick={() => { setPage(1); fetchData(); }} className="px-3 py-2 border rounded-lg">
          Buscar
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Código</th>
              <th className="p-3">Descripción</th>
              <th className="p-3 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-3" colSpan={5}>Cargando…</td></tr>
            )}
            {!loading && rows.map((l) => (
              <tr key={l.codigo} className="border-t">
                <td className="p-3">{l.codigo}</td>
                <td className="p-3">{l.descripcion}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => navigate(`/ciudadanos/${l.codigo}/editar`)}>Editar</button>
                    <button className="px-2 py-1 border rounded" onClick={() => eliminar(l.codigo)}>Eliminar</button>
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

      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

    </section>
  );
}