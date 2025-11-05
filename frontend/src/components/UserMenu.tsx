import { useState, useRef, useEffect } from 'react'
import { auth } from '../auth/auth'

export default function UserMenu() {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const user = auth.current();

    useEffect(()=>{
        const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    },[])

    const logout = () => { auth.logout(); location.href = '/login' }

    return (
        <div className="relative" ref={ref}>
            <button onClick={()=>setOpen(!open)} className="h-9 rounded-lg border px-3 text-sm">☰</button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow">
                    <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Cerrar sesión</button>
                </div>
            )}
        </div>
    )
}