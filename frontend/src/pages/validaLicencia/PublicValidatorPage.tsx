import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Building2 } from 'lucide-react';

const formatearFecha = (fechaStr: string) => {
  if (!fechaStr) return '---';
  const fecha = new Date(fechaStr);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

export const PublicValidatorPage = () => {
  const { hash } = useParams(); // Captura el hash de la URL
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
  const validarHash = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/public/validar/${hash}`);
      
      if (!response.ok) throw new Error('No encontrado');
      
      const result = await response.json();

      setData(result);
    } catch (error) {
      console.error("Error validando:", error);
      setData(null); // Esto mostrará el mensaje de "No Verificado"
    } finally {
      setLoading(false);
    }
  };

  if (hash) validarHash();
}, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">Verificando autenticidad del documento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Cabecera Institucional */}
        <div className="bg-[#0f766e] p-6 text-center">
          <Building2 className="w-10 h-10 text-teal-200 mx-auto mb-2" />
          <h1 className="text-white font-bold text-lg uppercase tracking-wider">
            Municipalidad de San Miguel
          </h1>
          <p className="text-teal-100 text-xs">Sistema de Validación de Licencias</p>
        </div>

        <div className="p-8">
          {data ? (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Documento Válido</h2>
              <p className="text-slate-500 text-sm mb-6">Esta licencia cuenta con registro oficial.</p>
              
              <div className="bg-slate-50 rounded-lg p-4 text-left space-y-3 border border-slate-100">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Titular / Empresa</label>
                  <p className="text-slate-700 font-semibold uppercase">{data.titular}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Nro Licencia</label>
                    <p className="text-slate-700 font-mono">{data.numero_certificado}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Emisión</label>
                    <p className="text-slate-700">
                      {formatearFecha(data.resolucion_fecha)}
                    </p>
                  </div>
                </div>
              </div>
            </div>            
          ) : (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-1">No Verificado</h2>
              <p className="text-slate-500 text-sm mb-6">El código escaneado no coincide con nuestros registros oficiales.</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
              >
                Reintentar Lectura
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-medium tracking-widest uppercase">Documento Firmado Digitalmente</span>
          </div>
        </div>
      </div>
    </div>
  );
};