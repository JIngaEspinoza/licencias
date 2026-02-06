import { NavLink, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { auth } from "../auth/auth";
import { 
  LayoutDashboard, Users, FileText, ChevronRight, 
  ShieldCheck, Settings, Briefcase, UserCircle, 
  Lock, Key, X 
} from 'lucide-react';

const linkBase = "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group";
const linkActive = "bg-white/10 text-white shadow-sm border border-white/10";
const linkInactive = "text-white/70 hover:bg-white/5 hover:text-white";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const user = auth.current();

  const gestionLinks = useMemo(() => ([
    { to: '/gestion/uso', label: 'Uso' },
    { to: '/gestion/zonificacion', label: 'Zonificación' },
    { to: '/gestion/giro', label: 'Giro' },
    { to: '/gestion/giro-zonificacion', label: 'Giro x Zonificación' },
  ]), []);

  const autTempLinks = useMemo(() => ([
    { to: '/autemp/list', label: 'Listado' },
    { to: '/autemp/req', label: 'Registro' }
  ]), []);

  const [isAutOpen, setIsAutOpen] = useState(autTempLinks.some(l => location.pathname.startsWith(l.to)));
  const [isGestionOpen, setIsGestionOpen] = useState(gestionLinks.some(l => location.pathname.startsWith(l.to)));

  return (
    <>
      {/* OVERLAY: Al hacer clic aquí, se ejecuta onClose */}
      {open && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed z-50 inset-y-0 left-0 w-64 
        bg-[#0c7286] text-white transition-transform duration-300 ease-in-out shadow-2xl
      `}>
        
        {/* HEADER DEL SIDEBAR */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-xl mr-3">
                <ShieldCheck className="text-[#0c7286]" size={24} />
            </div>
            <span className="font-bold text-white leading-tight text-sm tracking-wide uppercase">
              Muni <br /> San Miguel
            </span>
          </div>

          {/* BOTÓN X: IMPORTANTE - Llama a onClose */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Menú Principal</p>

          <NavItem to="/" icon={LayoutDashboard} label="Inicio" end onClick={onClose} />
          <NavItem to="/personas" icon={Users} label="Personas" onClick={onClose} />
          <NavItem to="/licfuncionamiento" icon={FileText} label="Licencia Func." onClick={onClose} />

          {/* Autorización */}
          <div>
            <button onClick={() => setIsAutOpen(!isAutOpen)} className={`${linkBase} w-full justify-between ${isAutOpen ? 'text-white bg-white/5' : 'text-white/70 hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <Briefcase size={20} />
                <span className="font-medium">Autorización</span>
              </div>
              <ChevronRight size={16} className={`transition-transform ${isAutOpen ? 'rotate-90' : ''}`} />
            </button>
            {isAutOpen && (
              <div className="mt-1 ml-6 space-y-1 border-l border-white/20">
                {autTempLinks.map(link => (
                  <NavLink key={link.to} to={link.to} onClick={onClose} className={({ isActive }) => 
                    `block py-2 px-6 text-sm transition-colors ${isActive ? 'text-white font-bold' : 'text-white/60 hover:text-white'}`
                  }>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavItem to="/autempr" icon={Settings} label="Emprendedores" onClick={onClose} />

          {/* Gestión */}
          <div>
            <button onClick={() => setIsGestionOpen(!isGestionOpen)} className={`${linkBase} w-full justify-between ${isGestionOpen ? 'text-white bg-white/5' : 'text-white/70 hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <Settings size={20} />
                <span className="font-medium">Gestión</span>
              </div>
              <ChevronRight size={16} className={`transition-transform ${isGestionOpen ? 'rotate-90' : ''}`} />
            </button>
            {isGestionOpen && (
              <div className="mt-1 ml-6 space-y-1 border-l border-white/20">
                {gestionLinks.map(link => (
                  <NavLink key={link.to} to={link.to} onClick={onClose} className={({ isActive }) => 
                     `block py-2 px-6 text-sm transition-colors ${isActive ? 'text-white font-bold' : 'text-white/60 hover:text-white'}`
                  }>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Admin Section */}
          {user?.roles?.includes("ADMIN") && (
            <div className="pt-4">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Seguridad</p>
              <NavItem to="/seguridad/usuarios" icon={UserCircle} label="Usuarios" onClick={onClose} />
              <NavItem to="/seguridad/roles" icon={Lock} label="Roles" onClick={onClose} />
              <NavItem to="/seguridad/permisos" icon={Key} label="Permisos" onClick={onClose} />
            </div>
          )}
        </nav>

        {/* Perfil */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/10 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-xs font-bold text-[#0c7286] shrink-0">
              {user?.email?.substring(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-white">
              <p className="text-xs font-bold truncate">{user?.email}</p>
              <p className="text-[10px] text-white/60 truncate capitalize">{user?.roles?.join(", ")}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItem({ to, icon: Icon, label, end = false, onClick }: any) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => window.innerWidth < 1024 && onClick()}
      className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
    >
      <Icon size={20} className="shrink-0" />
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
}