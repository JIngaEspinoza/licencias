import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import { 
  Menu, 
  Bell, 
  Plus, 
  Search, 
  FileText, 
  LayoutGrid 
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 w-full">
      <div className="h-16 flex items-center justify-between px-6">
        
        {/* LADO IZQUIERDO: Menú, Título y ACCESOS DIRECTOS */}
        <div className="flex items-center gap-4 lg:gap-8">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleSidebar} 
              className="h-10 w-10 flex items-center justify-center border border-slate-200 rounded-xl lg:hidden hover:bg-slate-50 transition-colors text-slate-600"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-1.5 h-6 bg-[#0c7286] rounded-full"></div>
              <h1 className="text-sm md:text-base font-bold text-slate-800 tracking-tight whitespace-nowrap">
                Licencia de Funcionamiento
              </h1>
            </div>
          </div>

          {/* --- BLOQUE DE ACCESOS DIRECTOS --- */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
            <ShortcutBtn 
              to="/licfuncionamiento/nueva" 
              icon={<Plus size={18} />} 
              tooltip="Nueva Licencia"
              color="hover:text-emerald-600 hover:bg-emerald-50" 
            />
            <ShortcutBtn 
              to="/buscar" 
              icon={<Search size={18} />} 
              tooltip="Buscar Expediente"
            />
            <ShortcutBtn 
              to="/reportes" 
              icon={<FileText size={18} />} 
              tooltip="Reportes"
            />
          </div>
        </div>

        {/* LADO DERECHO: Notificaciones y Perfil */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Botón de Aplicaciones/Dashboard rápido (Opcional) */}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all hidden sm:block">
            <LayoutGrid size={20} />
          </button>

          <button className="relative p-2 text-slate-400 hover:text-[#0c7286] hover:bg-slate-50 rounded-lg transition-all group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

/**
 * Componente interno para los botones de acceso directo
 */
function ShortcutBtn({ to, icon, tooltip, color = "hover:text-[#0c7286] hover:bg-slate-50" }: any) {
  return (
    <Link
      to={to}
      title={tooltip}
      className={`
        h-9 w-9 flex items-center justify-center 
        rounded-lg border border-slate-100 bg-slate-50/50
        text-slate-500 transition-all duration-200
        active:scale-95 shadow-sm
        ${color}
      `}
    >
      {icon}
    </Link>
  );
}