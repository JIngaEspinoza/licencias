import { NavLink, useLocation } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { auth } from "../auth/auth";

const linkBase = "block px-3 py-2 rounded";
const linkActive = "bg-gray-100 font-medium";

export default function Sidebar({ open }: { open: boolean }) {
  const location = useLocation()
  const user = auth.current();

  // Rutas del grupo "Gestión"
  const gestionLinks = useMemo(() => ([
    { to: '/gestion/uso', label: 'Uso' },
    { to: '/gestion/zonificacion', label: 'Zonificación' },
    { to: '/gestion/giro', label: 'Giro' },
    { to: '/gestion/giro-zonificacion', label: 'Giro x Zonificación' },
  ]), [])

  // Rutas del grupo "Autorización Temporal"
  const gestionAutorizacionTemporalLinks = useMemo(() => ([
    { to: '/autemp/list', label: 'Listado' },
    { to: '/autemp/req', label: 'Registro' }
  ]), [])

  // Si estás en cualquiera de las subrutas, el acordeón inicia abierto
  const isInGestion = gestionLinks.some(l => location.pathname.startsWith(l.to.replace(/\/$/, '')))
  const [isGestionOpen, setIsGestionOpen] = useState<boolean>(isInGestion)

  const isInGestionAutorizacionTemporal = gestionAutorizacionTemporalLinks.some(l => location.pathname.startsWith(l.to.replace(/\/$/, '')))
  const [isGestionAutorizacionTemporalOpen, setIsGestionAutorizacionTemporalOpen] = useState<boolean>(isInGestion)

  return (
    <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed z-30 inset-y-0 left-0 w-64 bg-white border-r transition-transform`}>
      <div className="h-16 flex items-center px-4 border-b">
        <span className="font-semibold leading-tight">
          Municipalidad de <br /> San Miguel
        </span>
      </div>

      <nav className="p-3 space-y-1 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : 'hover:bg-gray-50'}`
          }
        >
          Inicio
        </NavLink>

        <NavLink
          to="/personas"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
          }
        >
          Personas
        </NavLink>

        <NavLink
          to="/licfuncionamiento"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
          }
        >
          Licencia de Funcionamiento
        </NavLink>

        {/* <NavLink
          to="/autemp"
          className={({ isActive }) =>
            `${linkBase} rounded ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
          }
        >
          Autorización Temporal
        </NavLink>  */}

        {/* Acordeón Autorización Temporal */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsGestionAutorizacionTemporalOpen(v => !v)}
            aria-expanded={isGestionAutorizacionTemporalOpen}
            className={`w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 ${isInGestion ? 'bg-gray-100 font-medium' : ''}`}
          >
            <span>Autorización</span>
            <svg
              className={`h-4 w-4 transform transition-transform ${isGestionAutorizacionTemporalOpen ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
              <path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L12 11.586l-4.293 4.293a1 1 0 01-1.414-1.414L9.586 12 6.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isGestionAutorizacionTemporalOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {gestionAutorizacionTemporalLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded text-gray-700 ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/autempr"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
          }
        >
          Autorización para Emprendedores
        </NavLink> 
        {/*
        <NavLink
          to="/licencias"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
          }
        >
          Licencias
        </NavLink>

        <NavLink
          to="/ciudadanos"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
          }
        >
          Ciudadanos
        </NavLink>*}

        {/* Acordeón Gestión */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsGestionOpen(v => !v)}
            aria-expanded={isGestionOpen}
            className={`w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 ${isInGestion ? 'bg-gray-100 font-medium' : ''}`}
          >
            <span>Gestión</span>
            <svg
              className={`h-4 w-4 transform transition-transform ${isGestionOpen ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
              <path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L12 11.586l-4.293 4.293a1 1 0 01-1.414-1.414L9.586 12 6.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isGestionOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {gestionLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded text-gray-700 ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Sección visible SOLO para ADMIN */}
        {user?.roles?.includes("ADMIN") && (
          <>
            <div className="mt-4 text-xs font-semibold text-gray-500 px-4">
              Administración
            </div>
            <NavLink
              to="/seguridad/usuarios"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : "hover:bg-gray-50"}`
              }
            >
              👤 Usuarios
            </NavLink>
            <NavLink
              to="/seguridad/roles"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : "hover:bg-gray-50"}`
              }
            >
              🛡️ Roles
            </NavLink>
            <NavLink
              to="/seguridad/permisos"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : "hover:bg-gray-50"}`
              }
            >
              ✅ Permisos
            </NavLink>
          </>
        )}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t p-3 text-xs text-gray-500">
        <div className="px-1 truncate">{user?.email}</div>
        <div className="px-1 truncate">{user?.roles?.join(", ")}</div>
      </div>
    </aside>
  )
}

/*import { NavLink } from 'react-router-dom'

export default function Sidebar({ open }: { open: boolean }) {
    return (
        <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed z-30 inset-y-0 left-0 w-64 bg-white border-r transition-transform`}>
            <div className="h-16 flex items-center px-4 border-b">
                <span className="font-semibold">Municipalidad de <br /> San Miguel</span>
            </div>
            <nav className="p-3 space-y-1 text-sm">
                <NavLink to="/" end className={({isActive}) => `block px-3 py-2 rounded ${isActive?'bg-gray-100':''}`}>Inicio</NavLink>
                <NavLink to="/licencias" className={({isActive}) => `block px-3 py-2 rounded ${isActive?'bg-gray-100':''}`}>Licencias</NavLink>
                <NavLink to="/ciudadanos" className={({isActive}) => `block px-3 py-2 rounded ${isActive?'bg-gray-100':''}`}>Ciudadanos</NavLink>
            </nav>
        </aside>
    )
}*/