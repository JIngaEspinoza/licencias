type Props = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, limit, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(total, page * limit);

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="text-gray-600">
        Mostrando <b>{start}</b>–<b>{end}</b> de <b>{total}</b>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
        >
          «
        </button>
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span className="px-2">Página {page} / {totalPages}</span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
        >
          »
        </button>
      </div>
    </div>
  );
}