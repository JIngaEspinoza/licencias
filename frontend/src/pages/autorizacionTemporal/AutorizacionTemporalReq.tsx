
import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expediente, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { autorizacionesApi } from '../../services/autorizaciones_temporales';
import type { VistaDTO } from '@/types/autorizacionesViaPublicaList';

export default function AutorizacionesTemporalesList() {
  const [selected, setSelected] = React.useState(null) // modal de requisitos
  const [startItem, setStartItem] = React.useState(null) // modal de iniciar trámite + adjuntos
  const [toast, setToast] = React.useState("")

  //const [data, setData] = useState<VistaDTO[]>([]);
  const [categorias, setCategorias] = useState<VistaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  
  // Adjuntos persistidos por trámite (simulado)
  // { [key]: FileLike[] }
  const [attachmentsByKey, setAttachmentsByKey] = React.useState({})

    useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await autorizacionesApi.list();
        if (alive) setCategorias(res);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="p-4">Cargando…</div>;
  if (err) return <div className="p-4 text-red-600">Error: {err}</div>;

  const categorias2 = [
    {
      nombre: "Propiedad Privada",
      items: [
        {
          key: "EPND",
          titulo: "Espectáculos Públicos No Deportivos",
          vigencia: "3 días",
          presentacion: "7 días hábiles antes",
          requisitos: [
            "Vigencia de Poder",
            "Plano + memoria descriptiva",
            "Informe ECSE",
            "Contrato de seguridad privada",
            "Póliza de responsabilidad civil",
            "Pago derecho S/.29",
            "Autorización DICSCAMEC (si aplica)",
            "ECSE previa"
          ]
        },
        {
          key: "EXPO_PP",
          titulo: "Exposiciones",
          vigencia: "15 días",
          presentacion: "7 días hábiles antes",
          requisitos: [
            "Vigencia de Poder",
            "Plano + memoria descriptiva",
            "Informe ECSE",
            "Contrato de seguridad privada",
            "Póliza de responsabilidad civil",
            "Pago derecho S/.29",
            "Autorización DICSCAMEC (si aplica)",
            "ECSE previa"
          ]
        },
        {
          key: "CAMP_PROMO",
          titulo: "Campañas y Promociones",
          vigencia: "15 días",
          presentacion: "7 días hábiles antes",
          requisitos: [
            "Vigencia de Poder",
            "Plano + memoria descriptiva",
            "Informe ECSE",
            "Contrato de seguridad privada",
            "Póliza de responsabilidad civil",
            "Pago derecho S/.29",
            "Autorización DICSCAMEC (si aplica)",
            "ECSE previa"
          ]
        }
      ]
    },
    {
      nombre: "Espacios Públicos",
      items: [
        {
          key: "FERIA_EP",
          titulo: "Ferias / Exposiciones precalificadas",
          tarifa: "Jurídica: S/60 stand/día • Educativas: S/30 • No lucrativas: hasta S/20",
          requisitos: [
            "Formato de Solicitud", 
            "Croquis de ubicación y distribución de stands", 
            "Pago en caja (previa calificación)"
          ]
        },
        {
          key: "EVENTO_PARQUE",
          titulo: "Eventos en parques (≤60 m²)",
          tarifa: "Jurídica: S/1200/día • Vecinos: S/200/día • Educativas: S/300/día",
          requisitos: [
            "Formato de Solicitud", 
            "Croquis de ubicación y módulos", 
            "Pago en caja (previa calificación)"
          ]
        },
        {
          key: "ZONA_NO_URB",
          titulo: "Zonas no urbanas / recreación",
          tarifa: "Hasta 1000 m²: S/5/m²/día • 1000–3000 m²: S/4/m²/mes • 3000–5000 m²: S/3/m²/mes • >5000 m²: S/3/m²/mes",
          requisitos: [
            "Formato de Solicitud", 
            "Plano de ubicación", 
            "Plano perimétrico", 
            "Permisos sectoriales (si aplica)",
            "Pago en caja"
          ],
          nota: "Luego, solicitar Autorización Temporal según Ord. 411/MDSM"
        },
        {
          key: "VMP",
          titulo: "VMP (Vehículos de Movilidad Personal)",
          tarifa: "S/3 por VMP por día",
          requisitos: [
            "Formato de Solicitud con # de VMP", 
            "Plano de puntos de parada y máximo VMP por punto", 
            "Pólizas de seguro (accidentes + RC)", 
            "DJ de cumplimiento de condiciones", 
            "Pago en caja"
          ],
          nota: "Sujeto a evaluación y calificación"
        }
      ]
    },
    {
      nombre: "Constancia de Horarios",
      items: [
        {
          key: "CONST_HORARIO",
          titulo: "Adecuación de Horarios",
          requisitos: ["Formato de solicitud", "Copia de Licencia de Funcionamiento", "Copia del Certificado ITSE"],
          base: "Ordenanza N° 411/MDSM"
        }
      ]
    }
  ]

  function getKey(item){ return item.key || item.titulo }
  function bytesToSize(bytes){
    if (!bytes && bytes !== 0) return "";
    const sizes = ['B','KB','MB','GB'];
    if (bytes === 0) return '0 B';
    const i = Math.min(Math.floor(Math.log(bytes)/Math.log(1024)), sizes.length-1)
    return `${(bytes/Math.pow(1024,i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="min-h-screen bg-gray-50" >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Autorizaciones</h1>          
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {categorias.map((cat) => (
          <section key={cat.nombre}>
            <h2 className="text-lg font-semibold mb-4">{cat.nombre}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => (
                <div
                  key={item.titulo}
                  className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold leading-tight">{item.titulo}</h3>
                    {item.vigencia && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">⏳ {item.vigencia}</span>
                    )}
                  </div>

                  {item.presentacion && (
                    <p className="text-xs text-gray-600">📅 Presentar: {item.presentacion}</p>
                  )}

                  {item.tarifa && (
                    <p className="text-sm">💰 <span className="font-medium">Tarifa:</span> {item.tarifa}</p>
                  )}

                  {item.nota && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">{item.nota}</p>
                  )}

                  <div className="mt-1 flex gap-2">
                    <button
                      className="inline-flex items-center gap-2 text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-black"
                      onClick={() => setSelected(item)}
                    >
                      Ver requisitos
                    </button>
                    <button
                      className="inline-flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700"
                      onClick={() => setStartItem(item)}
                    >
                      Iniciar trámite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Modal de requisitos */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Requisitos – {selected.titulo}</h3>
              <button className="text-gray-500 hover:text-gray-800" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {selected.vigencia && (
                <div className="text-xs text-gray-600">⏳ Vigencia máxima: {selected.vigencia}</div>
              )}

              <ul className="list-disc pl-5 space-y-1 text-sm">
                {selected.requisitos?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="px-5 py-4 border-t flex justify-end gap-2 bg-gray-50">
              <button className="px-3 py-1.5 rounded-md border" onClick={() => setSelected(null)}>Cerrar</button>
              <button className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700" onClick={() => { setSelected(null); setStartItem(selected); }}>Iniciar trámite</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Iniciar trámite */}
      {startItem && (
        <StartModal
          item={startItem}
          initialFiles={attachmentsByKey[getKey(startItem)] || []}
          onClose={() => setStartItem(null)}
          onSave={(files) => {
            const k = getKey(startItem)
            setAttachmentsByKey(prev => ({ ...prev, [k]: files }))
            setToast(`Se guardaron ${files.length} adjunto(s) para "${startItem.titulo}"`)
            setTimeout(()=>setToast(""), 2500)
            setStartItem(null)
          }}
          bytesToSize={bytesToSize}
        />
      )}

      {/* Toast superior */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow z-50 text-sm">{toast}</div>
      )}
    </div>
  )
}

// ================== Componente del modal de inicio de trámite ==================
function StartModal({ item, initialFiles, onClose, onSave, bytesToSize, prefillExpediente }){
  const [files, setFiles] = React.useState(initialFiles) // global (se conserva para compatibilidad)
  const inputRef = React.useRef(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [form, setForm] = React.useState({
    nrolicencia: '',
    nrocertificadoseguridad: '',
    nroexpediente: '',
    fecha: '',
    hora: '',
    actividad: '',
    solicitante: 'JURIDICA',
    ruc: '',
    rep_doc_tipo: 'DNI',
    rep_doc_num: '',
    nat_ruc: '',
    nat_dni: '',
    nat_carnet: '',
    ubicacion: '',
    rep_carnet: ''
  })

  React.useEffect(()=>{ if(prefillExpediente){ setForm(f=>({...f, nroexpediente: prefillExpediente})) } }, [prefillExpediente])

  // ===== Buscador de expedientes =====
  const [showExpModal, setShowExpModal] = React.useState(false)
  const [expQuery, setExpQuery] = React.useState({ nro:'', tipo:'', estado:'', desde:'', hasta:'' })
  const sampleExpedientes = [
    { numero:'EXP-2025-0001', tipo:'EPND', estado:'EN_TRAMITE', fecha:'2025-09-01', solicitante:'JURIDICA' },
    { numero:'EXP-2025-0002', tipo:'EPND', estado:'APROBADO', fecha:'2025-08-25', solicitante:'NATURAL' },
    { numero:'EXP-2025-0010', tipo:'EXPO_PP', estado:'EN_TRAMITE', fecha:'2025-09-10', solicitante:'JURIDICA' },
    { numero:'EXP-2025-0020', tipo:'CAMP_PROMO', estado:'DENEGADO', fecha:'2025-07-14', solicitante:'NATURAL' },
    { numero:'EXP-2025-0100', tipo:'EPND', estado:'APROBADO', fecha:'2025-06-02', solicitante:'JURIDICA' },
  ]
  const [expRows, setExpRows] = React.useState(sampleExpedientes)
  function buscarExp(){
    const {nro,tipo,estado,desde,hasta} = expQuery
    const rows = sampleExpedientes.filter(r =>
      (nro? r.numero.toLowerCase().includes(nro.toLowerCase()):true) &&
      (tipo? r.tipo===tipo : true) &&
      (estado? r.estado===estado : true) &&
      (desde? r.fecha >= desde : true) &&
      (hasta? r.fecha <= hasta : true)
    )
    setExpRows(rows)
  }
  function seleccionarExp(row){
    setForm(prev=>({...prev, nroexpediente: row.numero}))
    setShowExpModal(false)
  }

  // Adjuntos por requisito (EPND)
  const [filesByReq, setFilesByReq] = React.useState({})
  const [errorsByReq, setErrorsByReq] = React.useState({})

  // ===== Validación de inputs =====
  const [inputErrors, setInputErrors] = React.useState({})
  const [inputsValid, setInputsValid] = React.useState(false)

  function validateInputs(f = form) {
    const errs = {}
    if (!f.nroexpediente?.trim()) errs.nroexpediente = 'Requerido'
    if (!f.fecha) errs.fecha = 'Requerido'
    if (!f.hora) errs.hora = 'Requerido'
    if (!f.actividad?.trim()) errs.actividad = 'Requerido'
    if (f.solicitante === 'JURIDICA') {
      if (!/^\d{11}$/.test(f.ruc ?? '')) errs.ruc = 'RUC inválido (11 dígitos)'
      if (!f.rep_carnet?.trim()) errs.rep_carnet = 'Razón social requerida'
    } else {
      if (!f.rep_carnet?.trim()) errs.rep_carnet = 'Nombres y apellidos requeridos'
    }
    if (f.rep_doc_tipo === 'DNI') {
      if (!/^\d{8}$/.test(f.rep_doc_num ?? '')) errs.rep_doc_num = 'DNI inválido (8 dígitos)'
    } else {
      if (!(f.rep_doc_num ?? '').trim()) errs.rep_doc_num = 'N° de C.E. requerido'
    }
    setInputErrors(errs)
    setInputsValid(Object.keys(errs).length === 0)
  }
  React.useEffect(()=>{ validateInputs(form) }, [form])

  // ====== (Compat) Drag & Drop global - no visible ======
  function onFilesSelected(list){
    const arr = Array.from(list || [])
    const merged = [...files]
    for (const f of arr){
      const exists = merged.some(m => m.name===f.name && m.size===f.size)
      if(!exists) merged.push({ name: f.name, size: f.size, type: f.type })
    }
    setFiles(merged)
  }
  function onDrop(e){ e.preventDefault(); e.stopPropagation(); setDragActive(false); onFilesSelected(e.dataTransfer.files) }
  function onDragOver(e){ e.preventDefault(); e.stopPropagation(); setDragActive(true) }
  function onDragLeave(e){ e.preventDefault(); e.stopPropagation(); setDragActive(false) }
  function removeAt(idx){ setFiles(prev => prev.filter((_,i)=>i!==idx)) }

  // ====== Validaciones de archivo por requisito (sin DnD) ======
  const ACCEPT_EXT = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
  const MAX_SIZE_BYTES = 10 * 1024 * 1024
  const VALID_MIMES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ])

  function onPickReqFiles(idx, list){
    const arr = Array.from(list || [])
    const accepted = []
    const errs = []
    for (const f of arr){
      const okType = VALID_MIMES.has(f.type) || /\.(pdf|jpg|jpeg|png|docx?)$/i.test(f.name)
      const okSize = f.size <= MAX_SIZE_BYTES
      if (!okType) errs.push(`${f.name}: tipo no permitido`)
      if (!okSize) errs.push(`${f.name}: excede 10MB`)
      if (okType && okSize){ accepted.push({ name: f.name, size: f.size, type: f.type }) }
    }
    setErrorsByReq(prev => ({ ...prev, [idx]: errs }))
    if (accepted.length){
      setFilesByReq(prev => {
        const existing = prev[idx] ? [...prev[idx]] : []
        for(const a of accepted){
          if(!existing.some(m => m.name===a.name && m.size===a.size)) existing.push(a)
        }
        return { ...prev, [idx]: existing }
      })
    }
  }

  function removeReqFile(idx, fIndex){
    setFilesByReq(prev => {
      const arr = (prev[idx]||[]).slice()
      arr.splice(fIndex,1)
      return { ...prev, [idx]: arr }
    })
  }

  // === Progreso de requisitos ===
  const requisitosList = Array.isArray(item.requisitos) ? item.requisitos : []
  const totalRequired = requisitosList.filter(r=>!(/si aplica/i.test(r))).length
  const completedRequired = requisitosList.reduce((acc, r, i) => {
    if (/si aplica/i.test(r)) return acc; // opcional no suma
    return acc + ((filesByReq[i]?.length > 0) ? 1 : 0);
  }, 0)
  const anyErrors = Object.values(errorsByReq).some(arr => Array.isArray(arr) && arr.length>0)

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 z-40"
      onDrop={(e)=>{ e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
      onDragOver={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Iniciar trámite – {item.titulo}</h3>
          <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {item.key === 'EPND' && (
            <div className="grid md:grid-cols-3 gap-4">
              {/* Columna izquierda: Datos del evento */}
              <div className="bg-white border rounded-xl p-4 col-span-1">
                <div className="text-sm font-medium mb-3">Licencia y Certificado Obligatorios</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="text-sm sm:col-span-2">
                    <span className="block text-xs text-gray-600 mb-1"># Licencia *</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className={`flex-1 border rounded px-2 py-1 w-full ${inputErrors.nrolicencia ? 'border-red-500' : ''}`}
                        value={form.nrolicencia}
                        onChange={e=>setForm({...form, nrolicencia:e.target.value})}
                      />
                      {inputErrors.nrolicencia && (<div className="text-[11px] text-red-600">{inputErrors.nrolicencia}</div>)}

                      <button
                        type="button"
                        className="px-2 py-1 text-xs border rounded-md bg-white hover:bg-gray-50"
                        onClick={() => setShowExpModal(true)}
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                  <div className="text-sm sm:col-span-2">
                    <span className="block text-xs text-gray-600 mb-1"># Certificado *</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className={`flex-1 border rounded px-2 py-1 w-full ${inputErrors.nrocertificadoseguridad ? 'border-red-500' : ''}`}
                        value={form.nrocertificadoseguridad}
                        onChange={e=>setForm({...form, nrocertificadoseguridad:e.target.value})}
                      />
                      {inputErrors.nrocertificadoseguridad && (<div className="text-[11px] text-red-600">{inputErrors.nrocertificadoseguridad}</div>)}

                      <button
                        type="button"
                        className="px-2 py-1 text-xs border rounded-md bg-white hover:bg-gray-50"
                        onClick={() => setShowExpModal(true)}
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium mb-3">Datos del evento</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="text-sm sm:col-span-2">
                    <span className="block text-xs text-gray-600 mb-1"># Expediente *</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className={`flex-1 border rounded px-2 py-1 w-full ${inputErrors.nroexpediente ? 'border-red-500' : ''}`}
                        value={form.nroexpediente}
                        onChange={e=>setForm({...form, nroexpediente:e.target.value})}
                      />
                      {inputErrors.nroexpediente && (<div className="text-[11px] text-red-600">{inputErrors.nroexpediente}</div>)}

                      <button
                        type="button"
                        className="px-2 py-1 text-xs border rounded-md bg-white hover:bg-gray-50"
                        onClick={() => setShowExpModal(true)}
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <label className="text-sm">
                    <span className="block text-xs text-gray-600 mb-1">Fecha *</span>
                    <input 
                      type="date" 
                      className={`w-full border rounded px-2 py-1 ${inputErrors.fecha ? 'border-red-500' : ''}`}
                      value={form.fecha} 
                      onChange={e=>setForm({...form, fecha:e.target.value})} 
                    />
                    {inputErrors.fecha && (<div className="text-[11px] text-red-600">{inputErrors.fecha}</div>)}

                  </label>
                  <label className="text-sm">
                    <span className="block text-xs text-gray-600 mb-1">Hora *</span>
                    <input 
                      type="time" 
                      className={`w-full border rounded px-2 py-1 ${inputErrors.hora ? 'border-red-500' : ''}`}
                      value={form.hora} 
                      onChange={e=>setForm({...form, hora:e.target.value})} 
                    />
                    {inputErrors.hora && (<div className="text-[11px] text-red-600">{inputErrors.hora}</div>)}

                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="block text-xs text-gray-600 mb-1">Actividad a realizar *</span>
                    <textarea 
                      className={`flex-1 border rounded px-2 py-1 w-full ${inputErrors.actividad ? 'border-red-500' : ''}`}
                      rows={2} placeholder="Concierto, teatro, evento social, etc." 
                      value={form.actividad} 
                      onChange={e=>setForm({...form, actividad:e.target.value})} 
                    />
                    {inputErrors.actividad && (<div className="text-[11px] text-red-600">{inputErrors.actividad}</div>)}
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="block text-xs text-gray-600 mb-1">Ubicación</span>
                    <input className="w-full border rounded px-2 py-1" value={form.ubicacion} onChange={e=>setForm({...form, ubicacion:e.target.value})}/>
                  </label>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <label className="text-sm">
                    <span className="block text-xs text-gray-600 mb-1">Tipo de solicitante</span>
                    <select className="w-full border rounded px-2 py-1" value={form.solicitante} onChange={e=>setForm({...form, solicitante:e.target.value})}>
                      <option value="JURIDICA">Persona Jurídica</option>
                      <option value="NATURAL">Persona Natural</option>
                    </select>
                  </label>
                  {form.solicitante === 'JURIDICA' ? (
                    <label className="text-sm">
                      <span className="block text-xs text-gray-600 mb-1">RUC (empresa) *</span>
                      <input 
                      className={`flex-1 border rounded px-2 py-1 w-full ${inputErrors.ruc ? 'border-red-500' : ''}`}
                        placeholder="11 dígitos" 
                        value={form.ruc} 
                        onChange={e=>setForm({...form, ruc:e.target.value})}
                      />
                      {inputErrors.ruc && (<div className="text-[11px] text-red-600">{inputErrors.ruc}</div>)}
                    </label>
                  ) : (
                    <label className="text-sm">
                      <span className="block text-xs text-gray-600 mb-1">RUC (opcional)</span>
                      <input className="w-full border rounded px-2 py-1" placeholder="11 dígitos" value={form.nat_ruc} onChange={e=>setForm({...form, nat_ruc:e.target.value})}/>
                    </label>
                  )}
                </div>

                <div className="mt-3">
                  <label className="text-sm block">
                    <span className="block text-xs text-gray-600 mb-1">{form.solicitante === "JURIDICA" ? "Razón Social *" : "Nombres y Apellidos *"}</span>
                    <input 
                      className={`flex-1 border rounded px-2 py-1 w-full ${inputErrors.rep_carnet ? 'border-red-500' : ''}`}
                      value={form.rep_carnet} 
                      onChange={e=>setForm({...form, rep_carnet:e.target.value})}
                    />
                    {inputErrors.rep_carnet && (<div className="text-[11px] text-red-600">{inputErrors.rep_carnet}</div>)}

                  </label>
                </div>

                <div className="mt-3 grid sm:grid-cols-3 gap-3">
                  <label className="text-sm">
                    <span className="block text-xs text-gray-600 mb-1">Doc.</span>
                    <select className="w-full border rounded px-2 py-1" value={form.rep_doc_tipo} onChange={e=>setForm({...form, rep_doc_tipo:e.target.value})}>
                      <option value="DNI">DNI</option>
                      <option value="CEX">C.E.</option>
                    </select>
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="block text-xs text-gray-600 mb-1">N° documento *</span>
                    <input 
                      className={`flex-1 border rounded px-2 py-1 w-full ${inputErrors.rep_doc_num ? 'border-red-500' : ''}`}
                      value={form.rep_doc_num} 
                      onChange={e=>setForm({...form, rep_doc_num:e.target.value})}
                    />
                    {inputErrors.rep_doc_num && (<div className="text-[11px] text-red-600">{inputErrors.rep_doc_num}</div>)}
                  </label>
                </div>
              </div>

              {/* Columna derecha: Requisitos listados con validación y sin drag & drop */}
              <div className="bg-white border rounded-xl p-4 max-h-[48vh] overflow-auto col-span-2">
                <div className="text-sm font-medium mb-1">Requisitos</div>
                <div className="text-xs text-gray-600 mb-3">Obligatorios cumplidos: <span className="font-semibold">{completedRequired}</span> / {totalRequired}</div>
                <div className="overflow-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="py-2 px-2 w-10">#</th>
                        <th className="py-2 px-2">Requisito</th>
                        <th className="py-2 px-2 w-[240px]">Adjuntar</th>
                        <th className="py-2 px-2">Archivo</th>
                        <th className="py-2 px-2 w-20">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requisitosList.map((r, i) => {
                        const optional = /si aplica/i.test(r)
                        return (
                          <tr key={i} className="border-t align-top">
                            <td className="py-2 px-2">{i+1}</td>
                            <td className="py-2 px-2 min-w-[180px]">
                              <div className="flex items-start gap-2">
                                <span>{r}</span>
                                {optional ? (
                                  <span className="text-[10px] text-gray-500">(Opcional)</span>
                                ) : (
                                  <span className="text-red-500">*</span>
                                )}
                                {filesByReq[i]?.length>0 && (
                                  <span className="text-emerald-700 text-[11px]">✓</span>
                                )}
                              </div>
                              {Array.isArray(errorsByReq[i]) && errorsByReq[i].length>0 && (
                                <ul className="mt-1 text-[11px] text-red-600 list-disc pl-5">
                                  {errorsByReq[i].map((e, k)=>(<li key={k}>{e}</li>))}
                                </ul>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <input id={'req-input-'+i} type="file" multiple accept={ACCEPT_EXT} className="hidden" onChange={(e)=>onPickReqFiles(i, e.target.files)} />
                                <button type="button" className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50" onClick={()=>{ const el = document.getElementById('req-input-'+i); if(el) el.click(); }}>Seleccionar</button>
                                <div className="text-[10px] text-gray-500">PDF/JPG/PNG/DOC/DOCX, ≤10MB</div>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              {Array.isArray(filesByReq[i]) && filesByReq[i].length>0 ? (
                                <ul className="flex flex-wrap gap-1">
                                  {filesByReq[i].map((f, fi) => (
                                    <li key={fi} className="inline-flex items-center gap-1 border rounded px-2 py-0.5">
                                      <span className="truncate max-w-[140px]">{f.name}</span>
                                      <span className="text-[10px] text-gray-500">({bytesToSize(f.size)})</span>
                                      <button className="text-red-600 text-[11px]" onClick={()=>removeReqFile(i, fi)}>×</button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-400 text-xs">Sin archivo</span>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              <button className="text-xs border rounded px-2 py-1" onClick={()=> { setFilesByReq(prev=>({...prev, [i]: []})); setErrorsByReq(prev=>({...prev, [i]: []})) }}>Limpiar</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== Modal Buscar Expedientes ===== */}
          {showExpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/20" onClick={()=>setShowExpModal(false)}></div>
              <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
                <div className="px-5 py-3 border-b flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Buscar expedientes</h4>
                  <button className="text-gray-500 hover:text-gray-800" onClick={()=>setShowExpModal(false)}>✕</button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid sm:grid-cols-5 gap-2">
                    <input className="border rounded px-2 py-1 text-sm sm:col-span-2" placeholder="N° expediente" value={expQuery.nro} onChange={e=>setExpQuery({...expQuery, nro:e.target.value})} />
                    <select className="border rounded px-2 py-1 text-sm" value={expQuery.tipo} onChange={e=>setExpQuery({...expQuery, tipo:e.target.value})}>
                      <option value="">Tipo</option>
                      <option value="EPND">EPND</option>
                      <option value="EXPO_PP">EXPO_PP</option>
                      <option value="CAMP_PROMO">CAMP_PROMO</option>
                    </select>
                    <select className="border rounded px-2 py-1 text-sm" value={expQuery.estado} onChange={e=>setExpQuery({...expQuery, estado:e.target.value})}>
                      <option value="">Estado</option>
                      <option value="EN_TRAMITE">EN_TRAMITE</option>
                      <option value="APROBADO">APROBADO</option>
                      <option value="DENEGADO">DENEGADO</option>
                    </select>
                    <button className="px-3 py-1 text-xs rounded-md bg-gray-900 text-white hover:bg-black" onClick={buscarExp}>Buscar</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <label className="text-xs text-gray-600 flex items-center gap-1">Desde
                      <input type="date" className="border rounded px-2 py-1 text-sm w-full" value={expQuery.desde} onChange={e=>setExpQuery({...expQuery, desde:e.target.value})} />
                    </label>
                    <label className="text-xs text-gray-600 flex items-center gap-1">Hasta
                      <input type="date" className="border rounded px-2 py-1 text-sm w-full" value={expQuery.hasta} onChange={e=>setExpQuery({...expQuery, hasta:e.target.value})} />
                    </label>
                  </div>
                  <div className="overflow-auto max-h-64 border rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-3 py-2">N° expediente</th>
                          <th className="px-3 py-2">Tipo</th>
                          <th className="px-3 py-2">Estado</th>
                          <th className="px-3 py-2">Fecha</th>
                          <th className="px-3 py-2">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expRows.length===0 ? (
                          <tr><td className="px-3 py-3 text-sm text-gray-500" colSpan={5}>Sin resultados</td></tr>
                        ) : expRows.map((r,idx)=>(
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2">{r.numero}</td>
                            <td className="px-3 py-2">{r.tipo}</td>
                            <td className="px-3 py-2">{r.estado}</td>
                            <td className="px-3 py-2">{r.fecha}</td>
                            <td className="px-3 py-2">
                              <button className="px-2 py-1 text-xs border rounded-md bg-emerald-600 text-white hover:bg-emerald-700" onClick={()=>seleccionarExp(r)}>Seleccionar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
                  <button className="px-3 py-1.5 rounded border" onClick={()=>setShowExpModal(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
          <button className="px-3 py-1.5 rounded border" onClick={onClose}>Cancelar</button>
          <button
            className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={completedRequired < totalRequired || anyErrors || !inputsValid}
            onClick={()=> { const merged = [...files]; Object.keys(filesByReq||{}).forEach(k=>{ const arr = filesByReq[k]||[]; for(const f of arr) merged.push(f) }); onSave(merged) }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}