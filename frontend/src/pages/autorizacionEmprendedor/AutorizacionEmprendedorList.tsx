import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expediente, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

export default function AutorizacionesEmprendedoresList() {
    const [loading, setLoading] = useState(false);

    const [rows, setRows] = useState(()=>{
    const base = [
      {
        via_publica: {
          id_auto_viapublica: 101,
          id_persona: 1,
          id_expediente: 5001,
          fecha_solicitud: "2025-09-10",
          modalidad: "AUTORIZACION_MUNICIPAL_TEMPORAL",
          fecha_inicio_temporal: "2025-10-01",
          fecha_fin_temporal: "2025-10-07",
          otras_referencia: "Evento aniversario"
        },
        establecimiento: {
          id_auto_establecimiento: 201,
          id_auto_viapublica: 101,
          modulo_movible: true,
          modulo_estacionario: false,
          triciclo: false,
          vehiculo_motorizado: false,
          medio_venta: "Carrito",
          giro_actividad: "Venta de alimentos",
          via_tipo: "AV",
          via_nombre: "La Marina",
          numero: "1234",
          interior: "",
          mz: "",
          lt: "",
          otros: "",
          urb_aa_hh_otros: "Urb. San Miguel",
          ubicacion: "Frente a parque 3",
          lat: -12.086123,
          lng: -77.079561,
          map_zoom: 17
        },
        anexos_count: 2,
        persona_nombre: "ACME S.A.C.",
      },
      {
        via_publica: {
          id_auto_viapublica: 102,
          id_persona: 2,
          id_expediente: 5002,
          fecha_solicitud: "2025-09-12",
          modalidad: "AUTORIZACION_MUNICIPAL_EXCEPCIONAL",
          fecha_inicio_temporal: "2025-09-28",
          fecha_fin_temporal: "2025-09-29",
          otras_referencia: "Exposición artesanal"
        },
        establecimiento: {
          id_auto_establecimiento: 202,
          id_auto_viapublica: 102,
          modulo_movible: false,
          modulo_estacionario: true,
          triciclo: false,
          vehiculo_motorizado: false,
          medio_venta: "Stand fijo",
          giro_actividad: "Exposición cultural",
          via_tipo: "JR",
          via_nombre: "Universitaria",
          numero: "555",
          interior: "B",
          mz: "M1",
          lt: "L4",
          otros: "",
          urb_aa_hh_otros: "AA.HH. Central",
          ubicacion: "Plazoleta principal",
          lat: -12.07001,
          lng: -77.08031,
          map_zoom: 17
        },
        anexos_count: 0,
        persona_nombre: "Juan Pérez",
      }
    ];
    return base;
  });

  // ====== Filtros + paginación ======
  const [q, setQ] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("fecha_solicitud");
  const [sortDir, setSortDir] = useState("desc");

  function toggleSort(col){
    if(sortBy===col){ setSortDir(d=>d==='asc'?'desc':'asc') } else { setSortBy(col); setSortDir('asc') }
  }

  const filtered = useMemo(()=>{
    return rows.filter(r=>{
      const v = r.via_publica;
      const e = r.establecimiento;
      const hitQ = q ? (
        String(v.id_auto_viapublica).includes(q) ||
        String(v.id_expediente).includes(q) ||
        (r.persona_nombre||"").toLowerCase().includes(q.toLowerCase()) ||
        (e.via_nombre||"").toLowerCase().includes(q.toLowerCase())
      ) : true;
      const hitMod = modalidad ? v.modalidad===modalidad : true;
      const hitDesde = desde ? (v.fecha_solicitud >= desde) : true;
      const hitHasta = hasta ? (v.fecha_solicitud <= hasta) : true;
      return hitQ && hitMod && hitDesde && hitHasta;
    });
  }, [rows,q,modalidad,desde,hasta]);

  const sorted = useMemo(()=>{
    const s = [...filtered];
    s.sort((a,b)=>{
      const av = a.via_publica; const bv = b.via_publica;
      const dir = (sortDir==='asc')?1:-1;
      if(sortBy==='fecha_solicitud') return (av.fecha_solicitud>bv.fecha_solicitud?1:-1)*dir;
      if(sortBy==='id_auto_viapublica') return (av.id_auto_viapublica>bv.id_auto_viapublica?1:-1)*dir;
      if(sortBy==='via_nombre') return (a.establecimiento.via_nombre>b.establecimiento.via_nombre?1:-1)*dir;
      if(sortBy==='persona') return ((a.persona_nombre||"")>(b.persona_nombre||"")?1:-1)*dir;
      return 0;
    })
    return s;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage-1)*pageSize, safePage*pageSize);

    // ====== Modal NUEVO / EDITAR ======
  const emptyForm = {
    via_publica: {
      id_auto_viapublica: null,
      id_persona: "",
      id_expediente: "",
      fecha_solicitud: "",
      modalidad: "AUTORIZACION_MUNICIPAL_TEMPORAL",
      fecha_inicio_temporal: "",
      fecha_fin_temporal: "",
      otras_referencia: "",
    },
    establecimiento: {
      id_auto_establecimiento: null,
      id_auto_viapublica: null,
      modulo_movible: false,
      modulo_estacionario: false,
      triciclo: false,
      vehiculo_motorizado: false,
      medio_venta: "",
      giro_actividad: "",
      via_tipo: "AV",
      via_nombre: "",
      numero: "",
      interior: "",
      mz: "",
      lt: "",
      otros: "",
      urb_aa_hh_otros: "",
      ubicacion: "",
      lat: -12.05,
      lng: -77.05,
      map_zoom: 17,
    },
    anexos_count: 0,
    persona_nombre: "",
  };

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // id_auto_viapublica cuando se edita
  const [errors, setErrors] = useState({});

  function validate(current=form){
    const v = current.via_publica; const e = current.establecimiento;
    const err = {};
    if(!v.id_persona) err.id_persona = 'Requerido';
    if(!v.id_expediente) err.id_expediente = 'Requerido';
    if(!v.fecha_solicitud) err.fecha_solicitud = 'Requerido';
    if(!e.via_nombre) err.via_nombre = 'Requerido';
    if(!e.giro_actividad) err.giro_actividad = 'Requerido';
    if(typeof e.lat !== 'number') err.lat = 'Lat inválido';
    if(typeof e.lng !== 'number') err.lng = 'Lng inválido';
    setErrors(err);
    return Object.keys(err).length===0;
  }

  function openNew(){
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setOpenModal(true);
  }
  function openEdit(row){
    setEditingId(row.via_publica.id_auto_viapublica);
    setForm(JSON.parse(JSON.stringify(row))); // clonar simple
    setErrors({});
    setOpenModal(true);
  }

  function save(){
    if(!validate()) return;
    if(editingId==null){
      // Crear (id autoincremental simulado)
      const newId = Math.max(0, ...rows.map(r=>r.via_publica.id_auto_viapublica)) + 1;
      const newEstId = Math.max(0, ...rows.map(r=>r.establecimiento.id_auto_establecimiento)) + 1;
      const rec = JSON.parse(JSON.stringify(form));
      rec.via_publica.id_auto_viapublica = newId;
      rec.establecimiento.id_auto_establecimiento = newEstId;
      rec.establecimiento.id_auto_viapublica = newId;
      setRows(prev=>[rec, ...prev]);
    } else {
      // Actualizar
      setRows(prev=>prev.map(r=> r.via_publica.id_auto_viapublica===editingId ? JSON.parse(JSON.stringify(form)) : r));
    }
    setOpenModal(false);
  }

  function removeRow(row){
    if(!confirm(`Eliminar autorización ${row.via_publica.id_auto_viapublica}?`)) return;
    setRows(prev=>prev.filter(r=> r.via_publica.id_auto_viapublica!==row.via_publica.id_auto_viapublica));
  }

    return (
    <div className="min-h-screen bg-gray-50">
  {/* Header */}
  <header className="sticky top-0 z-10 bg-white border-b">
    {/* ⬇️ antes: max-w-7xl mx-auto px-4 ... */}
    <div className="w-full max-w-none px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold leading-none">Autorizaciones en Vía Pública</h1>
        <p className="text-xs text-gray-500">Listado + Nuevo/Editar (simulación local)</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-black" onClick={openNew}>Nuevo</button>
      </div>
    </div>
  </header>

  {/* Filtros */}
  {/* ⬇️ antes: max-w-7xl mx-auto px-4 py-4 */}
  <section className="w-full max-w-none px-4 md:px-6 lg:px-8 py-4">
    <div className="grid sm:grid-cols-6 gap-2">
      <input className="border rounded px-3 py-2 text-sm sm:col-span-2" placeholder="Buscar (ID, expediente, persona, vía)" value={q} onChange={e=>setQ(e.target.value)} />
      <select className="border rounded px-3 py-2 text-sm" value={modalidad} onChange={e=>setModalidad(e.target.value)}>
        <option value="">Modalidad</option>
        <option value="AUTORIZACION_MUNICIPAL_TEMPORAL">Temporal</option>
        <option value="AUTORIZACION_MUNICIPAL_EXCEPCIONAL">Excepcional</option>
      </select>
      <input type="date" className="border rounded px-3 py-2 text-sm" value={desde} onChange={e=>setDesde(e.target.value)} />
      <input type="date" className="border rounded px-3 py-2 text-sm" value={hasta} onChange={e=>setHasta(e.target.value)} />
      <select className="border rounded px-3 py-2 text-sm" value={pageSize} onChange={e=>setPageSize(parseInt(e.target.value))}>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  </section>

  {/* Tabla */}
  {/* ⬇️ antes: max-w-7xl mx-auto px-4 pb-6 */}
  <section className="w-full max-w-none px-4 md:px-6 lg:px-8 pb-6">
    <div className="overflow-auto border rounded-xl bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <Th onClick={()=>toggleSort('id_auto_viapublica')} active={sortBy==='id_auto_viapublica'} dir={sortDir}>ID</Th>
            <Th onClick={()=>toggleSort('fecha_solicitud')} active={sortBy==='fecha_solicitud'} dir={sortDir}>Fecha solicitud</Th>
            <Th>Modalidad</Th>
            <Th onClick={()=>toggleSort('via_nombre')} active={sortBy==='via_nombre'} dir={sortDir}>Vía</Th>
            <Th>N°</Th>
            <Th onClick={()=>toggleSort('persona')} active={sortBy==='persona'} dir={sortDir}>Persona</Th>
            <Th>Expediente</Th>
            <Th>Anexos</Th>
            <Th>Acción</Th>
          </tr>
        </thead>
        <tbody>
          {pageRows.length===0 ? (
            <tr><td className="px-3 py-4 text-gray-500" colSpan={9}>Sin resultados</td></tr>
          ) : pageRows.map((r)=>{
            const v=r.via_publica, e=r.establecimiento;
            return (
              <tr key={v.id_auto_viapublica} className="border-t">
                <td className="px-3 py-2">{v.id_auto_viapublica}</td>
                <td className="px-3 py-2 whitespace-nowrap">{v.fecha_solicitud}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${v.modalidad.includes('TEMPORAL')? 'bg-blue-50 text-blue-700 border border-blue-200':'bg-amber-50 text-amber-800 border border-amber-200'}`}>{v.modalidad.replace('AUTORIZACION_MUNICIPAL_','')}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{e.via_tipo} {e.via_nombre}</td>
                <td className="px-3 py-2">{e.numero||'-'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.persona_nombre||'-'}</td>
                <td className="px-3 py-2">{v.id_expediente}</td>
                <td className="px-3 py-2">{r.anexos_count}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 text-xs border rounded" onClick={()=>openEdit(r)}>Editar</button>
                    <button className="px-2 py-1 text-xs border rounded text-red-700" onClick={()=>removeRow(r)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <div className="mt-3 flex items-center justify-between text-sm">
      <div>Mostrando {pageRows.length} de {sorted.length}</div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={safePage<=1} onClick={()=>setPage(p=>p-1)}>Anterior</button>
        <span>Página {safePage} / {totalPages}</span>
        <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={safePage>=totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
      </div>
    </div>
  </section>

  {/* Modal */}
  {openModal && (
    <Modal onClose={()=>setOpenModal(false)} title={(editingId==null? 'Nueva':'Editar')+ ' autorización'}>
      <FormAutorizacion form={form} setForm={setForm} errors={errors} setErrors={setErrors} validate={validate} />
      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="px-3 py-1.5 rounded border" onClick={()=>setOpenModal(false)}>Cancelar</button>
        <button className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black" onClick={save}>Guardar</button>
      </div>
    </Modal>
  )}
</div>

    );

}

function Th({children, onClick, active, dir}){
  return (
    <th className={`px-3 py-2 ${onClick? 'cursor-pointer':''}`} onClick={onClick}>
      <div className="inline-flex items-center gap-1">
        <span>{children}</span>
        {active && (<span className="text-[10px]">{dir==='asc'? '▲':'▼'}</span>)}
      </div>
    </th>
  )
}

function Modal({ children, title, onClose }){
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="absolute inset-0 p-4 grid place-items-center">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FormAutorizacion({ form, setForm, errors, setErrors, validate }){
  const v = form.via_publica; const e = form.establecimiento;

  function setV(p){ setForm(f=>({ ...f, via_publica: { ...f.via_publica, ...p } })) }
  function setE(p){ setForm(f=>({ ...f, establecimiento: { ...f.establecimiento, ...p } })) }

    return (
    <div className="space-y-6">
      {/* Datos generales (via_publica) */}
      <section className="border rounded-xl overflow-hidden">
        <header className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold">Datos de la solicitud</header>
        <div className="p-4 grid sm:grid-cols-3 gap-3">
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">ID Persona *</span>
            <input className={`w-full border rounded px-2 py-1 ${errors.id_persona? 'border-red-500':''}`} value={v.id_persona} onChange={e=>setV({ id_persona: e.target.value })} />
            {errors.id_persona && (<div className="text-[11px] text-red-600">{errors.id_persona}</div>)}
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">ID Expediente *</span>
            <input className={`w-full border rounded px-2 py-1 ${errors.id_expediente? 'border-red-500':''}`} value={v.id_expediente} onChange={e=>setV({ id_expediente: e.target.value })} />
            {errors.id_expediente && (<div className="text-[11px] text-red-600">{errors.id_expediente}</div>)}
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Persona / Razón social</span>
            <input className="w-full border rounded px-2 py-1" value={form.persona_nombre} onChange={e=>setForm(f=>({...f, persona_nombre: e.target.value }))} />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Fecha solicitud *</span>
            <input type="date" className={`w-full border rounded px-2 py-1 ${errors.fecha_solicitud? 'border-red-500':''}`} value={v.fecha_solicitud} onChange={e=>setV({ fecha_solicitud: e.target.value })} />
            {errors.fecha_solicitud && (<div className="text-[11px] text-red-600">{errors.fecha_solicitud}</div>)}
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Modalidad</span>
            <select className="w-full border rounded px-2 py-1" value={v.modalidad} onChange={e=>setV({ modalidad: e.target.value })}>
              <option value="AUTORIZACION_MUNICIPAL_TEMPORAL">AUTORIZACION_MUNICIPAL_TEMPORAL</option>
              <option value="AUTORIZACION_MUNICIPAL_EXCEPCIONAL">AUTORIZACION_MUNICIPAL_EXCEPCIONAL</option>
            </select>
          </label>
          <div className="sm:col-span-3 grid sm:grid-cols-3 gap-3">
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Inicio (temporal)</span>
              <input type="date" className="w-full border rounded px-2 py-1" value={v.fecha_inicio_temporal} onChange={e=>setV({ fecha_inicio_temporal: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Fin (temporal)</span>
              <input type="date" className="w-full border rounded px-2 py-1" value={v.fecha_fin_temporal} onChange={e=>setV({ fecha_fin_temporal: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Otras referencias</span>
              <input className="w-full border rounded px-2 py-1" value={v.otras_referencia} onChange={e=>setV({ otras_referencia: e.target.value })} />
            </label>
          </div>
        </div>
      </section>

      {/* Establecimiento */}
      <section className="border rounded-xl overflow-hidden">
        <header className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold">Ubicación / Establecimiento</header>
        <div className="p-4 grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={e.modulo_movible} onChange={ev=>setE({ modulo_movible: ev.target.checked })}/> Módulo movible</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={e.modulo_estacionario} onChange={ev=>setE({ modulo_estacionario: ev.target.checked })}/> Módulo estacionario</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={e.triciclo} onChange={ev=>setE({ triciclo: ev.target.checked })}/> Triciclo</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={e.vehiculo_motorizado} onChange={ev=>setE({ vehiculo_motorizado: ev.target.checked })}/> Vehículo motorizado</label>
          </div>

          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Medio de venta</span>
            <input className="w-full border rounded px-2 py-1" value={e.medio_venta} onChange={e2=>setE({ medio_venta: e2.target.value })} />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Giro / Actividad *</span>
            <input className={`w-full border rounded px-2 py-1 ${errors.giro_actividad? 'border-red-500':''}`} value={e.giro_actividad} onChange={e2=>setE({ giro_actividad: e2.target.value })} />
            {errors.giro_actividad && (<div className="text-[11px] text-red-600">{errors.giro_actividad}</div>)}
          </label>

          <div className="sm:col-span-3 grid sm:grid-cols-7 gap-2">
            <label className="text-sm col-span-2">
              <span className="block text-xs text-gray-600 mb-1">Tipo de vía</span>
              <select className="w-full border rounded px-2 py-1" value={e.via_tipo} onChange={e2=>setE({ via_tipo: e2.target.value })}>
                <option value="AV">AV</option>
                <option value="JR">JR</option>
                <option value="CL">CL</option>
                <option value="PSJ">PSJ</option>
              </select>
            </label>
            <label className="text-sm col-span-3">
              <span className="block text-xs text-gray-600 mb-1">Nombre de vía *</span>
              <input className={`w-full border rounded px-2 py-1 ${errors.via_nombre? 'border-red-500':''}`} value={e.via_nombre} onChange={e2=>setE({ via_nombre: e2.target.value })} />
              {errors.via_nombre && (<div className="text-[11px] text-red-600">{errors.via_nombre}</div>)}
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">N°</span>
              <input className="w-full border rounded px-2 py-1" value={e.numero} onChange={e2=>setE({ numero: e2.target.value })} />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Interior</span>
              <input className="w-full border rounded px-2 py-1" value={e.interior} onChange={e2=>setE({ interior: e2.target.value })} />
            </label>
          </div>

          <div className="sm:col-span-3 grid sm:grid-cols-6 gap-2">
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">MZ</span>
              <input className="w-full border rounded px-2 py-1" value={e.mz} onChange={e2=>setE({ mz: e2.target.value })} />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">LT</span>
              <input className="w-full border rounded px-2 py-1" value={e.lt} onChange={e2=>setE({ lt: e2.target.value })} />
            </label>
            <label className="text-sm col-span-2">
              <span className="block text-xs text-gray-600 mb-1">Urb/AA.HH./Otros</span>
              <input className="w-full border rounded px-2 py-1" value={e.urb_aa_hh_otros} onChange={e2=>setE({ urb_aa_hh_otros: e2.target.value })} />
            </label>
            <label className="text-sm col-span-2">
              <span className="block text-xs text-gray-600 mb-1">Ubicación</span>
              <input className="w-full border rounded px-2 py-1" value={e.ubicacion} onChange={e2=>setE({ ubicacion: e2.target.value })} />
            </label>
          </div>

          <div className="sm:col-span-3 grid sm:grid-cols-3 gap-2">
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Lat *</span>
              <input className={`w-full border rounded px-2 py-1 ${errors.lat? 'border-red-500':''}`} value={e.lat} onChange={e2=>setE({ lat: parseFloat(e2.target.value) })} />
              {errors.lat && (<div className="text-[11px] text-red-600">{errors.lat}</div>)}
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Lng *</span>
              <input className={`w-full border rounded px-2 py-1 ${errors.lng? 'border-red-500':''}`} value={e.lng} onChange={e2=>setE({ lng: parseFloat(e2.target.value) })} />
              {errors.lng && (<div className="text-[11px] text-red-600">{errors.lng}</div>)}
            </label>
            <label className="text-sm">
              <span className="block text-xs text-gray-600 mb-1">Zoom</span>
              <input className="w-full border rounded px-2 py-1" value={e.map_zoom} onChange={e2=>setE({ map_zoom: parseInt(e2.target.value||'17') })} />
            </label>
          </div>
        </div>
      </section>

      {/* Anexos (placeholder simple) */}
      <section className="border rounded-xl overflow-hidden">
        <header className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold">Anexos (resumen)</header>
        <div className="p-4 text-sm text-gray-600">
          Por ahora este formulario solo maneja el <b>conteo</b> de anexos. La tabla <code>autorizacion_anexo</code> se integrará en una vista dedicada de adjuntos (cargar/validar PDF, JPG, DOCX, etc.).
        </div>
      </section>
    </div>
  );
}
