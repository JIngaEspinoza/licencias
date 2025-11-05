import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expediente, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import Pagination from "../../components/Pagination";

export default function AutorizacionesTemporalesReq(){
  const [showList, setShowList] = useState(false)
  const [listQuery, setListQuery] = useState({ q:'', tipo:'', estado:'', desde:'', hasta:'', page:1, pageSize:10 })
  const [sortBy, setSortBy] = useState('fecha')
  const [sortDir, setSortDir] = useState('desc')
  const [toast, setToast] = useState("")
  const [startItem, setStartItem] = useState(null) // modal de iniciar trámite + adjuntos
  const [q, setQ] = useState("");
    const dq = useDebounce(q, 400);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [error, setError] = useState<string>("");

  const sampleRegistros = [
    { numero:'EXP-2025-0001', tipo:'EPND', estado:'EN_TRAMITE', fecha:'2025-09-01', solicitante:'JURIDICA', nombre:'ACME S.A.C.' },
    { numero:'EXP-2025-0002', tipo:'EPND', estado:'APROBADO', fecha:'2025-08-25', solicitante:'NATURAL', nombre:'Juan Pérez' },
    { numero:'EXP-2025-0010', tipo:'EXPO_PP', estado:'EN_TRAMITE', fecha:'2025-09-10', solicitante:'JURIDICA', nombre:'Eventos Lima S.A.' },
    { numero:'EXP-2025-0020', tipo:'CAMP_PROMO', estado:'DENEGADO', fecha:'2025-07-14', solicitante:'NATURAL', nombre:'María López' },
    { numero:'EXP-2025-0100', tipo:'EPND', estado:'APROBADO', fecha:'2025-06-02', solicitante:'JURIDICA', nombre:'MegaShows S.A.C.' },
    { numero:'EXP-2025-0101', tipo:'EXPO_PP', estado:'APROBADO', fecha:'2025-09-15', solicitante:'JURIDICA', nombre:'ExpoAndes' },
    { numero:'EXP-2025-0102', tipo:'CAMP_PROMO', estado:'EN_TRAMITE', fecha:'2025-09-12', solicitante:'NATURAL', nombre:'Carlos Ruiz' },
    { numero:'EXP-2025-0103', tipo:'EPND', estado:'EN_TRAMITE', fecha:'2025-09-16', solicitante:'JURIDICA', nombre:'Orquesta Azul S.A.C.' },
  ]

  const [rows, setRows] = useState<sampleRegistros[]>([]);

  const [deletingIds, setDeletingIds] = useState<{ rep: Record<number, boolean>; per: Record<number, boolean> }>({
    rep: {},
    per: {},
  });

  // cargar personas desde el servicio
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data, total } = await expedientesApi.list(dq, page, limit);
        if (!cancelled) {
          setRows(data);
          setTotal(total);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error al cargar el listado");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dq, page, limit]);

  /*function applyListFilters(rows){
    const { q, tipo, estado, desde, hasta } = listQuery
    return rows.filter(r =>
      (q ? (r.numero.toLowerCase().includes(q.toLowerCase()) || (r.nombre||'').toLowerCase().includes(q.toLowerCase())) : true) &&
      (tipo ? r.tipo===tipo : true) &&
      (estado ? r.estado===estado : true) &&
      (desde ? r.fecha >= desde : true) &&
      (hasta ? r.fecha <= hasta : true)
    )
  }*/

  //const filtered = applyListFilters(sampleRegistros)
  //const sorted = applySort(filtered)
  //const totalPages = Math.max(1, Math.ceil(sorted.length / listQuery.pageSize))
  //const page = Math.min(listQuery.page, totalPages)
  //const pageRows = sorted.slice((page-1)*listQuery.pageSize, page*listQuery.pageSize)

  /*function findItemByKey(k){
    for(const cat of categorias){
    const it = (cat.items||[]).find(x=>x.key===k)
    if(it) return it
    }
    return null
  }*/

    return (
      <div className="mx-auto max-w-6xl p-5 text-[13.5px] sm:text-[14px]">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Autorizaciones</h1>
              <p className="text-sm text-gray-500">Listado de expedientes</p>
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
                  placeholder="Buscar (n° expediente / persona / RUC)"
                  className="w-72 rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-xs sm:text-sm outline-none ring-0 transition focus:border-gray-400"
                />
              </div>
              <Link 
                to="/licfuncionamiento/nueva"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white 
                    hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                <Plus size={18} /> Nueva
              </Link>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm mb-4">
            {loading && <div className="px-4 py-3 text-sm text-gray-500">Cargando…</div>}
            {error && !loading && <div className="px-4 py-3 text-sm text-red-600">{error}</div>}

            <table className="min-w-full table-auto text-left text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 font-semibold">N° expediente</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Solicitante</th>
                  <th className="px-4 py-3 font-semibold w-[1%] whitespace-nowrap">Acción</th>
                </tr>
              </thead>
              <tbody>
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No hay resultados.
                    </td>
                  </tr>
                )}

                {rows.map((p) => {
                  return (
                    <tr key={p.numero} className="border-t last:border-b">
                      <td className="px-4 py-3 text-gray-500">{p.numero}</td>
                      <td className="px-4 py-3">{p.tipo}</td>
                      <td className="px-4 py-3">{p.estado}</td>
                      <td className="px-4 py-3">{p.fecha}</td>
                      <td className="w-[45%] md:w-[55%] px-4 py-3 font-medium">{p.nombre}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
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
          
      </div>
    );

}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return iso;
  }
}
