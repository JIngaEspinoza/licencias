import React, { useState } from 'react';
import { CheckCircle2, Circle, FileText, CreditCard, AlertCircle, X, ChevronRight } from 'lucide-react';

interface ValidationPanelProps {
  expediente: {
    id: string;
    // Agrega aquí otras propiedades si las usas, ej: nombre: string;
  } | null;
  onClose: () => void;
}

const ValidationPanel = ({ expediente, onClose }: ValidationPanelProps) => {
  // Estado para simular los checks de validación
  const [validations, setValidations] = useState({
    pago: false,
    anexos: false,
    itse: false
  });

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l border-zinc-200 z-50 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* CABECERA */}
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-zinc-900 font-bold text-lg">Validar Expediente</h2>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{expediente?.id || 'EXP-2026-00145'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        {/* STEPPER MINIATURA */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
          <span className="text-[#0f766e]">Registro</span>
          <ChevronRight size={12} />
          <span className="text-zinc-900 underline decoration-[#0f766e] decoration-2">Validación</span>
          <ChevronRight size={12} />
          <span>Emisión</span>
        </div>
      </div>

      {/* CONTENIDO DE VALIDACIÓN */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* PASO 3: VALIDACIÓN DE PAGO */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-[#0f766e]" />
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">Validación de Pago (Paso 3)</h3>
          </div>
          
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-600">Recibo N° 458920</span>
              <span className="text-[10px] font-bold text-[#0f766e] bg-[#0f766e]/10 px-2 py-0.5 rounded">S/ 185.00</span>
            </div>
            <button 
              onClick={() => setValidations({...validations, pago: !validations.pago})}
              className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                validations.pago ? 'bg-green-600 text-white' : 'bg-white border-2 border-zinc-200 text-zinc-500 hover:border-[#0f766e] hover:text-[#0f766e]'
              }`}
            >
              {validations.pago ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {validations.pago ? 'Pago Verificado' : 'Marcar como Pagado'}
            </button>
          </div>
        </section>

        {/* PASO 4: VALIDACIÓN DE ANEXOS */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#0f766e]" />
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">Revisión de Anexos (Paso 4)</h3>
          </div>
          
          <div className="space-y-2">
            {['Vigencia de Poder', 'Plano de Distribución', 'Certificado ITSE'].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors group">
                <span className="text-xs text-zinc-600">{doc}</span>
                <div className="flex gap-2">
                  <button className="text-[9px] font-bold text-[#0f766e] uppercase opacity-0 group-hover:opacity-100 transition-opacity">Ver PDF</button>
                  <input type="checkbox" className="accent-[#0f766e] h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALERTA DE OBSERVACIÓN */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <AlertCircle className="text-amber-600 shrink-0" size={18} />
          <div>
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">¿Hay inconsistencias?</p>
            <p className="text-[10px] text-amber-700 leading-tight">Si el pago o los documentos no coinciden, registra la resolución de sanción.</p>
            <button className="mt-2 text-[10px] font-bold text-amber-600 underline uppercase">Generar Resolución</button>
          </div>
        </div>
      </div>

      {/* FOOTER - ACCIÓN FINAL */}
      <div className="p-6 border-t border-zinc-100 bg-white">
        <button 
          disabled={!validations.pago}
          className={`w-full h-12 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
            validations.pago 
              ? 'bg-[#0f766e] text-white shadow-[#0f766e]/20 hover:bg-[#0a5a54]' 
              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
          }`}
        >
          {validations.pago ? 'Pasar a Emisión de Licencia' : 'Pendiente de Validación'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ValidationPanel;