import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../auth/auth'
import ForgotPassword from './ForgotPassword' 
import img from '../assets/img/login.jpg'
import { Eye, EyeOff, Mail } from 'lucide-react';

type ViewMode = 'login' | 'forgot-password'

function Componente() {
    return <img src={img} alt="Logo" className="absolute inset-0 w-full h-full object-cover" />;
}

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('login')
    const [email, setEmail] = useState('')//admin@local
    const [password, setPassword] = useState('')//admin123
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('')
        setLoading(true);
        try {
            await auth.login(email, password);
            navigate('/')
        } catch (err: any) {
            setError(err.message || 'Error de inicio de sesión')
        } finally {
            setLoading(false)
        }
    }

    if (viewMode === 'forgot-password') {
        return (
            <div className="min-h-screen grid md:grid-cols-2">
                <div className="flex items-center justify-center p-8 bg-white">
                    <ForgotPassword onBackToLogin={() => setViewMode('login')} />
                </div>
                <div className="hidden md:block relative">
                    <Componente />
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Lado Izquierdo: Formulario de Login */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-white">
                
                {/* CAMBIO: Se aumentó de max-w-md a max-w-2xl para permitir que los inputs se alarguen */}
                <div className="max-w-2xl w-full text-center lg:text-left">
                    <p className="text-lg text-[#001524] mb-1 text-center font-medium">Bienvenido a</p>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight text-center">LICENCIA MUNICIPAL</h1>
                    <p className="text-lg text-[#001524] mb-12 text-center">Ingresa a tu cuenta</p>

                    <form onSubmit={onSubmit} className="space-y-6 w-full">
                        <div className={`
                            border-[1px] transition-all duration-300 rounded-md overflow-hidden bg-white border-gray-200 shadow-none
                            focus-within:border-[#75e4e4] 
                            focus-within:shadow-[0_0_0_4px_rgba(117,228,228,0.2)]
                            w-full flex flex-col px-4 py-2
                        `}>
                            <label htmlFor="email" className="block text-[10px] tracking-wider font-bold text-gray-400 uppercase">
                                Correo electrónico
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full py-2 bg-transparent outline-none text-gray-800 placeholder-gray-300 text-base"
                                    placeholder="nombre@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={`
                            border-[1px] transition-all duration-300 rounded-md overflow-hidden bg-white border-gray-200 shadow-none
                            focus-within:border-[#75e4e4] 
                            focus-within:shadow-[0_0_0_4px_rgba(117,228,228,0.2)]
                            w-full flex flex-col px-4 py-2
                        `}>
                            <label htmlFor="password" className="text-[10px] tracking-wider font-bold text-gray-400 uppercase">
                                Contraseña
                            </label>
                            <div className="flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="w-full py-2 bg-transparent outline-none text-gray-800 text-base"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ml-2 text-gray-400 hover:text-[#75e4e4] transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} strokeWidth={2} />
                                    ) : (
                                        <Eye size={20} strokeWidth={2} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-[var(--bg-principal)] hover:brightness-110 text-white font-bold py-3 px-4 rounded-md transition-all shadow-lg active:scale-[0.99] disabled:opacity-70"
                        >
                            {loading ? 'Entrando...' : 'INICIAR SESIÓN'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm">
                        <button 
                            onClick={() => setViewMode('forgot-password')}
                            className="font-medium text-gray-500 hover:text-[#383f53] transition-colors">
                            ¿Has olvidado tu contraseña?
                        </button>
                    </p>
                </div>
            </div>

            {/* Lado Derecho: Imagen de Referencia */}
            <div className="hidden lg:block lg:w-1/2 relative bg-[#EAF3F9] flex items-center justify-center">
                <Componente />
            </div>
        </div>
    );
}