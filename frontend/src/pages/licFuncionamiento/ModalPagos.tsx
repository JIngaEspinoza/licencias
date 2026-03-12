import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../types/components/ui/dialog"; 
import { CreditCard, Printer, CheckCircle2, Coins, Calendar, Hash, Loader2, AlertCircle, Save } from "lucide-react";
import { Button } from "../../types/components/ui/button";
import { pago_tramiteApi } from "../../services/pago_tramite";

interface ModalPagosProps {
  isOpen: boolean;
  onClose: () => void;
  idExpediente: number | null;
  mode?: 'view' | 'edit';
  // Cambiamos onSuccess por onGuardar para recibir los datos en el padre
  onGuardar?: (data: { id_expediente: number, concepto: string, nro_recibo: string, fecha_pago: string, monto: number }) => Promise<void>;
}

export const ModalPagos = ({ isOpen, onClose, idExpediente, mode = 'view', onGuardar }: ModalPagosProps) => {
  const [loading, setLoading] = useState(false);
  const [pago, setPago] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nro_recibo: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    concepto: 'DERECHO DE TRÁMITE DE LICENCIA'
  });

  useEffect(() => {
    if (isOpen && idExpediente) {
      if (mode === 'view') {
        cargarDetallePago();
      } else {
        setFormData({
          nro_recibo: '',
          monto: '',
          fecha_pago: new Date().toISOString().split('T')[0],
          concepto: 'DERECHO DE TRÁMITE DE LICENCIA'
        });
        setError(null);
        setPago(null);
      }
    }
  }, [isOpen, idExpediente, mode]);

  const cargarDetallePago = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pago_tramiteApi.getDetallePago(idExpediente!);
      setPago(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      setError("No se pudo obtener la información del pago.");
    } finally {
      setLoading(false);
    }
  };

  // Esta función ahora solo prepara los datos y los envía al padre
  const handleConfirmarGuardado = async () => {
    if (!idExpediente || !formData.nro_recibo || !formData.monto) return;
    
    try {
      setLoading(true);
      if (onGuardar) {
        await onGuardar({
          id_expediente: idExpediente,
          concepto: formData.concepto,
          nro_recibo: formData.nro_recibo,
          fecha_pago: formData.fecha_pago,
          monto: Number(formData.monto)
        });
      }
      onClose(); // Se cierra tras la ejecución exitosa en el padre
    } catch (err: any) {
      setError(err.message || "Error al procesar el registro");
    } finally {
      setLoading(false);
    }
  };

  /*const formatFechaView = (fechaISO) => {
    if (!fechaISO) return "---";
    const datePart = fechaISO.split('T')[0];
    const [year, month, day] = datePart.split('-');
    
    return `${day}/${month}/${year}`;
  };*/

  function formatFechaView(iso: string | undefined) {
    if (!iso) return "—";
    try {
      // 1. Extraemos solo la parte de la fecha YYYY-MM-DD
      // Esto ignora cualquier "T00:00:00Z" que cause desfases
      const datePart = iso.split('T')[0]; 
      const [year, month, day] = datePart.split('-');

      // 2. Retornamos el formato peruano manualmente
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      
      return iso;
    } catch {
      return iso;
    }
  }

  const formatMontoView = (monto: any) => {
    const num = parseFloat(monto);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const montoNumerico = mode === 'edit' ? parseFloat(formData.monto || "0") : parseFloat(pago?.monto || "0");
  const tienePagoValido = !isNaN(montoNumerico) && montoNumerico > 0;

  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1 block ml-0.5";
  const inputBase = "w-full h-10 px-3 border border-slate-200 rounded-lg text-[11px] font-bold outline-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[480px] p-0 border-none overflow-hidden bg-white shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-5 text-white bg-[#0f766e]">
          <DialogTitle className="text-[13px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2">
            <CreditCard size={18} />
            {mode === 'edit' ? 'Registrar Pago de Trámite' : 'Derecho de Trámite y Pago'}
          </DialogTitle>
          <DialogDescription className="text-teal-50/70 text-[10px] uppercase font-bold tracking-wider">
             Expediente Referencia: <span className="text-white font-black">{idExpediente}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 min-h-[300px] flex flex-col justify-center">
          {loading && mode === 'view' ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <Loader2 className="animate-spin text-[#0f766e]" size={32} />
              <span className="text-[10px] font-black uppercase text-slate-400">Consultando Tesorería...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-10 text-rose-500">
              <AlertCircle size={32} />
              <span className="text-[11px] font-bold text-center">{error}</span>
              <Button variant="ghost" size="sm" onClick={mode === 'view' ? cargarDetallePago : () => setError(null)} className="mt-2 uppercase text-[10px]">Reintentar</Button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-500">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${tienePagoValido ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                {tienePagoValido ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="text-[11px] font-black uppercase">
                  {tienePagoValido ? 'Información de Pago Validada' : 'Esperando registro de pago'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClasses}>Concepto de Pago</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold uppercase text-slate-700">
                    {mode === 'edit' ? formData.concepto : (pago?.concepto || "Derecho de Trámite")}
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Nro. Operación / Recibo</label>
                  {mode === 'edit' ? (
                    <input 
                      className={inputBase}
                      value={formData.nro_recibo}
                      onChange={(e) => setFormData({...formData, nro_recibo: e.target.value.toUpperCase()})}
                      placeholder="Ej: 0045812"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <Hash size={14} className="text-slate-400" />
                      <span className="text-[11px] font-bold">{pago?.nro_recibo || '---'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClasses}>Fecha de Pago</label>
                  {mode === 'edit' ? (
                    <input 
                      type="date"
                      className={inputBase}
                      value={formData.fecha_pago ? formData.fecha_pago.substring(0, 10) : ''}
                      onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-[11px] font-bold">
                        {pago?.fecha_pago ? formatFechaView(pago.fecha_pago) : '---'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className={labelClasses}>Monto a Recaudar (S/)</label>
                  {mode === 'edit' ? (
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-lg font-black text-[#0f766e]">S/</span>
                      <input 
                        type="number"
                        className="w-full h-12 pl-10 pr-4 border-2 border-[#0f766e]/20 rounded-xl text-xl font-black text-[#0f766e] outline-[#0f766e]"
                        value={formData.monto}
                        onChange={(e) => setFormData({...formData, monto: e.target.value})}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-[#0f766e]/5 border border-[#0f766e]/20 rounded-xl shadow-inner">
                      <div className="flex items-center gap-2">
                         <Coins size={20} className="text-[#0f766e]" />
                         <span className="text-[10px] font-black text-[#0f766e]">PEN</span>
                      </div>
                      <span className="text-2xl font-black text-[#0f766e]">
                        S/ {formatMontoView(pago?.monto)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          {mode === 'view' ? (
            <Button 
              variant="outline" 
              className="h-9 text-[10px] font-black uppercase border-slate-300" 
              disabled={!tienePagoValido}
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          ) : (
            <Button 
              className="h-9 text-[10px] font-black uppercase bg-[#0f766e] hover:bg-[#0d635d] shadow-lg shadow-teal-900/20"
              disabled={loading || !formData.nro_recibo || !formData.monto}
              onClick={handleConfirmarGuardado}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Registro
            </Button>
          )}
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