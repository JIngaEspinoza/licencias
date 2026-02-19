import * as React from "react";
import { Search, Loader2, Check, X, Trash2, FolderSearch } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../types/components/ui/dialog"; 

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type Expediente = {
  id_expediente: number;
  numero: string;
  ruc?: string | null;
  razon_social?: string | null;
  solicitante?: string | null;
  estado: "EN_EVALUACION" | "OBSERVADO" | "APROBADO" | "RECHAZADO" | string;
};

type Query = { numero: string; ruc: string; razon_social: string; };

type Props = {
  trigger: React.ReactNode;
  onPick: (exp: Expediente) => void;
  fetchExpedientes: (q: Query) => Promise<Expediente[]>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
};

export default function BuscarExpedienteDialog({
  trigger, onPick, fetchExpedientes, open: externalOpen, onOpenChange, contentClassName
}: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [query, setQuery] = React.useState<Query>({ numero: "", ruc: "", razon_social: "" });
  const [results, setResults] = React.useState<Expediente[]>([]);
  const [selected, setSelected] = React.useState<Expediente | null>(null);
  const [loading, setLoading] = React.useState(false);

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setSelected(null);
      setResults([]);
      setQuery({ numero: "", ruc: "", razon_social: "" });
    }
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  // --- LÓGICA DE COLORES DE ESTADO ---
  const getEstadoStyles = (estado: string, isSelected: boolean) => {
    if (isSelected) return "bg-white/20 text-white border-white/40";

    switch (estado) {
      case "APROBADO":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "OBSERVADO":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "RECHAZADO":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "EN_EVALUACION":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getEstadoLabel = (estado: string) => {
    return estado.replace(/_/g, " ");
  };

  const labelClasses = "text-[10px] font-black text-slate-900 uppercase tracking-tight mb-1 block ml-0.5";
  const inputClasses = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal text-slate-700";

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
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="inline-block" onClick={() => !isControlled && setInternalOpen(true)}>
        {trigger}
      </div>

      <DialogContent 
        className={cx("sm:max-w-[850px] p-0 border-none overflow-hidden bg-white shadow-2xl", contentClassName)}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-5 text-white bg-[#0f766e] space-y-0">
          <DialogTitle className="text-[13px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2">
            <FolderSearch size={18} className="text-teal-200" />
            Buscador de Expedientes
          </DialogTitle>
          <DialogDescription className="text-teal-50/70 text-[10px] uppercase font-bold tracking-wider mt-0.5">
            Gestión de solicitudes y estados de trámite
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="md:col-span-3">
              <label className={labelClasses}>N° Expediente</label>
              <input
                className={cx(inputClasses, "font-mono tracking-wider uppercase")}
                value={query.numero}
                onChange={(e) => setQuery(s => ({ ...s, numero: e.target.value.toUpperCase() }))}
                placeholder="EXP-000"
              />
            </div>
            <div className="md:col-span-3">
              <label className={labelClasses}>RUC / DNI</label>
              <input
                className={cx(inputClasses, "font-mono")}
                value={query.ruc}
                onChange={(e) => setQuery(s => ({ ...s, ruc: e.target.value.replace(/[^0-9]/g, "") }))}
                placeholder="Documento..."
                maxLength={11}
              />
            </div>
            <div className="md:col-span-6">
              <label className={labelClasses}>Razón Social / Solicitante</label>
              <div className="flex gap-2">
                <input
                  className={inputClasses}
                  value={query.razon_social}
                  onChange={(e) => setQuery(s => ({ ...s, razon_social: e.target.value }))}
                  placeholder="Ingrese nombre..."
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 bg-[#0f766e] text-white px-5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-[#0d635d] disabled:opacity-50 flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Buscar
                </button>
              </div>
            </div>

            <div className="md:col-span-12 flex items-center justify-start border-t border-slate-200/50 pt-3">
              <button
                type="button"
                onClick={() => { setQuery({ numero: "", ruc: "", razon_social: "" }); setResults([]); }}
                className="text-[9px] font-black text-slate-400 uppercase hover:text-rose-600 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={12} /> Limpiar filtros
              </button>
            </div>
          </form>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr className="border-b border-slate-200">
                    <th className="p-3 text-[9px] font-black text-slate-900 uppercase tracking-tighter w-12 text-center">Sel.</th>
                    <th className="p-3 text-[9px] font-black text-slate-900 uppercase tracking-tighter w-32">Expediente</th>
                    <th className="p-3 text-[9px] font-black text-slate-900 uppercase tracking-tighter w-32">Documento</th>
                    <th className="p-3 text-[9px] font-black text-slate-900 uppercase tracking-tighter">Interesado</th>
                    <th className="p-3 text-[9px] font-black text-slate-900 uppercase tracking-tighter text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#0f766e] mx-auto mb-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando registros...</span>
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-300 bg-slate-50/20">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40">No hay datos disponibles</p>
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
                            "cursor-pointer transition-all group",
                            isSelected ? "bg-[#0f766e] text-white" : "hover:bg-teal-50/50"
                          )}
                        >
                          <td className="p-3 text-center">
                            <div className={cx(
                              "w-4 h-4 mx-auto rounded-full border-2 flex items-center justify-center transition-all",
                              isSelected ? "border-white bg-white shadow-sm" : "border-slate-300 bg-white group-hover:border-[#0f766e]"
                            )}>
                              {isSelected && <Check size={10} className="text-[#0f766e] stroke-[4px]" />}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[10px] font-bold tracking-wider">{exp.numero}</td>
                          <td className={cx("p-3 text-[10px] font-bold", isSelected ? "text-white" : "text-slate-600")}>
                            {exp.ruc ?? "—"}
                          </td>
                          <td className="p-3 text-[10px] font-black uppercase truncate max-w-[250px]">
                            {exp.razon_social || exp.solicitante}
                          </td>
                          <td className="p-3 text-center">
                            <span className={cx(
                              "px-2 py-0.5 rounded text-[8px] font-black uppercase border transition-colors",
                              getEstadoStyles(exp.estado, isSelected)
                            )}>
                              {getEstadoLabel(exp.estado)}
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

          <div className="mt-6 flex justify-end items-center gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="h-9 px-6 text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={!selected}
              className="h-10 bg-[#0f766e] text-white px-8 rounded-xl font-black text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-teal-900/20 disabled:opacity-20 active:scale-95 transition-all flex items-center gap-2"
            >
              Confirmar Expediente
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}