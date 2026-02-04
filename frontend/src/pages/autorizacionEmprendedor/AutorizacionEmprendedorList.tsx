import React, { useEffect, useMemo, useState } from "react";
import { expedientesApi, Expediente, NuevaDJCompletaInput } from "../../services/expedientes";
import { useDebounce } from "../../hooks/useDebounce";
import { Link, useNavigate } from "react-router-dom";
// Adaptado para usar componentes sin el 'types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../types/components/ui/card";
import { Label } from "../../types/components/ui/label";
import { Input } from "../../types/components/ui/input";
import { Checkbox } from "../../types/components/ui/checkbox";
import { Button } from "../../types/components/ui/button";
import Pagination from "../../components/Pagination";
import { autorizacionesViaPublicaApi } from "../../services/autorizaciones_viapublica";
import { Plus, Edit2, Search, ChevronLeft, ChevronRight, Users, BriefcaseBusiness, Trash2 } from "lucide-react";
import { Badge } from "../../types/components/ui/badge";
import { swalError, swalSuccess, swalConfirm, swalInfo } from "../../utils/swal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../types/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../types/components/ui/select";
//import { useToast } from "../../types/components/ui/use-toast"; // Agregado useToast
import { Toast } from "../../lib/toast";

import type { AutorizacionViaPublicaList } from "@/types/autorizacionesViaPublicaList";
import { AutorizacionViaPublica } from "@/types/autorizacionesViaPublica";
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import {
    AutorizacionViaPublicaForm,
    AutorizacionViaPublicaCreate,
    AutorizacionViaPublicaUpdate
} from '../../types/autorizacionesViaPublicaForm';

// Definimos los props del Dialog (que ahora es interno) y lo eliminamos
// ya que la lógica está en el componente padre.

const labelClasses = "mb-1 block text-sm font-medium";
const inputClasses = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm";

function formatDate(iso: string | undefined) {
    if (!iso) return "—";
    try {
        // Asegura que si viene con zona horaria, se maneje bien (aunque para Date inputs es mejor 'yyyy-MM-dd')
        const d = new Date(iso); 
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    } catch {
        return iso;
    }
}

