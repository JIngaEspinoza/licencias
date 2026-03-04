import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../types/components/ui/dialog"; 
import { FileText, Calendar, Hash, Loader2, Save, X } from "lucide-react";
import { Button } from "../../types/components/ui/button";

interface ModalResolucionProps {
  isOpen: boolean;
  onClose: () => void;
  idExpediente: number | null;
  onGuardar: (data: { id_expediente: number, numero_resolucion: string, fecha_resolucion: string, numero_certificado: string }) => Promise<void>;
}

export const ModalResolucion = ({ isOpen, onClose, idExpediente, onGuardar }: ModalResolucionProps) => {
  const [loading, setLoading] = useState(false);
  const [nroResolucion, setNroResolucion] = useState("");
  const [fechaResolucion, setFechaResolucion] = useState("");
  const [nroCertificado, setCertificado] = useState("");

  const handleSubmit = async () => {
    if (!nroResolucion || !fechaResolucion || !nroCertificado) return;
    
    try {
      setLoading(true);
      await onGuardar({
        id_expediente: Number(idExpediente),
        numero_resolucion: nroResolucion,
        fecha_resolucion: fechaResolucion,
        numero_certificado: nroCertificado
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar resolución", error);
    } finally {
      setLoading(false);
    }
  };

  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1 block ml-0.5";
  const inputClasses = "w-full p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[420px] p-0 border-none overflow-hidden bg-white shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* HEADER - Color Azul Pizarra para diferenciarlo de Pagos (Teal) */}
        <DialogHeader className="p-5 text-white bg-slate-800">
          <DialogTitle className="text-[13px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2">
            <FileText size={18} />
            Emisión de Resolución
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">
             Expediente Referencia: <span className="text-white">{idExpediente}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* CAMPO: NÚMERO DE RESOLUCIÓN */}
          <div>
            <label className={labelClasses}>Número de Resolución</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="EJ. RES-001-2024-SG"
                className={`${inputClasses} pl-9`}
                value={nroResolucion}
                onChange={(e) => setNroResolucion(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {/* CAMPO: NÚMERO DE CERTIFICADO */}
          <div>
            <label className={labelClasses}>Número de Certificado</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="EJ. CERT-0001"
                className={`${inputClasses} pl-9`}
                value={nroCertificado}
                onChange={(e) => setNroCertificado(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {/* CAMPO: FECHA DE RESOLUCIÓN */}
          <div>
            <label className={labelClasses}>Fecha de Emisión</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-slate-400" size={14} />
              <input
                type="date"
                className={`${inputClasses} pl-9`}
                value={fechaResolucion}
                onChange={(e) => setFechaResolucion(e.target.value)}
              />
            </div>
          </div>

          {/* NOTA INFORMATIVA */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
             <div className="text-blue-500 mt-0.5">
                <FileText size={16} />
             </div>
             <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
               Asegúrese de que los datos coincidan con el documento físico. Una vez guardado, se actualizará el estado del expediente.
             </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button 
            variant="ghost" 
            className="h-9 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200"
            onClick={onClose}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          
          <Button 
            className="h-9 px-8 text-[10px] font-black uppercase bg-[#0f766e] hover:bg-[#0d6d65] text-white rounded-lg shadow-lg shadow-teal-900/20 transition-all"
            onClick={handleSubmit}
            disabled={loading || !nroResolucion || !fechaResolucion}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Registrar Resolución
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};