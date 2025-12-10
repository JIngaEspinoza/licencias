import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, Loader } from 'lucide-react'; 
// Asegúrate de que las rutas de tus servicios sean correctas
import { zonificacionesApi, Zonificacion } from "../../services/zonificaciones";
import { usosApi, Uso } from "../../services/usos";
import { girosApi, Giro } from "../../services/giros";
// Importa el objeto corregido (debes asegurarte que updateAsignacion esté definido allí)
import { giroszonificacionesApi, GiroZonificacion } from "../../services/girosZonificaciones"; 
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";
import { Toast } from "../../lib/toast";

// --- SIMULACIÓN DE COMPONENTES DE LIBRERÍA Y UTILIDADES ---
const Tabs = ({ children, value, onValueChange }) => <div className="space-y-4">{children}</div>;
const TabsList = ({ children, className }) => <div className={`flex bg-gray-200 p-1 rounded-lg ${className}`}>{children}</div>;
const TabsTrigger = ({ children, value, className, onClick }) => (
    <button onClick={onClick} className={`flex-1 py-2 px-4 transition-all duration-300 ${className}`}>{children}</button>
);
const TabsContent = ({ children, value, activeTab }) => (
    value === activeTab ? <div className="mt-2">{children}</div> : null
);
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>;
const CardDescription = ({ children }) => <p className="text-sm text-gray-500">{children}</p>;
const CardContent = ({ children, className }) => <div className={`p-4 ${className}`}>{children}</div>;
const Label = ({ children }) => <label className="block text-sm font-medium text-gray-700">{children}</label>;
const Input = ({ ...props }) => <input {...props} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />;
const Button = ({ children, onClick, disabled, type = 'button', variant, className, title }) => (
    <button 
        onClick={onClick} 
        disabled={disabled} 
        type={type} 
        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${className}`}
        title={title}
    >
        {children}
    </button>
);
const Dialog = ({ children, open, onOpenChange }) => (
    open ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" onClick={() => onOpenChange(false)}>
            {React.cloneElement(children, { onOpenChange })}
        </div>
    ) : null
);
const DialogContent = ({ children, className, onOpenChange }) => (
    <div 
        className={`bg-white rounded-xl p-6 shadow-2xl relative max-w-full max-h-[90vh] overflow-y-auto ${className}`} 
        onClick={(e) => e.stopPropagation()}
    >
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => onOpenChange(false)}>
            &times;
        </button>
        {children}
    </div>
);
const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
const DialogFooter = ({ children, className }) => <div className={`mt-4 pt-2 border-t flex justify-end gap-2 ${className}`}>{children}</div>;
const cn = (classes) => classes.filter(Boolean).join(' '); 
//const swalError = async (message) => { alert(`[ERROR] ${message}`); };
//const swalSuccess = async (message) => { alert(`[SUCCESS] ${message}`); };
// --- DATOS GLOBALES Y SIMULADOR CRUD ---
const crudSimulador = (data, setData) => ({
    save: async (item, editingId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (editingId) {
            setData(data.map(d => (d.id === editingId) ? { ...d, ...item } : d));
            return 'actualizado';
        } else {
            setData([...data, { ...item, id: Date.now() }]);
            return 'creado';
        }
    },
    remove: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(data.filter(d => (d.id !== id)));
        return 'eliminado';
    }
});

// --- COMPONENTE: ESTADO INPUT (Vista de Asignación) ---
// 🟢 Memoizado: Solo se renderiza si sus props cambian.
const EstadoInput = ({ giroId, zonificacionId, estadoActual, onEstadoChange, codigosValidos }) => {
    const [inputValue, setInputValue] = useState(estadoActual);
    const [isInvalid, setIsInvalid] = useState(false);
    const CODIGOS_VALIDOS = codigosValidos;
    
    // Sincroniza el input si el estadoActual cambia (ej. por reversión de la API)
    useEffect(() => {
        setInputValue(estadoActual);
    }, [estadoActual]);

    const handleBlur = (e) => {
        const newValue = e.target.value.toUpperCase().trim();
        const isValid = CODIGOS_VALIDOS.includes(newValue) || newValue === ""; 

        if (isValid && newValue !== estadoActual) {
            setIsInvalid(false);
            onEstadoChange(giroId, zonificacionId, newValue);
        } else if (newValue !== "" && !isValid) {
            setIsInvalid(true);
            swalError(`Código inválido: "${newValue}". Debe ser ${CODIGOS_VALIDOS.join(', ')}.`);
            setTimeout(() => setInputValue(estadoActual), 100); 
        } else {
            setIsInvalid(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            e.target.blur();
        }
    };

    return (
        <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            maxLength={1} 
            className={cn([
                "w-full text-center p-0 border-0 bg-transparent text-sm font-semibold uppercase focus:ring-0",
                isInvalid ? 'text-red-600 border border-red-600' : 'text-gray-900'
            ])}
            style={{ width: '40px', margin: '0 auto' }} 
            title={`Estado actual: ${estadoActual}. Ingrese ${CODIGOS_VALIDOS.join(', ')}`}
        />
    );
};

const MemoizedEstadoInput = React.memo(EstadoInput);

// --- COMPONENTE: GESTIÓN DE USOS (GiroZonificacionTable - VISTA PRINCIPAL) ---

// 🟢 Componente base que recibe el total de Giros para el indicador de filtro
const GiroZonificacionTableComponent = ({ girosData, zonificacionesData, initialAsignaciones, estadosUso, totalGiros }) => {
    // 1. Usa la prop initialAsignaciones para el estado de la matriz
    const [asignaciones, setAsignaciones] = useState(initialAsignaciones);
    /*console.log("giro=" + girosData)
    console.log("zonificacion=" + zonificacionesData)
    console.log("initialAsignaciones=" + initialAsignaciones)
    console.log("estadosUso=" + estadosUso)
    console.log("totalGiros=" + totalGiros)*/
    // Calcula CODIGOS_VALIDOS
    const CODIGOS_VALIDOS = estadosUso.map(e => e.codigo);
    
    // Sincroniza el estado local cuando la data inicial del contenedor cambia 
    useEffect(() => {
        setAsignaciones(initialAsignaciones);
    }, [initialAsignaciones]);

    const handleEstadoChange = async (giroId, zonificacionId, nuevoEstado) => {
        
        // 1. Actualización optimista del estado local
        const estadoPrevio = asignaciones[giroId]?.[zonificacionId] || "";

        setAsignaciones(prev => ({
            ...prev,
            [giroId]: {
                ...(prev[giroId] || {}), 
                [zonificacionId]: nuevoEstado,
            },
        }));

        try {
            console.log(`[API CALL] Guardando Giro ${giroId} en Zona ${zonificacionId} con Estado: ${nuevoEstado}`);
            
            // Llama al servicio (ASUMIMOS que updateAsignacion existe y funciona)
            await giroszonificacionesApi.updateAsignacion(
                giroId, 
                zonificacionId, 
                nuevoEstado
            );
            
            //await swalSuccess(`Guardado: Giro ${giroId} en Zona ${zonificacionId} actualizado a ${nuevoEstado}.`);
            Toast.fire({ icon: "success", title: `Guardado: Giro ${giroId} en Zona ${zonificacionId} actualizado a ${nuevoEstado}.` });
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            await swalError("Error al guardar el cambio en la API. Revirtiendo.");
            
            // Reversión de estado si falla la API
             setAsignaciones(prev => ({
                ...prev,
                [giroId]: {
                    ...(prev[giroId] || {}), 
                    [zonificacionId]: estadoPrevio, // Vuelve al estado anterior
                },
            }));
        }
    };

    return (
        <div className="p-4 bg-white shadow-xl rounded-xl">
            <h2 className="text-xl font-bold mb-4">Asignación de Usos y Zonificación
              <span className="text-sm font-normal text-gray-500 ml-3">
                ({girosData.length} de {totalGiros} Giros mostrados)
              </span>
            </h2>
            <div className="mt-4 text-sm text-gray-600">
                Estados de Uso: 
                {estadosUso.map(e => <span key={e.codigo} className="ml-2 font-semibold">{e.codigo} = {e.descripcion}</span>)}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="sticky left-0 bg-blue-50 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/3 border-r border-gray-300">
                                Giro / Actividad Económica
                            </th>
                            {zonificacionesData.map((zona) => ( 
                                <th key={zona.id_zonificacion} className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-l border-gray-300 w-16">
                                    {zona.codigo}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Itera sobre los giros filtrados */}
                        {girosData.map((giro) => ( 
                            <tr key={giro.id_giro}>
                                <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
                                    <span className="font-semibold text-gray-500 mr-2">{giro.codigo}</span>
                                    {giro.nombre}
                                </td>
                                
                                {zonificacionesData.map((zona) => {
                                    const estado = asignaciones[giro.id_giro]?.[zona.id_zonificacion] || ""; 
                                    return (
                                        <td key={zona.id_zonificacion} className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 text-center border-l border-gray-300">
                                            {/* Usa la versión memoizada */}
                                            <MemoizedEstadoInput
                                                giroId={giro.id_giro}
                                                zonificacionId={zona.id_zonificacion}
                                                estadoActual={estado}
                                                onEstadoChange={handleEstadoChange}
                                                codigosValidos={CODIGOS_VALIDOS} 
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
};

// 🟢 Esta es la única definición de GiroZonificacionTable
const GiroZonificacionTable = React.memo(GiroZonificacionTableComponent);

// --- COMPONENTE: CONTROLES DE PAGINACIÓN ---
const PaginationControls = ({ currentPage, totalItems, itemsPerPage, onPageChange, isLoading }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalItems <= itemsPerPage) return null; // Ocultar si todo cabe en una página

  // Lógica simplificada para mostrar 1, página anterior, actual, siguiente, ..., y la última.
  const pages = [];
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
  }

  // Agregar la primera página y los puntos si es necesario
  if (!pages.includes(1) && totalPages > 1) {
      pages.unshift(1);
      if (pages[1] > 2) pages.splice(1, 0, '...');
  }
  // Agregar la última página y los puntos si es necesario
  if (!pages.includes(totalPages) && totalPages > 1) {
      if (pages[pages.length - 1] < totalPages - 1) {
            pages.push('...');
      }
      pages.push(totalPages);
  }
  
  // Filtramos puntos duplicados que pudieran quedar
  const finalPages = pages.filter((item, index) => !(item === '...' && pages[index + 1] === '...'));

  return (
      <div className="flex justify-center items-center mt-6 space-x-1.5">
          <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2"
          >
              Anterior
          </Button>

          {finalPages.map((page, index) => (
            page === '...' ? (
                // AHORA: Usamos un prefijo único MÁS el índice.
                // Esto garantiza que si hay dos '...' en la lista, sus claves serán distintas:
                // Key: 'ellipsis-1', Key: 'ellipsis-5'
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
            ) : (
                <Button 
                    key={page} // Usamos el número de página (es único)
                    onClick={() => onPageChange(page)} 
                    disabled={page === currentPage || isLoading} 
                    // ... (otras clases)
                >
                    {page}
                </Button>
            )
        ))}

          <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2"
          >
              Siguiente
          </Button>
      </div>
  );
};



// --- COMPONENTE: GESTIÓN DE GIROS (GiroList) ---

const GiroList = ({ initialData = [], setGirosData, reloadData }) => {
    const [rows, setRows] = useState(initialData); 
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGiro, setEditingGiro] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setRows(initialData);
    }, [initialData]);
    
    const { save, remove } = crudSimulador(rows, setRows); 

    const handleOpen = (giro = null) => {
        setEditingGiro(giro);
        setOpenDialog(true);
    };

    const handleRemove = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este Giro?")) return;
        try {
            await remove(id);
            // Actualiza el contenedor después de la simulación de eliminado
            //setGirosData(rows.filter(d => (d.id !== id))); 
            reloadData();
            await swalSuccess("Giro eliminado.");
        } catch (err) {
            await swalError("Error al eliminar.");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const payload = {
            codigo: String(f.get("codigo") || "").trim().toUpperCase(),
            nombre: String(f.get("nombre") || "").trim(),
        };

        if (!payload.codigo || !payload.nombre) {
            await swalError("El código y el nombre son obligatorios.");
            return;
        }

        setIsSaving(true);
        try {
            const action = await save(payload, editingGiro?.id);
            // Fuerza la sincronización con el estado global
            // Nota: Aquí se está asumiendo que setRows ya ha actualizado rows
            // setGirosData([...rows, { ...payload, id: editingGiro?.id || Date.now() }]); 
            reloadData();
            await swalSuccess(`Giro ${action} exitosamente.`);
            setOpenDialog(false);
        } catch (err) {
            await swalError("Error al guardar Giro.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="rounded-2xl shadow">
             <CardHeader>
                 <CardTitle>Gestión de Giros (Actividades)</CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                 <div className="flex justify-end">
                      <Button
                          onClick={() => handleOpen()}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white shadow hover:bg-emerald-700"
                      >
                          <Plus size={18} /> Nuevo Giro
                      </Button>
                  </div>
                  <div className="overflow-auto border rounded-xl">
                      <table className="w-full text-sm">
                          <thead className="bg-zinc-50">
                              <tr>
                                  <th className="text-left p-3 w-1/4">Código</th>
                                  <th className="text-left p-3">Nombre / Descripción</th>
                                  <th className="text-right p-3">Acciones</th>
                              </tr>
                          </thead>
                          <tbody>
                              {rows.map((g) => (
                                  <tr key={g.id_giro} className="border-t last:border-b">
                                      <td className="px-4 py-3 font-mono text-xs font-semibold">{g.codigo}</td>
                                      <td className="w-[50%] px-4 py-3">{g.nombre}</td>
                                      <td className="px-4 py-3 text-right space-x-2">
                                          <Button onClick={() => handleOpen(g)} className="text-blue-600 hover:text-blue-800" title="Editar">
                                              <Edit2 size={16} />
                                          </Button>
                                          <Button onClick={() => handleRemove(g.id)} className="text-red-600 hover:text-red-800" title="Eliminar">
                                              <Trash2 size={16} />
                                          </Button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogContent className="sm:max-w-[450px]">
                          <DialogHeader>
                              <DialogTitle>{editingGiro ? 'Editar Giro' : 'Crear Nuevo Giro'}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={onSubmit}>
                              <div className="space-y-4 py-2">
                                  <div>
                                      <Label>Código *</Label>
                                      <Input name="codigo" required defaultValue={editingGiro?.codigo || ''} placeholder="Ej: A111" disabled={isSaving || !!editingGiro} />
                                  </div>
                                  <div>
                                      <Label>Nombre / Descripción *</Label>
                                      <Input name="nombre" required defaultValue={editingGiro?.nombre || ''} placeholder="Descripción de la actividad" />
                                  </div>
                              </div>
                              <DialogFooter>
                                  <Button type="button" onClick={() => setOpenDialog(false)} disabled={isSaving} className="bg-gray-300 hover:bg-gray-400 text-black">
                                      Cancelar
                                  </Button>
                                  <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                      {isSaving ? "Guardando..." : "Guardar"}
                                  </Button>
                              </DialogFooter>
                          </form>
                      </DialogContent>
                  </Dialog>
              </CardContent>
        </Card>
    );
};


// --- COMPONENTE: GESTIÓN DE ZONIFICACIONES (ZonificacionList) ---

const ZonificacionList = ({ initialData = [], setZonificacionesData, reloadData }) => {
    const [rows, setRows] = useState(initialData); 
    const [openDialog, setOpenDialog] = useState(false);
    const [editingZona, setEditingZona] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setRows(initialData);
    }, [initialData]);
    
    const { save, remove } = crudSimulador(rows, setRows); 

    const handleOpen = (zona = null) => {
        setEditingZona(zona);
        setOpenDialog(true);
    };

    const handleRemove = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta Zona?")) return;
        try {
            await remove(id);
            // Actualiza el contenedor después de la simulación de eliminado
            // setZonificacionesData(rows.filter(d => (d.id !== id))); 
            reloadData();
            await swalSuccess("Zona eliminada.");
        } catch (err) {
            await swalError("Error al eliminar.");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const payload = {
            codigo: String(f.get("codigo") || "").trim().toUpperCase(),
            descripcion: String(f.get("descripcion") || "").trim(),
        };

        if (!payload.codigo || !payload.descripcion) {
            await swalError("El código y la descripción son obligatorios.");
            return;
        }

        setIsSaving(true);
        try {
            const action = await save(payload, editingZona?.id);
            // Fuerza la sincronización con el estado global
            //setZonificacionesData([...rows, { ...payload, id: editingZona?.id || Date.now() }]);
            reloadData();
            await swalSuccess(`Zonificación ${action} exitosamente.`);
            setOpenDialog(false);
        } catch (err) {
            await swalError("Error al guardar Zonificación.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="rounded-2xl shadow">
            <CardHeader>
                <CardTitle>Gestión de Zonificaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-end">
                    <Button
                        onClick={() => handleOpen()}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white shadow hover:bg-emerald-700"
                    >
                        <Plus size={18} /> Nueva Zona
                    </Button>
                </div>
                <div className="overflow-auto border rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="text-left p-3 w-1/4">Código</th>
                                <th className="text-left p-3">Descripción</th>
                                <th className="text-right p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((z) => (
                                <tr key={z.id_zonificacion} className="border-t last:border-b">
                                    <td className="px-4 py-3 font-mono text-xs font-semibold">{z.codigo}</td>
                                    <td className="w-[50%] px-4 py-3">{z.descripcion}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <Button onClick={() => handleOpen(z)} className="text-blue-600 hover:text-blue-800" title="Editar">
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button onClick={() => handleRemove(z.id)} className="text-red-600 hover:text-red-800" title="Eliminar">
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle>{editingZona ? 'Editar Zonificación' : 'Crear Nueva Zonificación'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={onSubmit}>
                            <div className="space-y-4 py-2">
                                <div>
                                    <Label>Código *</Label>
                                    <Input name="codigo" required defaultValue={editingZona?.codigo || ''} placeholder="Ej: RDB, CM" disabled={isSaving || !!editingZona} />
                                </div>
                                <div>
                                    <Label>Descripción *</Label>
                                    <Input name="descripcion" required defaultValue={editingZona?.descripcion || ''} placeholder="Ej: Residencial Densidad Baja" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={() => setOpenDialog(false)} disabled={isSaving} className="bg-gray-300 hover:bg-gray-400 text-black">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {isSaving ? "Guardando..." : "Guardar"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};


// --- COMPONENTE PRINCIPAL (GiroZonificacionApp - CONTENEDOR DE CARGA) ---

export default function GiroZonificacionApp() {
    const [activeTab, setActiveTab] = useState("usos");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchGiro, setSearchGiro] = useState('');

    // 1. ESTADO DE PAGINACIÓN AÑADIDO
    const [pagination, setPagination] = useState({
      currentPage: 1,
      itemsPerPage: 50, // Límite de 50 giros por página
      totalItems: 0,
    });
    
    const [data, setData] = useState({
      giros: [],
      zonificaciones: [],
      asignaciones: {},
      estadosUso: [],
    });

    const loadData = useCallback(async (page, limit) => {
        setIsLoading(true);
        setError(null);
        try {
            const [estados, matrixResponse] = await Promise.all([
              usosApi.listWithoutPagination(),
              giroszonificacionesApi.matrix({ page, limit })
            ]);
            
            // Desestructuración segura del objeto de matriz
            const { 
              girosData = [], 
              zonificacionesData = [], 
              initialAsignaciones = {},
              totalGiros = 0 
            } = matrixResponse;
            
            setData({
              giros: girosData,
              zonificaciones: zonificacionesData,
              asignaciones: initialAsignaciones,
              estadosUso: estados,
            });

            console.log(girosData)

            // Actualiza el total de items devuelto por el servidor
            setPagination(prev => ({
              ...prev,
              currentPage: page,
              totalItems: totalGiros,
            }));
            
            console.log("Datos de la matriz (Pág. " + page + ") cargados correctamente.");
            
        } catch (err) {
            console.error("Error al cargar datos iniciales:", err);
            setError("No se pudieron cargar los datos iniciales de la matriz. Revise el backend y la ruta /matrix.");
            setData({ giros: [], zonificaciones: [], asignaciones: {}, estadosUso: [] });
            setPagination(prev => ({ ...prev, totalItems: 0 }));
        } finally {
            setIsLoading(false);
        }
    }, []);

    console.log(data.estadosUso);

    // Función para recargar la data actual (la página actual)
    const reloadCurrentPage = useCallback(() => {
        loadData(pagination.currentPage, pagination.itemsPerPage);
    }, [loadData, pagination.currentPage, pagination.itemsPerPage]);
    
    useEffect(() => {
      loadData(pagination.currentPage, pagination.itemsPerPage);
    }, [loadData, pagination.currentPage, pagination.itemsPerPage]); 

    // Función que llama el componente PaginationControls
    const handlePageChange = (newPage) => {
      const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
      if (newPage >= 1 && newPage <= totalPages) {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
        // El useEffect se encarga de llamar a loadData con el nuevo currentPage
      }
    };

    // Lógica de filtrado optimizada (useMemo)
    const filteredGiros = useMemo(() => {
        if (!searchGiro) {
          return data.giros;
        }
        const lowerCaseSearch = searchGiro.toLowerCase();
        return data.giros.filter(giro => 
          giro.codigo.toLowerCase().includes(lowerCaseSearch) ||
          giro.nombre.toLowerCase().includes(lowerCaseSearch)
        );
    }, [data.giros, searchGiro]);
    
    if (isLoading && pagination.totalItems === 0) { // Muestra loader solo si es la carga inicial
      return (
        <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center">
          <Loader size={36} className="animate-spin text-blue-600 mr-3" />
          <h1 className="text-xl font-semibold">Cargando datos del sistema de Giros y Usos...</h1>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 bg-gray-50 min-h-screen text-red-600">
          <h1 className="text-xl font-bold mb-4">Error de Carga</h1>
          <p>{error}</p>
        </div>
      );
     }
     
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Administración de Giros y Usos</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-200 rounded-lg">
            <TabsTrigger 
              value="usos"
              onClick={() => setActiveTab("usos")}
              className={cn([
                "text-gray-600 hover:text-black bg-transparent rounded-lg transition-all duration-300",
                activeTab === "usos" && "bg-black text-white font-bold shadow-lg border-b-4 border-black"
              ])}
            >
              Asignación de Usos
            </TabsTrigger>
            <TabsTrigger 
              value="giros"
              onClick={() => setActiveTab("giros")}
              className={cn([
                "text-gray-600 hover:text-black bg-transparent rounded-lg transition-all duration-300",
                activeTab === "giros" && "bg-black text-white font-bold shadow-lg border-b-4 border-black"
              ])}
            >
              Gestión de Giros
            </TabsTrigger>
            <TabsTrigger 
              value="zonificaciones"
              onClick={() => setActiveTab("zonificaciones")}
              className={cn([
                "text-gray-600 hover:text-black bg-transparent rounded-lg transition-all duration-300",
                activeTab === "zonificaciones" && "bg-black text-white font-bold shadow-lg border-b-4 border-black"
              ])}
            >
              Gestión de Zonas
            </TabsTrigger>
          </TabsList>
            
          <TabsContent value="usos" activeTab={activeTab}>
            {/* Input de Búsqueda */}
            <div className="mb-4">
              <Input 
                placeholder="Buscar Giro por código o nombre..."
                value={searchGiro}
                onChange={(e) => setSearchGiro(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <GiroZonificacionTable 
              // Pasa la lista filtrada de Giros
              girosData={filteredGiros} 
              zonificacionesData={data.zonificaciones}
              initialAsignaciones={data.asignaciones}
              estadosUso={data.estadosUso}
              // Pasa el total original para el indicador
              totalGiros={data.giros.length} 
            /> 
          </TabsContent>

          {/* CONTROLES DE PAGINACIÓN */}
            <PaginationControls
              currentPage={pagination.currentPage}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          
          <TabsContent value="giros" activeTab={activeTab}>
            <GiroList 
              initialData={data.giros} 
              setGirosData={(newGiros) => setData(prev => ({ ...prev, giros: newGiros }))}
              reloadData={reloadCurrentPage}
            /> 
          </TabsContent>
          
          <TabsContent value="zonificaciones" activeTab={activeTab}>
            <ZonificacionList 
              initialData={data.zonificaciones} 
              setZonificacionesData={(newZonas) => setData(prev => ({ ...prev, zonificaciones: newZonas }))} 
              reloadData={reloadCurrentPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
}