export default function AutorizacionesEmprendedoresList() {
    //const { toast } = useToast();

    // Valores por defecto para el formulario (usado en modo Crear)
    const defaultFormValues: AutorizacionViaPublicaForm = {
        id_auto_viapublica: undefined,
        id_expediente: 0,
        fecha_solicitud: format(new Date(), 'yyyy-MM-dd'), // Fecha actual
        modalidad: 'TEMPORAL',
        fecha_inicio_temporal: undefined,
        fecha_fin_temporal: undefined,
        otras_referencia: undefined,

        // Datos de solo lectura (inicializados vacíos para el tipo híbrido)
        expediente: { id_persona: 0, numero_expediente: '', persona: { nombre_razon_social: '' } },

        // Relaciones anidadas (AutorizacionEstablecimiento)
        autorizacion_establecimiento: {
            id_auto_establecimiento: undefined,
            modulo_movible: false,
            modulo_estacionario: false,
            triciclo: false,
            vehiculo_motorizado: false,
            medio_venta: '',
            giro_actividad: '',
            via_tipo: '',
            via_nombre: '',
            numero: '',
            interior: '',
            mz: '',
            lt: '',
            otros: '',
            urb_aa_hh_otros: '',
            ubicacion: '',
            lat: 0, // Usar 0 como valor inicial para números
            lng: 0,
            map_zoom: 17,
        },
        autorizacion_anexo: [], // Array vacío por defecto
    };

    // ====== Filtros + paginación ======
    const [q, setQ] = useState("");
    const dq = useDebounce(q, 400);
    const [rows, setRows] = useState<AutorizacionViaPublicaList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    const [activeFilters, setActiveFilters] = useState({
        numeroExpediente: '',
        razonSocial: '',
        fechaInicio: '',
        fechaFin: ''
    });

    // ESTADOS CLAVE
    const [openAutorizacion, setOpenAutorizacion] = useState(false);
    // Cambiamos el tipo a AutorizacionViaPublicaList | null para incluir los datos de lectura
    const [editingAutorizacion, setEditingAutorizacion] = useState<AutorizacionViaPublicaList | null>(null);
    const [autorizacionSaving, setAutorizacionSaving] = useState(false);

    // 1. Inicialización de React Hook Form
    const {
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<AutorizacionViaPublicaForm>({
        defaultValues: defaultFormValues,
        mode: 'onChange',
    });


    // 2. Efecto para cargar los datos de edición
    useEffect(() => {
        if (editingAutorizacion) {
            // Mapeo de datos del Listado (AutorizacionViaPublicaList) al Formulario (AutorizacionViaPublicaForm)
            const mappedData: AutorizacionViaPublicaForm = {
                ...editingAutorizacion,
                // ** CRÍTICO **: Si autorizacion_establecimiento es un array en el listado, desanidarlo:
                autorizacion_establecimiento: Array.isArray(editingAutorizacion.autorizacion_establecimiento) 
                    ? editingAutorizacion.autorizacion_establecimiento[0] 
                    : editingAutorizacion.autorizacion_establecimiento,

                // Formatear fechas para el input[type="date"] (yyyy-MM-dd)
                fecha_solicitud: editingAutorizacion.fecha_solicitud
                    ? format(new Date(editingAutorizacion.fecha_solicitud), 'yyyy-MM-dd')
                    : undefined,
                fecha_inicio_temporal: editingAutorizacion.fecha_inicio_temporal
                    ? format(new Date(editingAutorizacion.fecha_inicio_temporal), 'yyyy-MM-dd')
                    : undefined,
                fecha_fin_temporal: editingAutorizacion.fecha_fin_temporal
                    ? format(new Date(editingAutorizacion.fecha_fin_temporal), 'yyyy-MM-dd')
                    : undefined,
                
                // Mantiene el expediente (solo lectura)
                expediente: editingAutorizacion.expediente
            };
            reset(mappedData);
        } else {
            reset(defaultFormValues);
        }
    // Añadimos las dependencias necesarias.
    }, [editingAutorizacion, reset]); 


    // 3. Método de Envío Unificado (Create/Update) USANDO RHF
    const onSubmitAutorizacion = handleSubmit(async (data) => {
        setAutorizacionSaving(true);

        try {
            // 3.1. Preparación del Payload
            const payload = { ...data };

            // **CRÍTICO:** Eliminar el objeto 'expediente' (solo para UI) antes de enviar
            if (payload.expediente) {
                delete payload.expediente;
            }

            // 3.2. Lógica de CREATE vs UPDATE
            const isUpdate = !!editingAutorizacion?.id_auto_viapublica;
            let result;

            if (isUpdate) {
                // UPDATE: El payload debe ser AutorizacionViaPublicaUpdate (Partial de AutorizacionViaPublica)
                const updatePayload: AutorizacionViaPublicaUpdate = payload as AutorizacionViaPublicaUpdate;

                // El campo id_auto_viapublica debe existir para la ruta PUT
                if (editingAutorizacion.id_auto_viapublica) {
                    result = await autorizacionesViaPublicaApi.update(
                        editingAutorizacion.id_auto_viapublica,
                        updatePayload
                    );
                } else {
                     throw new Error("ID de autorización no encontrado para actualización.");
                }

            } else {
                // CREATE: El payload debe ser AutorizacionViaPublicaCreate (Omitiendo ID)
                const createPayload: AutorizacionViaPublicaCreate = payload as AutorizacionViaPublicaCreate;
                result = await autorizacionesViaPublicaApi.create(createPayload);
            }

            alert("Correctamente");

            /*toast({
              title: `✅ Éxito`,
              description: `Autorización ${isUpdate ? 'actualizada' : 'creada'} correctamente.`,
            });*/

            // 3.3. Finalización
            setOpenAutorizacion(false); // Cierra el diálogo
            await loadData(activeFilters, page, limit); // Recarga la tabla de datos
            reset(defaultFormValues); // Limpia el formulario
            setEditingAutorizacion(null);
            
        } catch (error: any) {
            console.error('Error al guardar:', error);
            const errorMessage = error?.response?.data?.message || error.message || 'Error desconocido';
            alert("Error")
            /*toast({
              title: '❌ Error al guardar',
              description: errorMessage,
              variant: 'destructive',
            });*/
        } finally {
            setAutorizacionSaving(false);
        }
    });


    // 4. Funciones de carga de datos
    async function loadData(currentFilters: typeof activeFilters, currentPage: number, currentLimit: number) {
        setLoading(true);
        try {
            const params = {
                q: dq, // Usamos el debounce
                ...currentFilters,
                page: currentPage,
                limit: currentLimit
            };

            const autorizacionViaPublicaResponse = await autorizacionesViaPublicaApi.list(params);

            setRows(autorizacionViaPublicaResponse.data);
            setTotal(autorizacionViaPublicaResponse.total);
            setError("");

        } catch (e: any) {
             setError(e?.message ?? "Error al cargar autorizaciones");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Al cambiar q (debounced), page o limit, recargamos los datos
        loadData(activeFilters, page, limit);

    }, [dq, page, limit, activeFilters]);

    // 5. Handlers para el Dialog
    const onOpenNew = () => {
        setEditingAutorizacion(null); // Esto dispara reset(defaultFormValues) en el useEffect
        setOpenAutorizacion(true);
    };

    // Cambiado de AutorizacionViaPublica a AutorizacionViaPublicaList (el tipo que viene de la API)
    const onOpenEdit = (row: AutorizacionViaPublicaList) => { 
        setEditingAutorizacion(row); // Esto dispara reset(mappedData) en el useEffect
        setOpenAutorizacion(true);
    };

    const getColorClasses = (estado: any) => {
        const normalizedEstado = estado ? estado.toLowerCase() : '';

        switch (normalizedEstado) {
            case 'temporal':
                return 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-50';
            case 'excepcional':
                return 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-50';
            default:
                return '';
        }
    };


    return (
        <Card className="rounded-2xl shadow">
            <CardHeader>
                <CardTitle>Autorizaciones en vía pública</CardTitle>
                <CardDescription>Listado de autorizaciones</CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
                {/* ... (Filtros y Botón Nuevo) ... */}
                <div className="flex items-end gap-3 flex-wrap">
                    <div className="grow">
                        <Label htmlFor="buscarR">Buscar por nombre</Label>
                        <Input id="buscarR" placeholder="Nombre o Razón Social" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
                    </div>
                    <Button
                        onClick={onOpenNew}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700 active:bg-emerald-800"
                    >
                        <Plus size={18} /> Nuevo
                    </Button>
                </div>
                {/* ... (Tabla de Listado) ... */}
                <div className="overflow-auto border rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="text-left p-3">ID</th>
                                <th className="text-left p-3">Fecha solicitud</th>
                                <th className="text-left p-3">Modalidad</th>
                                <th className="text-left p-3">Vía</th>
                                <th className="text-left p-3">N°</th>
                                <th className="text-left p-3">Persona</th>
                                <th className="text-left p-3">Expediente</th>
                                <th className="text-left p-3">Anexos</th>
                                <th className="text-right p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => {
                                // ** CRÍTICO **: Si autorizacion_establecimiento es un array, acceder al elemento [0]
                                const establecimiento = Array.isArray(r.autorizacion_establecimiento) ? r.autorizacion_establecimiento[0] : r.autorizacion_establecimiento;
                                
                                return (
                                    <tr key={r.id_auto_viapublica} className="border-t">
                                        <td className="p-3 text-gray-500">{r.id_auto_viapublica}</td>
                                        <td className="p-3">{formatDate(r.fecha_solicitud)}</td>
                                        <td className="p-3">
                                            <span className="flex flex-wrap gap-2">
                                                <Badge key={r.modalidad}
                                                    className={`rounded-2xl px-3 py-1 ${getColorClasses(r.modalidad)}`}>
                                                    {r.modalidad ?? ""}
                                                </Badge>
                                            </span>
                                        </td>
                                        <td className="p-3">{establecimiento.via_tipo} {establecimiento.via_nombre}</td>
                                        <td className="p-3">{establecimiento.numero}</td>
                                        <td className="p-3">{r.expediente.persona.nombre_razon_social}</td>
                                        <td className="p-3">{r.expediente.numero_expediente}</td>
                                        <td className="p-3">{r.autorizacion_anexo.length}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-xs">
                                                <Button size="sm"
                                                    onClick={() => onOpenEdit(r)}
                                                    variant="outline"
                                                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                                    title="Editar "
                                                >
                                                    <Edit2 size={16} /> Editar
                                                </Button>

                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {loading && (
                                <tr>
                                    <td colSpan={9} className="p-4 text-center text-gray-500">Cargando datos...</td>
                                </tr>
                            )}
                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="p-4 text-center text-gray-500">No se encontraron autorizaciones.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    page={page}
                    limit={limit}
                    total={total}
                    onPageChange={setPage}
                />

                {/* 6. Dialog con el Formulario Integrado (Usando Controllers) */}
                <Dialog open={openAutorizacion} onOpenChange={setOpenAutorizacion}>
                    <DialogContent
                        className="sm:max-w-[800px]"
                        onInteractOutside={(e) => {
                            e.preventDefault(); // Evita que se cierre por clic fuera
                        }}
                    >

                        <DialogHeader>
                            <DialogTitle>
                                {editingAutorizacion?.id_auto_viapublica ? "Editar autorización vía pública" : "Nueva autorización vía pública"}
                            </DialogTitle>
                            <DialogDescription>
                                Completa los campos para {editingAutorizacion?.id_auto_viapublica ? "Editar" : "Crear nueva"} autorización vía pública.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Paso 6.1: VINCULAR EL FORMULARIO AL HANDLESUBMIT DE RHF */}
                        <form onSubmit={onSubmitAutorizacion}>
                            <div className="space-y-6">
                                {/* ------------------- Datos de la Solicitud ------------------- */}
                                <section className="border rounded-xl overflow-hidden">
                                    <header className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold">Datos de la solicitud</header>
                                    <div className="p-4 grid sm:grid-cols-3 gap-3">
                                        
                                        {/* ID Persona (Solo Lectura) - Valor del Formulario (usamos el objeto expediente del tipo híbrido) */}
                                        <Label className="text-sm">
                                            <span className="block text-xs text-gray-600 mb-1">ID Persona *</span>
                                            <Input
                                                className="w-full border rounded px-2 py-1 bg-gray-100"
                                                readOnly
                                                value={editingAutorizacion?.expediente?.id_persona || ''}
                                            />
                                        </Label>

                                        {/* ID Expediente (Solo Lectura) - Usamos la FK directa */}
                                        <Label className="text-sm">
                                            <span className="block text-xs text-gray-600 mb-1">ID Expediente *</span>
                                            <Input
                                                className="w-full border rounded px-2 py-1 bg-gray-100"
                                                readOnly
                                                value={editingAutorizacion?.id_expediente || ''}
                                            />
                                        </Label>
                                        
                                        {/* Persona / Razón social (Solo Lectura) */}
                                        <Label className="text-sm">
                                            <span className="block text-xs text-gray-600 mb-1">Persona / Razón social</span>
                                            <Input
                                                className="w-full border rounded px-2 py-1 bg-gray-100"
                                                readOnly
                                                value={editingAutorizacion?.expediente?.persona?.nombre_razon_social || ''}
                                            />
                                        </Label>

                                        {/* Fecha solicitud (Editable) */}
                                        <Controller
                                            name="fecha_solicitud"
                                            control={control}
                                            rules={{ required: 'Campo requerido' }}
                                            render={({ field }) => (
                                                <Label className="text-sm">
                                                    <span className="block text-xs text-gray-600 mb-1">Fecha solicitud *</span>
                                                    <Input 
                                                        type="date" 
                                                        className="w-full border rounded px-2 py-1" 
                                                        {...field} 
                                                        value={field.value || ''} // Asegura que el input date funcione correctamente
                                                    />
                                                    {errors.fecha_solicitud && <p className="text-xs text-red-500 mt-1">{errors.fecha_solicitud.message}</p>}
                                                </Label>
                                            )}
                                        />

                                        {/* Modalidad (Editable) */}
                                        <Controller
                                            name="modalidad"
                                            control={control}
                                            rules={{ required: 'Campo requerido' }}
                                            render={({ field }) => (
                                                <Label className="text-sm">
                                                    <span className="block text-xs text-gray-600 mb-1">Modalidad</span>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value || ''}
                                                        required
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Selecciona una autorización" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="TEMPORAL">AUTORIZACION_MUNICIPAL_TEMPORAL</SelectItem>
                                                            <SelectItem value="EXCEPCIONAL">AUTORIZACION_MUNICIPAL_EXCEPCIONAL</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.modalidad && <p className="text-xs text-red-500 mt-1">{errors.modalidad.message}</p>}
                                                </Label>
                                            )}
                                        />

                                        {/* Inicio (temporal) / Fin (temporal) / Otras referencias */}
                                        <div className="sm:col-span-3 grid sm:grid-cols-3 gap-3">
                                            {/* Inicio Temporal */}
                                            <Controller
                                                name="fecha_inicio_temporal"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">Inicio (temporal)</span>
                                                        <Input
                                                            type="date"
                                                            className="w-full border rounded px-2 py-1"
                                                            {...field}
                                                            value={field.value || ''} 
                                                        />
                                                    </Label>
                                                )}
                                            />
                                            {/* Fin Temporal */}
                                            <Controller
                                                name="fecha_fin_temporal"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">Fin (temporal)</span>
                                                        <Input
                                                            type="date"
                                                            className="w-full border rounded px-2 py-1"
                                                            {...field}
                                                            value={field.value || ''}
                                                        />
                                                    </Label>
                                                )}
                                            />
                                            {/* Otras referencias */}
                                            <Controller
                                                name="otras_referencia"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">Otras referencias</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ------------------- Ubicación / Establecimiento (Relación Anidada) ------------------- */}
                                <section className="border rounded-xl overflow-hidden">
                                    <header className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold">Ubicación / Establecimiento</header>
                                    <div className="p-4 grid sm:grid-cols-3 gap-3">

                                        {/* Checkboxes */}
                                        <div className="sm:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {/* Módulo movible */}
                                            <Controller
                                                name="autorizacion_establecimiento.modulo_movible"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="modulo_movible"
                                                            checked={field.value || false}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor="modulo_movible" className="text-sm">Módulo movible</Label>
                                                    </div>
                                                )}
                                            />
                                            {/* Módulo estacionario */}
                                            <Controller
                                                name="autorizacion_establecimiento.modulo_estacionario"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="modulo_estacionario"
                                                            checked={field.value || false}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor="modulo_estacionario" className="text-sm">Módulo estacionario</Label>
                                                    </div>
                                                )}
                                            />
                                            {/* Triciclo */}
                                            <Controller
                                                name="autorizacion_establecimiento.triciclo"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="triciclo"
                                                            checked={field.value || false}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor="triciclo" className="text-sm">Triciclo</Label>
                                                    </div>
                                                )}
                                            />
                                            {/* Vehículo motorizado */}
                                            <Controller
                                                name="autorizacion_establecimiento.vehiculo_motorizado"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="vehiculo_motorizado"
                                                            checked={field.value || false}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor="vehiculo_motorizado" className="text-sm">Vehículo motorizado</Label>
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Medio de venta */}
                                        <Controller
                                            name="autorizacion_establecimiento.medio_venta"
                                            control={control}
                                            render={({ field }) => (
                                                <Label className="text-sm">
                                                    <span className="block text-xs text-gray-600 mb-1">Medio de venta</span>
                                                    <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                </Label>
                                            )}
                                        />
                                        {/* Giro / Actividad */}
                                        <Controller
                                            name="autorizacion_establecimiento.giro_actividad"
                                            control={control}
                                            rules={{ required: 'Campo requerido' }}
                                            render={({ field }) => (
                                                <Label className="text-sm">
                                                    <span className="block text-xs text-gray-600 mb-1">Giro / Actividad *</span>
                                                    <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    {errors.autorizacion_establecimiento?.giro_actividad && <p className="text-xs text-red-500 mt-1">{errors.autorizacion_establecimiento.giro_actividad.message}</p>}
                                                </Label>
                                            )}
                                        />

                                        {/* Campos de dirección */}
                                        <div className="sm:col-span-3 grid sm:grid-cols-7 gap-2">
                                            {/* Tipo de vía */}
                                            <Controller
                                                name="autorizacion_establecimiento.via_tipo"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm col-span-2">
                                                        <span className="block text-xs text-gray-600 mb-1">Tipo de vía</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                            {/* Nombre de vía */}
                                            <Controller
                                                name="autorizacion_establecimiento.via_nombre"
                                                control={control}
                                                rules={{ required: 'Campo requerido' }}
                                                render={({ field }) => (
                                                    <Label className="text-sm col-span-3">
                                                        <span className="block text-xs text-gray-600 mb-1">Nombre de vía *</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                        {errors.autorizacion_establecimiento?.via_nombre && <p className="text-xs text-red-500 mt-1">{errors.autorizacion_establecimiento.via_nombre.message}</p>}
                                                    </Label>
                                                )}
                                            />
                                            {/* N° */}
                                            <Controller
                                                name="autorizacion_establecimiento.numero"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">N°</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                            {/* Interior */}
                                            <Controller
                                                name="autorizacion_establecimiento.interior"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">Interior</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                        </div>
                                        
                                        <div className="sm:col-span-3 grid sm:grid-cols-6 gap-2">
                                            {/* MZ */}
                                            <Controller
                                                name="autorizacion_establecimiento.mz"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">MZ</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                            {/* LT */}
                                            <Controller
                                                name="autorizacion_establecimiento.lt"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">LT</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                            {/* Urb/AA.HH./Otros */}
                                            <Controller
                                                name="autorizacion_establecimiento.urb_aa_hh_otros"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm col-span-2">
                                                        <span className="block text-xs text-gray-600 mb-1">Urb/AA.HH./Otros</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                            {/* Ubicación (campo 'otros' original del user) */}
                                            <Controller
                                                name="autorizacion_establecimiento.ubicacion"
                                                control={control}
                                                render={({ field }) => (
                                                    <Label className="text-sm col-span-2">
                                                        <span className="block text-xs text-gray-600 mb-1">Ubicación</span>
                                                        <Input className="w-full border rounded px-2 py-1" {...field} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                        </div>

                                        {/* Coordenadas */}
                                        <div className="sm:col-span-3 grid sm:grid-cols-3 gap-2">
                                            {/* Lat */}
                                            <Controller
                                                name="autorizacion_establecimiento.lat"
                                                control={control}
                                                rules={{ required: 'Campo requerido', valueAsNumber: true }}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">Lat *</span>
                                                        <Input type="number" step="any" className="w-full border rounded px-2 py-1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} value={field.value || ''} />
                                                        {errors.autorizacion_establecimiento?.lat && <p className="text-xs text-red-500 mt-1">{errors.autorizacion_establecimiento.lat.message}</p>}
                                                    </Label>
                                                )}
                                            />
                                            {/* Lng (corregido de 'lon' a 'lng') */}
                                            <Controller
                                                name="autorizacion_establecimiento.lng"
                                                control={control}
                                                rules={{ required: 'Campo requerido', valueAsNumber: true }}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">Lng *</span>
                                                        <Input type="number" step="any" className="w-full border rounded px-2 py-1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} value={field.value || ''} />
                                                        {errors.autorizacion_establecimiento?.lng && <p className="text-xs text-red-500 mt-1">{errors.autorizacion_establecimiento.lng.message}</p>}
                                                    </Label>
                                                )}
                                            />
                                            {/* Zoom (corregido de 'zoom' a 'map_zoom') */}
                                            <Controller
                                                name="autorizacion_establecimiento.map_zoom"
                                                control={control}
                                                rules={{ valueAsNumber: true }}
                                                render={({ field }) => (
                                                    <Label className="text-sm">
                                                        <span className="block text-xs text-gray-600 mb-1">Zoom</span>
                                                        <Input type="number" className="w-full border rounded px-2 py-1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} value={field.value || ''} />
                                                    </Label>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ------------------- Anexos (Resumen) ------------------- */}
                                <section className="border rounded-xl overflow-hidden">
                                    <header className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold">Anexos (resumen)</header>
                                    <div className="p-4 text-sm text-gray-600">
                                        Por ahora este formulario solo maneja el <b>conteo</b> de anexos. La tabla <code>autorizacion_anexo</code> se integrará en una vista dedicada de adjuntos (cargar/validar PDF, JPG, DOCX, etc.).
                                    </div>
                                </section>

                                <DialogFooter className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setOpenAutorizacion(false)}
                                        variant="outline"
                                        disabled={autorizacionSaving}
                                        className="text-xs sm:text-sm"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={autorizacionSaving}
                                        className="text-xs sm:text-sm font-medium"
                                    >
                                        {autorizacionSaving
                                            ? "Guardando…"
                                            : editingAutorizacion?.id_auto_viapublica
                                                ? "Guardar cambios"
                                                : "Crear"}
                                    </Button>
                                </DialogFooter>

                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );

}