import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../types/components/ui/select";
import { Search, Loader2 } from "lucide-react";

// Asumo que estas utilidades están disponibles en tu proyecto
// Si no, asegúrate de importarlas correctamente
// import { personasApi } from "@/api/personas"; 
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";
import { personasApi } from "../../services/personas";

interface PersonaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPersona: any;
  onSuccess?: (persona: any) => void; // Para devolver la persona creada/editada
}

export const PersonaModal = ({
  open,
  onOpenChange,
  editingPersona,
  onSuccess
}: PersonaModalProps) => {
  
  // --- ESTADOS INTERNOS ---
  const [personaSaving, setPersonaSaving] = useState(false);
  const [repDocTipo, setRepDocTipo] = useState("DNI");
  const [repDocNumero, setRepDocNumero] = useState("");
  const [isSearchingSunat, setIsSearchingSunat] = useState(false);

  // --- ESTILOS SLIM ---
  const labelClasses = "text-[10px] font-black text-slate-800 uppercase tracking-tight mb-1.5 block ml-0.5";
  const inputClasses = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal";
  const sectionTitle = "text-[11px] font-black text-[#0f766e] uppercase tracking-wider mb-4 mt-2 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-[#0f766e] before:rounded-full";

  const maxLength = repDocTipo === "DNI" ? 8 : 9;

  // --- LÓGICA DE GUARDADO INTEGRADA ---
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const getOptionalString = (value: FormDataEntryValue | null) => {
      const trimmedValue = String(value || "").trim();
      return trimmedValue === "" ? undefined : trimmedValue;
    };

    const f = new FormData(e.currentTarget);
    const payload = {
      tipo_persona: String(f.get("tipo_persona") || "JURIDICA") as "JURIDICA" | "NATURAL",
      nombre_razon_social: String(f.get("nombre")).trim(),
      ruc: getOptionalString(f.get("ruc")),
      telefono: getOptionalString(f.get("telefono")),
      correo: getOptionalString(f.get("correo")),
      via_tipo: getOptionalString(f.get("via_tipo")),
      via_nombre: getOptionalString(f.get("via_nombre")),
      numero: getOptionalString(f.get("numero")),
      interior: getOptionalString(f.get("interior")),
      mz: getOptionalString(f.get("mz")),
      lt: getOptionalString(f.get("lt")),
      otros: getOptionalString(f.get("otros")),
      urb_aa_hh_otros: getOptionalString(f.get("urb_aa_hh_otros")),
      distrito: getOptionalString(f.get("distrito")),
      provincia: getOptionalString(f.get("provincia")),
      departamento: getOptionalString(f.get("departamento"))
    };

    // Validaciones de UI
    if (!payload.nombre_razon_social) {
      // @ts-ignore (Si swalError es global o viene de props)
      await swalError("Ingresa el nombre / razón social");
      return;
    }

    if (payload.tipo_persona === "JURIDICA" && !payload.ruc) {
      // @ts-ignore
      const ok = await swalConfirm({
        title: "¿Continuar sin RUC?",
        text: "Esta persona es JURÍDICA pero no tiene RUC.",
        icon: "warning",
        confirmButtonText: "Sí, continuar",
      });
      if (!ok) return;
    }

    setPersonaSaving(true);
    try {
      let response;
      if (editingPersona?.id_persona) {
        // @ts-ignore
        response = await personasApi.update(editingPersona.id_persona, payload);
        // @ts-ignore
        await swalSuccess("Persona actualizada");
      } else {
        // @ts-ignore
        response = await personasApi.create(payload);
        // @ts-ignore
        await swalSuccess("Persona creada");
      }

      console.log("¿Existe onSuccess en el Modal?:", !!onSuccess);

      // Extraemos la data limpia
      const personaData = response?.data || response;

      // Si hay una función onSuccess (de Licencias o Listado), le pasamos la data
      if (onSuccess) {
        onSuccess(personaData); 
      }

      onOpenChange(false);
    } catch (err: any) {
      // @ts-ignore
      await swalError(err?.message ?? "Error al guardar persona");
    } finally {
      setPersonaSaving(false);
    }
  };

  const onSearchSunat = async () => {
    if (repDocNumero.length < 8) return;
    setIsSearchingSunat(true);
    // Simulación o llamada real aquí
    setTimeout(() => setIsSearchingSunat(false), 1500); 
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[750px] p-0 border-none overflow-hidden bg-white shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-5 text-white bg-[#0f766e]">
          <DialogTitle className="text-[13px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2">
            {editingPersona?.id_persona ? "📝 Editar Persona" : "👤 Nueva Persona"}
          </DialogTitle>
          <DialogDescription className="text-teal-50/70 text-[10px] uppercase font-bold tracking-wider">
            {editingPersona?.id_persona ? "Actualización de datos" : "Ingrese datos para el registro"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">

            {/* BUSCADOR COMPACTO */}
            <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-1.5">
              <label className={labelClasses}>Buscador de Identidad</label>
              <div className="flex items-center h-9 w-full group shadow-sm">
                <select
                  className="w-20 h-full rounded-l-lg border border-slate-300 bg-slate-50 px-2 text-[11px] font-black focus:border-[#0f766e] outline-none text-slate-700 border-r-0"
                  value={repDocTipo}
                  onChange={(e) => { setRepDocTipo(e.target.value); setRepDocNumero(""); }}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">C.E.</option>
                </select>

                <input
                  className="flex-1 h-full border border-slate-300 bg-white px-3 text-[11px] font-black tracking-widest focus:border-[#0f766e] focus:z-10 outline-none border-r-0"
                  placeholder={repDocTipo === "DNI" ? "8 dígitos" : "9 dígitos"}
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
                  className="h-full px-3 flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-r-lg hover:bg-slate-200 text-slate-600 disabled:opacity-50"
                >
                  {isSearchingSunat ? <Loader2 size={13} className="animate-spin text-[#0f766e]" /> : <Search size={13} className="text-slate-400" />}
                  <span className="text-[10px] font-black tracking-tighter uppercase">SUNAT</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-4" />

            {/* TIPO PERSONA */}
            <div className="md:col-span-4">
              <Label className={labelClasses}>Tipo de persona</Label>
              <Select name="tipo_persona" defaultValue={editingPersona?.tipo_persona ?? "JURIDICA"}>
                <SelectTrigger className={inputClasses}>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JURIDICA" className="text-[11px] font-bold">🏢 JURÍDICA</SelectItem>
                  <SelectItem value="NATURAL" className="text-[11px] font-bold">👤 NATURAL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-8">
              <Label className={labelClasses}>Nombre / Razón social</Label>
              <Input name="nombre" defaultValue={editingPersona?.nombre_razon_social ?? ""} className={inputClasses} required />
            </div>

            <div className="md:col-span-4">
              <Label className={labelClasses}>RUC</Label>
              <Input name="ruc" defaultValue={editingPersona?.ruc ?? ""} className={inputClasses} />
            </div>

            <div className="md:col-span-4">
              <Label className={labelClasses}>Teléfono</Label>
              <Input name="telefono" defaultValue={editingPersona?.telefono ?? ""} className={inputClasses} />
            </div>

            <div className="md:col-span-4">
              <Label className={labelClasses}>Correo</Label>
              <Input name="correo" defaultValue={editingPersona?.correo ?? ""} className={inputClasses} type="email" />
            </div>

            {/* DIRECCIÓN */}
            <div className="md:col-span-12 mt-4">
              <h4 className={sectionTitle}>Dirección Domiciliaria</h4>
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="md:col-span-2"><Label className={labelClasses}>Vía</Label><Input name="via_tipo" defaultValue={editingPersona?.via_tipo ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-4"><Label className={labelClasses}>Nombre de vía</Label><Input name="via_nombre" defaultValue={editingPersona?.via_nombre ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-1"><Label className={labelClasses}>N°</Label><Input name="numero" defaultValue={editingPersona?.numero ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-1"><Label className={labelClasses}>Int.</Label><Input name="interior" defaultValue={editingPersona?.interior ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-2"><Label className={labelClasses}>MZ</Label><Input name="mz" defaultValue={editingPersona?.mz ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-2"><Label className={labelClasses}>LT</Label><Input name="lt" defaultValue={editingPersona?.lt ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-2"><Label className={labelClasses}>Urb / AA.HH</Label><Input name="urb_aa_hh_otros" defaultValue={editingPersona?.urb_aa_hh_otros ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-2"><Label className={labelClasses}>Distrito</Label><Input name="distrito" defaultValue={editingPersona?.distrito ?? ""} className={inputClasses} /></div>
                <div className="md:col-span-2"><Label className={labelClasses}>Prov/Dep</Label><Input name="provincia" defaultValue={editingPersona?.provincia ?? ""} className={inputClasses} /></div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 border-t border-slate-100 pt-6">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" className="h-10 text-[10px] font-black uppercase text-slate-500">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={personaSaving}
              className="h-10 bg-[#0f766e] text-white text-[10px] font-black uppercase px-8 shadow-lg active:scale-95 transition-all"
            >
              {personaSaving ? "GUARDANDO..." : editingPersona?.id_persona ? "GUARDAR CAMBIOS" : "REGISTRAR Y SELECCIONAR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};