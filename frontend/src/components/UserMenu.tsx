import { useState, useRef, useEffect } from 'react'
import { auth } from '../auth/auth'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'

export default function UserMenu() {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const user = auth.current();

    useEffect(() => {
        const onClick = (e: MouseEvent) => { 
            if (!ref.current?.contains(e.target as Node)) setOpen(false) 
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [])

    const logout = () => { 
        auth.logout(); 
        window.location.href = '/login' 
    }

    // Obtenemos iniciales del nombre para el avatar
    const initials = user?.name ? user.name.split(' ').map((n:any) => n[0]).join('').toUpperCase().substring(0, 2) : 'US';

    return (
        <div className="relative" ref={ref}>
            {/* Botón del Perfil - Estilo moderno con Avatar */}
            <button 
                onClick={() => setOpen(!open)} 
                className={`flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all duration-200 border ${
                    open ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {initials}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-700 leading-none">{user?.name || 'Usuario'}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">En línea</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 py-1 z-50 animate-in fade-in zoom-in duration-100">
                    
                    {/* Header del Dropdown */}
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                        <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-2 flex gap-1">
                            {user?.roles?.map((role: string) => (
                                <span key={role} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Opciones del menú */}
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <User size={16} />
                        Mi Perfil
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <Settings size={16} />
                        Configuración
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    {/* Botón de Logout */}
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    )
}