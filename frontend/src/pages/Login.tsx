import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../auth/auth'

export default function Login() {
    const [email, setEmail] = useState('admin@local')
    const [password, setPassword] = useState('admin123')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setError('')
        setLoading(true);
        try { 
            const data = await auth.login( email, password ); 
            navigate('/') 
        } catch (err: any) { 
            setError(err.message || 'Error de inicio de sesión') 
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Lado izquierdo: formulario */}
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-sm bg-white border rounded-2xl p-6 space-y-4"
                >
                <h1 className="text-lg font-semibold text-center">Iniciar Sesión</h1>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <label className="block">
                    <span className="text-sm">Usuario (correo)</span>
                    <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label className="block">
                    <span className="text-sm">Contraseña</span>
                    <input
                    type="password"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-3 py-2 rounded bg-[var(--brand)] text-white"
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                    Demo: admin@local / admin123
                </p>
                </form>
            </div>

            {/* Lado derecho: imagen temática */}
            <div className="hidden md:block relative">
                <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600&auto=format&fit=crop"
                alt="Licencia de funcionamiento"
                className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>
        </div>
    );
}