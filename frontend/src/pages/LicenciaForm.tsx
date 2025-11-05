import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { licenciasApi, LicenciaCreate } from "../services/licencias";
import { isValidRUC, isValidDNI, isValidEmail, isValidPhone } from "../lib/validators";

type Estado = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export default function LicenciaForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [numero_expediente, setNumeroExpediente] = useState("");
  const [fecha_solicitud, setFechaSolicitud] = useState("");
  const [estado, setEstado] = useState<Estado>("PENDIENTE");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await licenciasApi.get(Number(id));
        setNumeroExpediente(data.numero_expediente ?? "");
        // si viene ISO completo, recorta a yyyy-mm-dd
        setFechaSolicitud((data.fecha_solicitud ?? "").slice(0, 10));
        setEstado((data.estado as Estado) ?? "PENDIENTE");
      } catch (e: any) {
        setError(e.message || "No se pudo cargar");
      }
    })();
  }, [id, isEdit]);

  const save = async () => {
    setError("");
    try {
      const payload: LicenciaCreate = {
        numero_expediente,
        fecha_solicitud, // 'yyyy-mm-dd'
        estado,
        // agrega otros campos si tu DTO los requiere
      };
      if (isEdit) await licenciasApi.update(Number(id), payload);
      else await licenciasApi.create(payload);
      navigate("/licencias");
    } catch (e: any) {
      setError(e.message || "No se pudo guardar");
    }
  };

  return (
    <section className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold">{isEdit ? "Editar Licencia" : "Nueva Licencia"}</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <label className="block">
          <span className="text-sm">N° Expediente</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
                 value={numero_expediente}
                 onChange={(e) => setNumeroExpediente(e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Fecha Solicitud</span>
          <input type="date" className="mt-1 w-full border rounded px-3 py-2"
                 value={fecha_solicitud}
                 onChange={(e) => setFechaSolicitud(e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Estado</span>
          <select className="mt-1 w-full border rounded px-3 py-2"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as Estado)}>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="APROBADA">APROBADA</option>
            <option value="RECHAZADA">RECHAZADA</option>
          </select>
        </label>

        <div className="flex gap-2 pt-2">
          <button onClick={save} className="px-3 py-2 rounded bg-[var(--brand)] text-white">Guardar</button>
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded border">Cancelar</button>
        </div>
      </div>
    </section>
  );
}

/*import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function LicenciaForm() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [numero_expediente, setNumeroExpediente] = useState('')
    const [fecha_solicitud, setFechaSolicitud] = useState('')
    const [estado, setEstado] = useState<'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('PENDIENTE')

    const save = () => { navigate('/licencias') }

    return (
        <section className="max-w-xl space-y-4">
            <h2 className="text-xl font-semibold">{id ? 'Editar Licencia' : 'Nueva Licencia'}</h2>
            <div className="bg-white border rounded-xl p-4 space-y-3">
                <label className="block">
                    <span className="text-sm">N° Expediente</span>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={numero_expediente} onChange={(e)=>setNumeroExpediente(e.target.value)} />
                </label>
                <label className="block">
                    <span className="text-sm">Fecha Solicitud</span>
                    <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={fecha_solicitud} onChange={(e)=>setFechaSolicitud(e.target.value)} />
                </label>
                <label className="block">
                    <span className="text-sm">Estado</span>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={estado} onChange={(e)=>setEstado(e.target.value as any)}>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="APROBADA">APROBADA</option>
                        <option value="RECHAZADA">RECHAZADA</option>
                    </select>
                </label>
                <div className="flex gap-2 pt-2">
                    <button onClick={save} className="px-3 py-2 rounded bg-[var(--brand)] text-white">Guardar</button>
                    <button onClick={()=>navigate(-1)} className="px-3 py-2 rounded border">Cancelar</button>
                </div>
            </div>
        </section>
    )
}*/