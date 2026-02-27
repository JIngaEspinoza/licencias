import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../types/components/ui/dialog"; 
import { CreditCard, Printer, CheckCircle2, Coins, Calendar, Hash, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../../types/components/ui/button";
import { pago_tramiteApi } from "../../services/pago_tramite";

interface ModalPagosProps {
  isOpen: boolean;
  onClose: () => void;
  idExpediente: number | null;
}

export const ModalPagos = ({ isOpen, onClose, idExpediente }: ModalPagosProps) => {
  const [loading, setLoading] = useState(false);
  const [pago, setPago] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && idExpediente) {
      cargarDetallePago();
    }
  }, [isOpen, idExpediente]);

  const cargarDetallePago = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pago_tramiteApi.getDetallePago(idExpediente!);
      // Verificamos si la data viene como array o objeto único
      setPago(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      setError("No se pudo obtener la información del pago.");
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fechaISO: string) => {
    if (!fechaISO) return "---";
    const date = new Date(fechaISO);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  // Formateador de moneda para visualización (Devuelve String)
  const formatMontoView = (monto: any) => {
    const num = parseFloat(monto);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // LÓGICA DE VALIDACIÓN (Para evitar el error de comparación)
  const montoNumerico = parseFloat(pago?.monto || "0");
  const tienePagoValido = !isNaN(montoNumerico) && montoNumerico > 0;

  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1 block ml-0.5";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[480px] p-0 border-none overflow-hidden bg-white shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-5 text-white bg-[#0f766e]">
          <DialogTitle className="text-[13px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2">
            <CreditCard size={18} />
            Derecho de Trámite y Pago
          </DialogTitle>
          <DialogDescription className="text-teal-50/70 text-[10px] uppercase font-bold tracking-wider">
             ID Consulta: <span className="text-white">{idExpediente}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <Loader2 className="animate-spin text-[#0f766e]" size={32} />
              <span className="text-[10px] font-black uppercase text-slate-400">Consultando Tesorería...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-10 text-rose-500">
              <AlertCircle size={32} />
              <span className="text-[11px] font-bold text-center">{error}</span>
              <Button variant="ghost" size="sm" onClick={cargarDetallePago} className="mt-2 uppercase text-[10px]">Reintentar</Button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-500">
              {/* BANNER DINÁMICO */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${tienePagoValido ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                {tienePagoValido ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="text-[11px] font-black uppercase">
                  {tienePagoValido ? 'Pago Verificado en Tesorería' : 'Pendiente de Pago / En Proceso'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClasses}>Concepto de Pago</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold uppercase text-slate-700">
                    {pago?.concepto || "Derecho de Trámite"}
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Nro. Operación</label>
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <Hash size={14} className="text-slate-400" />
                    <span className="text-[11px] font-bold">{pago?.nro_recibo || '---'}</span>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Fecha Registro</label>
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-[11px] font-bold">
                      {pago?.fecha_pago ? formatFecha(pago.fecha_pago) : '---'}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className={labelClasses}>Monto Recaudado</label>
                  <div className="flex items-center justify-between p-4 bg-[#0f766e]/5 border border-[#0f766e]/20 rounded-xl shadow-inner">
                    <div className="flex items-center gap-2">
                       <Coins size={20} className="text-[#0f766e]" />
                       <span className="text-[10px] font-black text-[#0f766e]">PEN</span>
                    </div>
                    <span className="text-2xl font-black text-[#0f766e]">
                      S/ {formatMontoView(pago?.monto)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button 
            variant="outline" 
            className="h-9 text-[10px] font-black uppercase border-slate-300" 
            disabled={!tienePagoValido}
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <button 
            onClick={onClose}
            className="h-9 px-8 text-[10px] font-black uppercase bg-slate-800 hover:bg-black text-white rounded-lg transition-all"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};