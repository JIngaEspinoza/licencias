import * as React from "react";
import { Search, Loader2, Check, X, FileText, Trash2 } from "lucide-react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type Expediente = {
  id_expediente: number;
  numero: string;
  ruc?: string | null;
  razon_social?: string | null;
  solicitante?: string | null;
  estado?: string | null;
};

type Query = { numero: string; ruc: string; razon_social: string; };

type Props = {
  trigger: React.ReactNode;
  onPick: (exp: Expediente) => void;
  fetchExpedientes: (q: Query) => Promise<Expediente[]>;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
};

export default function BuscarExpedienteDialog({
  trigger, onPick, fetchExpedientes, defaultOpen = false, onOpenChange, contentClassName
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState<Query>({ numero: "", ruc: "", razon_social: "" });
  const [results, setResults] = React.useState<Expediente[]>([]);
  const [selected, setSelected] = React.useState<Expediente | null>(null);
  const [loading, setLoading] = React.useState(false);

  const setOpenSafe = (v: boolean) => {
    setOpen(v);
    if (!v) { setSelected(null); setResults([]); }
    onOpenChange?.(v);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await fetchExpedientes(query);
      setResults(data);
      setSelected(null);
    } finally { setLoading(false); }
  };

  const handleAccept = () => {
    if (!selected) return;
    onPick(selected);
    setOpenSafe(false);
  };

  const triggerNode = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
          (trigger as React.ReactElement).props?.onClick?.(e);
          setOpenSafe(true);
        }
      })
    : <span onClick={() => setOpenSafe(true)}>{trigger}</span>;

  return (
    <div className="inline-block">
      {triggerNode}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setOpenSafe(false)} />

          <div className={cx(
            "relative z-10 w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden",
            contentClassName
          )}>
            
            {/* HEADER SLIM */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-[#0f766e]/5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-pulse" />
                <h2 className="text-[11px] font-black text-[#0f766e] uppercase tracking-wider">Buscador de Expedientes</h2>
              </div>
              <button onClick={() => setOpenSafe(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* FILTROS CON LABELS NEGRITOS */}
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {[
                  { id: 'numero', label: 'N° Expediente', placeholder: 'EXP-000', mono: true },
                  { id: 'ruc', label: 'RUC / DNI', placeholder: '10...', mono: true },
                  { id: 'razon_social', label: 'Razón Social / Nombre', placeholder: 'Buscar...' }
                ].map((f) => (
                  <div key={f.id} className="flex flex-col gap-1.5">
                    {/* Color Slate-800 para que el label se vea realmente negro y legible */}
                    <label className="text-[10px] font-black text-slate-800 uppercase ml-1 tracking-tight">
                      {f.label}
                    </label>
                    <input
                      className={cx(
                        "h-8 rounded-lg border border-slate-300 bg-slate-50 px-3 text-[11px] font-bold outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 focus:bg-white transition-all",
                        f.mono && "font-mono text-slate-700"
                      )}
                      value={query[f.id as keyof Query]}
                      onChange={(e) => setQuery(s => ({ ...s, [f.id]: f.id === 'ruc' ? e.target.value.replace(/[^0-9]/g, "") : e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}

                <div className="md:col-span-3 flex items-center justify-between mt-1">
                  <button
                    type="button"
                    onClick={() => { setQuery({ numero: "", ruc: "", razon_social: "" }); setResults([]); }}
                    className="text-[9px] font-black text-slate-500 uppercase hover:text-red-500 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={12} /> Limpiar filtros
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-8 bg-[#0f766e] text-white px-5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-[#0d635d] disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                    Buscar
                  </button>
                </div>
              </form>

              {/* TABLA */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="max-h-[280px] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 sticky top-0 z-10">
                      <tr className="border-b border-slate-200">
                        {/* Cabeceras de tabla también más oscuras para coherencia */}
                        <th className="p-3 text-[9px] font-black text-slate-700 uppercase tracking-tighter w-10 text-center">Sel.</th>
                        <th className="p-3 text-[9px] font-black text-slate-700 uppercase tracking-tighter">Expediente</th>
                        <th className="p-3 text-[9px] font-black text-slate-700 uppercase tracking-tighter">Documento</th>
                        <th className="p-3 text-[9px] font-black text-slate-700 uppercase tracking-tighter">Interesado</th>
                        <th className="p-3 text-[9px] font-black text-slate-700 uppercase tracking-tighter text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <Loader2 className="h-5 w-5 animate-spin text-[#0f766e] mx-auto mb-2" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">Consultando base de datos...</span>
                          </td>
                        </tr>
                      ) : results.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            <p className="text-[10px] font-black uppercase italic tracking-widest">Sin resultados</p>
                          </td>
                        </tr>
                      ) : (
                        results.map((exp) => {
                          const isSelected = selected?.id_expediente === exp.id_expediente;
                          return (
                            <tr
                              key={exp.id_expediente}
                              onClick={() => setSelected(exp)}
                              className={cx(
                                "cursor-pointer transition-all group border-b border-transparent",
                                isSelected ? "bg-[#0f766e] text-white" : "hover:bg-slate-50"
                              )}
                            >
                              <td className="p-3 text-center">
                                <div className={cx(
                                  "w-4 h-4 mx-auto rounded-full border-2 flex items-center justify-center transition-all",
                                  isSelected ? "border-white bg-white" : "border-slate-300 bg-white group-hover:border-[#0f766e]"
                                )}>
                                  {isSelected && <Check size={10} className="text-[#0f766e] font-bold" />}
                                </div>
                              </td>
                              <td className="p-3 font-mono text-[10px] font-bold uppercase tracking-tight">{exp.numero}</td>
                              <td className="p-3 text-[10px] font-bold">{exp.ruc ?? "—"}</td>
                              <td className="p-3 truncate max-w-[200px] text-[10px] font-black uppercase">
                                {exp.razon_social || exp.solicitante}
                              </td>
                              <td className="p-3 text-center">
                                <span className={cx(
                                  "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600 border border-slate-300"
                                )}>
                                  {exp.estado ?? "PENDIENTE"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-5 flex justify-end items-center gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenSafe(false)}
                  className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 px-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!selected}
                  className="h-9 bg-[#0f766e] text-white px-6 rounded-lg font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-[#0f766e]/20 disabled:opacity-20 transition-all flex items-center gap-2"
                >
                  Confirmar Selección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}