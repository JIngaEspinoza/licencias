// ----------------------------------------------------------------------
// 1. IMPORTACIONES NECESARIAS
// ----------------------------------------------------------------------

// Necesitas importar el tipo de Listado para extraer la estructura de solo lectura
import type { AutorizacionViaPublicaList } from './autorizacionesViaPublicaList'; 
// Asumimos que los payloads básicos de establecimiento y anexo están definidos
import type { 
    AutorizacionEstablecimientoPayload, 
    AutorizacionAnexoPayload, 
    AutorizacionViaPublica 
} from './autorizacionesViaPublica'; 


// ----------------------------------------------------------------------
// 2. TIPO HÍBRIDO PARA EL FORMULARIO (LECTURA + ESCRITURA)
// ----------------------------------------------------------------------

/**
 * Tipo Híbrido (Form DTO):
 * Utilizado para el estado local del formulario (useState<...>) y React Hook Form.
 * Combina la estructura de la entidad de Escritura (AutorizacionViaPublica)
 * con los datos de Solo Lectura de la API de Listado (expediente).
 */
export type AutorizacionViaPublicaForm = AutorizacionViaPublica & {
  // Añadimos el objeto expediente completo, tal como viene en AutorizacionViaPublicaList.
  // Esto permite acceder a: expediente.id_persona, expediente.persona.nombre_razon_social
  expediente: AutorizacionViaPublicaList['expediente'];
};


// ----------------------------------------------------------------------
// 3. TIPOS DE PAYLOAD PARA LA API (ESCRITURA)
// ----------------------------------------------------------------------

/**
 * Payload de Creación (POST /autorizacion-via-publica)
 * Es la AutorizacionViaPublica base, pero omitiendo el ID principal.
 */
export type AutorizacionViaPublicaCreate = Omit<AutorizacionViaPublica, 
  "id_auto_viapublica" 
>;

/**
 * Payload de Actualización (PUT /autorizacion-via-publica/:id)
 * Permite enviar un subconjunto de campos para actualizar (Partial).
 */
export type AutorizacionViaPublicaUpdate = Partial<AutorizacionViaPublica>;