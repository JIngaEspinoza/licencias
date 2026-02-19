import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../types/components/ui/dialog"; // Ajusta la ruta según tu proyecto
import { Search, Loader2, CheckCircle2, XCircle, Info } from "lucide-react";

interface ModalSeleccionGiroProps {
  isOpen: boolean;
  onClose: () => void;
  zonificacionDetectada: string;
  girosDisponibles: any[];
  onSelect: (giro: any, compatibilidad: any) => void;
  loading?: boolean;
}

export const ModalSeleccionGiro = ({
  isOpen,
  onClose,
  zonificacionDetectada,
  girosDisponibles,
  onSelect,
  loading = false
}: ModalSeleccionGiroProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTILOS COMPARTIDOS (Basados en tu PersonaModal) ---
  const labelClasses = "text-[10px] font-black text-slate-800 uppercase tracking-tight mb-1.5 block ml-0.5";
  const inputClasses = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal";

  // --- LÓGICA DE FILTRADO ---
  const girosFiltrados = useMemo(() => {
    return girosDisponibles.filter(giro =>
      giro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giro.codigo.includes(searchTerm)
    );
  }, [searchTerm, girosDisponibles]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[650px] p-0 border-none overflow-hidden bg-white shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* HEADER ESTILO PERSONA_MODAL */}
        <DialogHeader className="p-5 text-white bg-[#0f766e]">
          <DialogTitle className="text-[13px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2">
            🔍 Búsqueda de Actividad Económica
          </DialogTitle>
          <DialogDescription className="text-teal-50/70 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
            Zonificación actual detectada: 
            <span className="bg-white/20 px-2 py-0.5 rounded text-white font-black border border-white/30">
              {zonificacionDetectada || "Sin detectar"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* BUSCADOR COMPACTO */}
          <div className="flex flex-col gap-1.5 mb-6">
            <label className={labelClasses}>Filtrar actividad / Código CIIU</label>
            <div className="relative group shadow-sm">
              <input
                autoFocus
                className={`${inputClasses} pl-10 h-10`}
                placeholder="Escriba el nombre del giro o el código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            </div>
          </div>

          {/* LISTADO DE RESULTADOS */}
          <div className="flex flex-col gap-1">
            <label className={labelClasses}>Resultados y Compatibilidad</label>
            <div className="h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 size={24} className="animate-spin mb-2 text-[#0f766e]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Consultando Catastro...</span>
                </div>
              ) : girosFiltrados.length > 0 ? (
                girosFiltrados.map((giro) => {
                  const compatibilidad = giro.giro_zonificacion.find(
                    (gz: any) => gz.zonificacion.codigo === zonificacionDetectada
                  );
                  
                  const esPermitido = compatibilidad?.estado_uso?.codigo === 'H';

                  return (
                    <button
                      key={giro.id_giro}
                      onClick={() => onSelect(giro, compatibilidad)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#0f766e] hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-black text-slate-400 tracking-tighter group-hover:text-[#0f766e]">
                            CIIU: {giro.codigo}
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                            giro.riesgo_base === 'ALTO' || giro.riesgo_base === 'MUY_ALTO' 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            Riesgo: {giro.riesgo_base}
                          </span>
                        </div>
                        <h4 className="text-[11px] font-black text-slate-800 leading-tight uppercase tracking-tight">
                          {giro.nombre}
                        </h4>
                      </div>

                      {/* BADGE DE ESTADO */}
                      <div className="ml-4 flex flex-col items-end min-w-[90px]">
                        {esPermitido ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <span className="text-[9px] font-black tracking-tighter uppercase">Permitido</span>
                            <CheckCircle2 size={16} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-500">
                            <span className="text-[9px] font-black tracking-tighter uppercase text-right leading-none">
                              No Permitido / <br/>Restringido
                            </span>
                            <XCircle size={16} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <Info size={24} className="mb-2 opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-widest">No se encontraron giros</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="h-9 px-6 text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};