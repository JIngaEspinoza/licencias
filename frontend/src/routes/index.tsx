import { createBrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import DashboardLayout from '../layout/DashboardLayout'
import Protected from '../components/Protected'
import AdminProtected from '../components/AdminProtected';
import Dashboard from '../pages/Dashboard'
import LicenciasList from '../pages/LicenciasList'
import LicenciaForm from '../pages/LicenciaForm'
import PersonasList from '../pages/persona/PersonasList'
import ExpedientesList from '../pages/licFuncionamiento/ExpedientesList'
import ExpedienteForm from '../pages/licFuncionamiento/ExpedienteForm'
import AutorizacionesTemporalesList from '../pages/autorizacionTemporal/AutorizacionTemporalList'
import AutorizacionesTemporalesReq from '../pages/autorizacionTemporal/AutorizacionTemporalReq'
import AutorizacionesEmprendedoresList from '../pages/autorizacionEmprendedor/AutorizacionEmprendedorList'

import CiudadanosList from '../pages/CiudadanosList'
import CiudadanoForm from '../pages/CiudadanoForm'

import UsosList from '../pages/gestion/UsosList'
import ZonificacionesList from '../pages/gestion/ZonificacionesList'
import GirosList from '../pages/gestion/GirosList'
import GirosZonificacionesList from '../pages/gestion/GirosZonificacionesList'
import UsuariosPage from '../pages/seguridad/UsuariosPage';
import PermisosPage from "../pages/seguridad/PermisosPage";
import RolesPage from "../pages/seguridad/RolesPage";
// Páginas de seguridad
/*import SeguridadHome from "./modules/seguridad";
*/

export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
        path: '/',
        element: <Protected />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: 'licencias', element: <LicenciasList /> },
                    { path: 'licencias/nueva', element: <LicenciaForm /> },
                    { path: 'licencias/:id/editar', element: <LicenciaForm /> },
                    { path: 'personas', element: <PersonasList /> },
                    { path: 'licfuncionamiento', element: <ExpedientesList /> },
                    { path: 'licfuncionamiento/nueva', element: <ExpedienteForm /> },
                    
                    { path: 'autemp/list', element: <AutorizacionesTemporalesList /> },
                    { path: 'autemp/req', element: <AutorizacionesTemporalesReq /> },

                    { path: 'autempr', element: <AutorizacionesEmprendedoresList /> },
                    
                    { path: 'personas/nueva', element: <PersonasList /> },
                    { path: 'personas/:id/editar', element: <PersonasList /> },
                    { path: 'ciudadanos', element: <CiudadanosList /> },
                    { path: 'ciudadanos/nueva', element: <CiudadanoForm /> },
                    { path: 'ciudadanos/:id/editar', element: <CiudadanoForm /> },

                    { path: 'gestion/uso', element: <UsosList /> },
                    { path: 'gestion/zonificacion', element: <ZonificacionesList /> },
                    { path: 'gestion/giro', element: <GirosList /> },
                    { path: 'gestion/giro-zonificacion', element: <GirosZonificacionesList /> },

                    // --- MÓDULO DE SEGURIDAD (solo ADMIN) ---
                    {
                        path: 'seguridad',
                        element: <AdminProtected />,
                        children: [
                            { path: 'usuarios', element: <UsuariosPage /> },
                            { path: 'roles', element: <RolesPage /> },
                            { path: 'permisos', element: <PermisosPage /> },
                        ],
                    },
                    { path: '*', element: <div className="p-4">No encontrado</div> } 
                ]
            }
        ]
    }
])