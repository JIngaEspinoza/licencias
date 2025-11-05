import * as React from "react";
import { Search, Loader2, Check, X } from "lucide-react";

/** Helper simple de clases (si prefieres, cambia por tu `cn` de "@/lib/utils") */
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Tipos de datos */
export type Expediente = {
  id_expediente: number;
  numero: string;
  ruc?: string | null;
  razon_social?: string | null;
  solicitante?: string | null;
  estado?: string | null;
};

type Query = {
  numero: string;
  ruc: string;
  razon_social: string;
};

type Props = {
  /** Botón o elemento que abrirá el diálogo */
  trigger: React.ReactNode;
  /** Callback con el expediente seleccionado */
  onPick: (exp: Expediente) => void;
  /** Implementa tu búsqueda real */
  fetchExpedientes: (q: Query) => Promise<Expediente[]>;
  /** Opcionales */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
};

export default function BuscarExpedienteDialog({
  trigger,
  onPick,
  fetchExpedientes,
  defaultOpen = false,
  onOpenChange,
  contentClassName
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState<Query>({ numero: "", ruc: "", razon_social: "" });
  const [results, setResults] = React.useState<Expediente[]>([]);
  const [selected, setSelected] = React.useState<Expediente | null>(null);
  const [loading, setLoading] = React.useState(false);

  const canAccept = !!selected;

  const setOpenSafe = (v: boolean) => {
    setOpen(v);
    if (!v) setSelected(null);
    onOpenChange?.(v);
  };

  // Cerrar con ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSafe(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await fetchExpedientes(query);
      setResults(data);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!selected) return;
    onPick(selected);
    setOpenSafe(false);
  };

  // Clonar trigger para abrir modal
  const triggerNode = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
          (trigger as React.ReactElement).props?.onClick?.(e);
          setOpenSafe(true);
        }
      })
    : <span onClick={() => setOpenSafe(true)} className="inline-block cursor-pointer">{trigger}</span>;

  return (
    <div className="inline-block">
      {triggerNode}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenSafe(false)} />

          {/* Content */}
          <div className={cx("relative z-10 w-full max-w-3xl rounded-xl bg-white p-4 shadow-lg", contentClassName)}>
            {/* Header */}
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Buscar expediente</h2>
              <p className="text-sm text-gray-600">
                Ingresa uno o más criterios. Selecciona un resultado y presiona <strong>Aceptar</strong>.
              </p>
            </div>

            {/* Filtros */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label htmlFor="q-numero" className="mb-1 block text-sm">N° expediente</label>
                <input
                  id="q-numero"
                  className="w-full rounded-md border px-3 py-2"
                  value={query.numero}
                  onChange={(e) => setQuery((s) => ({ ...s, numero: e.target.value }))}
                  placeholder="EXP-2025-000123"
                />
              </div>
              <div>
                <label htmlFor="q-ruc" className="mb-1 block text-sm">RUC</label>
                <input
                  id="q-ruc"
                  className="w-full rounded-md border px-3 py-2"
                  value={query.ruc}
                  onChange={(e) => setQuery((s) => ({ ...s, ruc: e.target.value.replace(/[^0-9]/g, "") }))}
                  inputMode="numeric"
                  placeholder="20123456789"
                  maxLength={11}
                />
              </div>
              <div>
                <label htmlFor="q-razon" className="mb-1 block text-sm">Razón social</label>
                <input
                  id="q-razon"
                  className="w-full rounded-md border px-3 py-2"
                  value={query.razon_social}
                  onChange={(e) => setQuery((s) => ({ ...s, razon_social: e.target.value }))}
                  placeholder="Empresa S.A.C."
                />
              </div>

              <div className="md:col-span-3 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={cx(
                    "inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white",
                    "hover:bg-gray-800 disabled:opacity-60"
                  )}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Buscar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuery({ numero: "", ruc: "", razon_social: "" });
                    setResults([]);
                    setSelected(null);
                  }}
                  className="inline-flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Limpiar
                </button>
              </div>
            </form>

            {/* Resultados */}
            <div className="mt-4 rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="w-[44px] p-3" />
                    <th className="p-3">N° expediente</th>
                    <th className="p-3">RUC</th>
                    <th className="p-3">Razón social</th>
                    <th className="p-3">Solicitante</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Buscando…
                      </td>
                    </tr>
                  )}

                  {!loading && results.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Sin resultados. Ajusta los filtros y vuelve a buscar.
                      </td>
                    </tr>
                  )}

                  {!loading && results.map((exp) => {
                    const isSelected = selected?.id_expediente === exp.id_expediente;
                    return (
                      <tr
                        key={exp.id_expediente}
                        onClick={() => setSelected(exp)}
                        className={cx("cursor-pointer border-t hover:bg-gray-50", isSelected && "bg-blue-50")}
                      >
                        <td className="p-3 align-middle">
                          <span
                            className={cx(
                              "inline-flex h-5 w-5 items-center justify-center rounded-full border",
                              isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                            )}
                            aria-label={isSelected ? "Seleccionado" : "No seleccionado"}
                          >
                            {isSelected ? <Check className="h-3 w-3" /> : null}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{exp.numero}</td>
                        <td className="p-3">{exp.ruc ?? "—"}</td>
                        <td className="p-3">{exp.razon_social ?? "—"}</td>
                        <td className="p-3">{exp.solicitante ?? "—"}</td>
                        <td className="p-3">{exp.estado ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenSafe(false)}
                className="inline-flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={!canAccept}
                className={cx(
                  "inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white",
                  "hover:bg-blue-500 disabled:opacity-60"
                )}
              >
                <Check className="mr-2 h-4 w-4" /> Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}