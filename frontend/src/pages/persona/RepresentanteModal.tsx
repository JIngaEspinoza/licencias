import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../types/components/ui/dialog"; 
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Button } from "../../types/components/ui/button";
import { swalError, swalSuccess } from "../../utils/swal";
import { representantesApi } from "../../services/representantes";
import { Toast } from "../../lib/toast";
import type { Personas } from "@/types/persona";
import { Search, Loader2, Building2, Check, ChevronsUpDown, X } from "lucide-react";

// --- COMPONENTE INTERNO: BUSCADOR DE EMPRESA ---
const EmpresaSearchSelector = ({ juridicas, value, onChange }: any) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJuridicas = useMemo(() => {
    if (!searchTerm) return juridicas;
    return juridicas.filter((p: any) =>
      p.nombre_razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ruc?.includes(searchTerm)
    );
  }, [juridicas, searchTerm]);

  // Comparación robusta usando String para evitar fallos entre Number/String
  const selectedPersona = juridicas.find((p: any) => String(p.id_persona) === String(value));

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-9 flex items-center justify-between rounded-lg border px-3 text-[11px] font-bold transition-all bg-white 
          ${open ? 'border-[#0f766e] ring-1 ring-[#0f766e]/10' : 'border-slate-300'} 
          ${selectedPersona ? 'text-slate-800' : 'text-slate-400'}`}
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 size={14} className={selectedPersona ? "text-[#0f766e]" : "text-slate-400"} />
          <span className="truncate">
            {selectedPersona 
              ? `${selectedPersona.nombre_razon_social} — ${selectedPersona.ruc}` 
              : "BUSCAR EMPRESA POR NOMBRE O RUC..."}
          </span>
        </div>
        <ChevronsUpDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-2.5 text-slate-400" size={13} />
              <input
                autoFocus
                placeholder="Escribe RUC o Razón Social..."
                className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-md text-[11px] font-bold outline-none focus:border-[#0f766e] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-slate-200 rounded-md text-slate-400">
              <X size={14} />
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredJuridicas.length > 0 ? (
              filteredJuridicas.map((p: any) => (
                <button
                  key={p.id_persona}
                  type="button"
                  onClick={() => {
                    onChange(String(p.id_persona));
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left mb-0.5 transition-colors ${
                    String(value) === String(p.id_persona) 
                      ? "bg-teal-50 text-[#0f766e]" 
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] font-black leading-tight uppercase truncate">
                      {p.nombre_razon_social}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold italic">
                      RUC: {p.ruc}
                    </span>
                  </div>
                  {String(value) === String(p.id_persona) && (
                    <Check size={14} className="text-[#0f766e] shrink-0 ml-2" />
                  )}
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                No hay resultados
              </div>
            )}
          </div>
        </div>
      )}
      <input type="hidden" name="id_persona" value={value} />
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
interface RepresentanteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRep: any;
  juridicas: any[];
  onSuccess?: (data: any) => void;
  setSelectedPersonaId?: (id: number | null) => void;
  selectedPersonaId?: number | null;
  setReps?: React.Dispatch<React.SetStateAction<any[]>>;
}

export const RepresentanteModal = ({
  open,
  onOpenChange,
  editingRep,
  juridicas,
  onSuccess,
  setSelectedPersonaId,
  selectedPersonaId,
  setReps
}: RepresentanteModalProps) => {
  
  const [repSaving, setRepSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<string>("");
  const [repDocTipo, setRepDocTipo] = useState("DNI");
  const [repDocNumero, setRepDocNumero] = useState("");
  const [isSearchingSunat, setIsSearchingSunat] = useState(false);

  const maxLength = repDocTipo === "DNI" ? 8 : 9;
  const labelClasses = "text-[10px] font-black text-slate-800 uppercase tracking-tight mb-1.5 block ml-0.5";
  const inputClasses = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 font-bold";

  // --- EFECTO CLAVE PARA EDICIÓN Y SINCRONIZACIÓN ---
  useEffect(() => {
    if (open) {
      if (editingRep) {
        setEmpresaId(String(editingRep.id_persona));
        setRepDocTipo(editingRep.tipo_documento || "DNI");
        setRepDocNumero(editingRep.numero_documento || "");
      } else {
        // Si es nuevo y tenemos una persona seleccionada en el contexto padre, la pre-seleccionamos
        setEmpresaId(selectedPersonaId ? String(selectedPersonaId) : "");
        setRepDocNumero("");
        setRepDocTipo("DNI");
      }
    }
  }, [editingRep, open, selectedPersonaId]);

  const onSearchSunat = async () => {
    if (repDocNumero.length < 8) return;
    setIsSearchingSunat(true);
    setTimeout(() => setIsSearchingSunat(false), 1500); 
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!juridicas || juridicas.length === 0) return swalError("No hay empresas cargadas.");

    const f = new FormData(e.currentTarget);
    const payload = {
      id_persona: Number(empresaId),
      nombres: String(f.get("nombres")).trim(),
      tipo_documento: repDocTipo,
      numero_documento: repDocNumero.trim(),
      sunarp_partida_asiento: String(f.get("sunarp")).trim(),
    };

    const personaSeleccionada = juridicas.find(p => String(p.id_persona) === String(payload.id_persona));

    if (!payload.id_persona) return swalError("Selecciona una empresa vinculada");
    if (personaSeleccionada?.tipo_persona !== "JURIDICA") return swalError("Solo se asignan representantes a PERSONAS JURÍDICAS");
    if (!payload.nombres) return swalError("Ingresa nombres del representante");
    if (!payload.numero_documento) return swalError("Ingresa número de documento");

    setRepSaving(true);
    try {
      let response;
      if (editingRep?.id_representante) {
        response = await representantesApi.update(editingRep.id_representante, payload);
        swalSuccess("Representante actualizado");
      } else {
        const created = await representantesApi.create(payload);
        
        // Actualizar estados del padre si existen
        if (setSelectedPersonaId && !selectedPersonaId) {
          setSelectedPersonaId(payload.id_persona);
        }

        if (setReps) {
          setReps((prev) => {
            const map = new Map(prev.map((r) => [r.id_representante, r]));
            map.set(created.id_representante, created);
            return Array.from(map.values());
          });
        }
        response = created;
        Toast.fire({ icon: "success", title: "Representante creado" });
      }

      if (onSuccess) onSuccess(response);
      onOpenChange(false);
    } catch (err: any) {
      swalError(err?.message ?? "Error al procesar");
    } finally {
      setRepSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 border-none overflow-hidden bg-white shadow-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-5 text-white bg-[#0f766e]">
          <DialogTitle className="text-[13px] font-black uppercase tracking-[0.1em] flex items-center gap-2 text-white">
            {editingRep?.id_representante ? "📝 Editar Representante" : "🤝 Nuevo Representante"}
          </DialogTitle>
          <DialogDescription className="text-teal-50/70 text-[10px] uppercase font-bold tracking-wider">
            Datos del Representante Legal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-12">
            
            {/* SECTOR: EMPRESA CON BUSCADOR */}
            <div className="md:col-span-12">
              <Label className={labelClasses}>Empresa / Persona Jurídica vinculada</Label>
              <EmpresaSearchSelector juridicas={juridicas} value={empresaId} onChange={setEmpresaId} />
            </div>

            {/* SECTOR: DOCUMENTO */}
            <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-1.5">
              <label className={labelClasses}>Buscador de Identidad</label>
              <div className="flex items-center h-9 w-full shadow-sm">
                <select
                  className="w-20 h-full rounded-l-lg border border-slate-300 bg-slate-50 px-2 text-[11px] font-black focus:border-[#0f766e] outline-none border-r-0"
                  value={repDocTipo}
                  onChange={(e) => { setRepDocTipo(e.target.value); setRepDocNumero(""); }}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">C.E.</option>
                </select>
                <input
                  className="flex-1 h-full border border-slate-300 bg-white px-3 text-[11px] font-black tracking-widest focus:border-[#0f766e] focus:z-10 outline-none border-r-0"
                  placeholder={repDocTipo === "DNI" ? "8 DÍGITOS" : "9 DÍGITOS"}
                  maxLength={maxLength}
                  value={repDocNumero}
                  onChange={(e) => setRepDocNumero(e.target.value.replace(/\D/g, ""))}
                />
                <div className="h-full px-2 border border-slate-300 bg-white flex items-center border-l-0 border-r-0">
                  <span className="text-[9px] font-black text-slate-400 tabular-nums">
                    {repDocNumero.length}/{maxLength}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSearchSunat}
                  disabled={isSearchingSunat || repDocNumero.length < 8}
                  className="h-full px-3 flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-r-lg hover:bg-slate-200 disabled:opacity-50 transition-all"
                >
                  {isSearchingSunat ? <Loader2 size={13} className="animate-spin text-[#0f766e]" /> : <Search size={13} className="text-slate-400" />}
                  <span className="text-[10px] font-black uppercase">SUNAT</span>
                </button>
              </div>
            </div>

            {/* SECTOR: NOMBRES */}
            <div className="md:col-span-12">
              <Label className={labelClasses}>Nombres y Apellidos</Label>
              <Input name="nombres" defaultValue={editingRep?.nombres ?? ""} className={inputClasses} placeholder="EJ. JUAN PEREZ GOMEZ" required />
            </div>

            {/* SECTOR: SUNARP */}
            <div className="md:col-span-12">
              <Label className={labelClasses}>Poderes SUNARP (Partida / Asiento)</Label>
              <Input name="sunarp" defaultValue={editingRep?.sunarp_partida_asiento ?? ""} className={inputClasses} placeholder="Ej. Partida 1100XXXX - Asiento B000X" />
              <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase italic">* Verifique la vigencia de poderes en SUNARP.</p>
            </div>
            
          </div>

          <DialogFooter className="mt-8 gap-3 border-t border-slate-100 pt-6">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" className="h-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Cancelar
            </Button>
            <Button type="submit" disabled={repSaving} className="h-10 bg-[#0f766e] text-white text-[10px] font-black uppercase tracking-widest px-8 shadow-lg active:scale-95 transition-all">
              {repSaving ? <Loader2 size={14} className="animate-spin" /> : (editingRep ? "GUARDAR CAMBIOS" : "REGISTRAR REPRESENTANTE")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};