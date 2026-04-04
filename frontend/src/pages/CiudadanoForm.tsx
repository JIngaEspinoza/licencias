import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ciudadanosApi, CiudadanoCreate } from "../services/ciudadanos";
import Swal from 'sweetalert2';
import RouteGuard from "../components/RouteGuard";
import { useConfirmExit } from "../hooks/useConfirmExit";
import { useWarnOnUnload } from "../hooks/useWarnOnUnload";
import { Toast } from "../lib/toast";
import { isValidRUC, isValidDNI, isValidEmail, isValidPhone } from "../lib/validators";

export default function LicenciaForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [tipo_persona, setTipoPersona] = useState("");
  const [nombre_razon_social, setNombreRazonSocial] = useState("");
  const [ruc, setRuc] = useState("");
  const [dni_ce, setDniCE] = useState("");
  const [direccion, setDireccion] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");  
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [dirty, setDirty] = useState(false);

  useConfirmExit(dirty && !isSaving); 
  useWarnOnUnload(dirty && !isSaving);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await ciudadanosApi.get(Number(id));
        setTipoPersona(data.tipo_persona);
        setNombreRazonSocial(data.nombre_razon_social);
        setRuc(data.ruc);
        setDniCE(data.dni_ce ?? "");
        setDireccion(data.direccion ?? "");
        setCorreo(data.correo ?? "");
        setTelefono(data.telefono ?? "");
        setDirty(false);
      } catch (e: any) {
        setError(e.message || "No se pudo cargar");
      }
    })();
  }, [id, isEdit]);

  const onChange = <T extends React.SetStateAction<string>>(setter: React.Dispatch<T>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value as any);
      setDirty(true); 
    };

  const save = async () => {
    setError("");    
    
    if (!tipo_persona || !nombre_razon_social || !ruc) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Completa Tipo Persona, Razón Social y RUC.",
      });
      return;
    }

    if (!isValidRUC(ruc)) {
      await Swal.fire({ icon: "warning", title: "RUC inválido", text: "Debe tener 11 dígitos y dígito verificador correcto." });
      return;
    }
    if (dni_ce && !isValidDNI(dni_ce)) {
      await Swal.fire({ icon: "warning", title: "DNI inválido", text: "El DNI debe tener 8 dígitos." });
      return;
    }
    if (correo && !isValidEmail(correo)) {
      await Swal.fire({ icon: "warning", title: "Correo inválido", text: "Revisa el formato del correo." });
      return;
    }
    if (telefono && !isValidPhone(telefono)) {
      await Swal.fire({ icon: "warning", title: "Teléfono inválido", text: "Celular: 9 dígitos iniciando en 9. Fijo: 6–9 dígitos." });
      return;
    }

    const payload: CiudadanoCreate = {
      tipo_persona,
      nombre_razon_social,
      ruc,
      dni_ce,
      direccion,
      correo,
      telefono
    };

    const { isConfirmed } = await Swal.fire({
      title: isEdit ? "¿Guardar cambios?" : "¿Crear ciudadano?",
      text: isEdit
        ? "Se actualizarán los datos del registro."
        : "Se creará un nuevo ciudadano.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEdit ? "Sí, actualizar" : "Sí, crear",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;

    try {
      setIsSaving(true);
      Swal.fire({
        title: isEdit ? "Actualizando..." : "Creando...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
           
      if (isEdit) await ciudadanosApi.update(Number(id), payload);
      else await ciudadanosApi.create(payload);

      Toast.fire({
        icon: "success",
        title: isEdit ? "Cambios guardados" : "Creado correctamente",
      });

      setDirty(false);
      navigate("/ciudadanos");
    } catch (e: any) {
      Toast.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: e?.message || "Intenta nuevamente",
      });
      setError(e.message || "No se pudo guardar");
    } finally {
      setIsSaving(false); 
    }
  };

  return (
    <section className="max-w-xl space-y-4">
      <RouteGuard dirty={dirty} /> {/* agregado: activa el guardia */}
      <h2 className="text-xl font-semibold">{isEdit ? "Editar Ciudadano" : "Nuevo Ciudadano"}</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <label className="block">
          <span className="text-sm">Tipo Persona</span>
          <select className="mt-1 w-full border rounded px-3 py-2"
              value={tipo_persona}
              onChange={onChange(setTipoPersona)}>
            <option value="">— Selecciona —</option>
            <option value="JURIDICA">JURIDICA</option>
            <option value="NATURAL">NATURAL</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Razón Social</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
            value={nombre_razon_social}
            onChange={onChange(setNombreRazonSocial)} />
        </label>

        <label className="block">
          <span className="text-sm">Ruc</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
            value={ruc}
            onChange={onChange(setRuc)}
            inputMode="numeric" 
            maxLength={11} />
        </label>

        <label className="block">
          <span className="text-sm">Dni</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
            value={dni_ce}
            onChange={onChange(setDniCE)} 
            inputMode="numeric" 
            maxLength={8} />
        </label>

        <label className="block">
          <span className="text-sm">Dirección</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
            value={direccion}
            onChange={onChange(setDireccion)} />
        </label>

        <label className="block">
          <span className="text-sm">Correo</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
            value={correo}
            onChange={onChange(setCorreo)} 
            type="email" />
        </label>

        <label className="block">
          <span className="text-sm">Telefono</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
            value={telefono}
            onChange={onChange(setTelefono)} 
            inputMode="numeric" 
            maxLength={9} />
        </label>

        <div className="flex gap-2 pt-2">
          <button onClick={save} className="px-3 py-2 rounded bg-[var(--brand)] text-white">Guardar</button>
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded border">Cancelar</button>
        </div>
      </div>
    </section>
  );
}