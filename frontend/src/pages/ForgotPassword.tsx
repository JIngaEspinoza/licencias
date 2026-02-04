import React, { useState } from 'react'
import { auth } from '../auth/auth' 
import { Mail, ArrowLeft } from 'lucide-react' // Importamos iconos de Lucide

interface ForgotPasswordProps {
    onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('')
        setSuccess('')

        if (!email) {
            setError('Por favor, ingresa tu correo electrónico.')
            return
        }

        setLoading(true)
        try {
            await auth.forgotPassword(email) 
            setSuccess('Se ha enviado un correo electrónico con las instrucciones.')
            setEmail('')
        } catch (err: any) {
            setError(err.message || 'Error al solicitar el restablecimiento.')
        } finally {
            setLoading(false)
        }
    }

    return (
        /* CAMBIO: max-w-2xl para coincidir con el ancho del Login */
        <div className="w-full max-w-2xl flex flex-col">
            
            <div className="text-center lg:text-left mb-10">
                <h1 className="text-4xl font-bold text-[#001524] mb-4 tracking-tight">
                    Recuperar contraseña
                </h1>
                <p className="text-lg text-gray-600">
                    Ingresa tu correo para recibir las instrucciones de restablecimiento.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 w-full">
                
                {/* INPUT ESTILO LOGIN */}
                <div className={`
                    border-[1px] transition-all duration-300 rounded-md overflow-hidden bg-white border-gray-200
                    focus-within:border-[#75e4e4] 
                    focus-within:shadow-[0_0_0_4px_rgba(117,228,228,0.2)]
                    w-full flex flex-col px-4 py-2
                `}>
                    <label className="block text-[10px] tracking-wider font-bold text-gray-400">
                        Correo
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type="email"
                            className="w-full py-2 bg-transparent outline-none text-gray-800 text-base"
                            placeholder="nombre@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading || !!success}
                            required
                        />
                        <div className="text-gray-300 ml-2">
                            <Mail size={20} strokeWidth={2} />
                        </div>
                    </div>
                </div>

                {/* Mensajes de estado */}
                {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center font-medium">{success}</p>}
                
                <button
                    type="submit"
                    disabled={loading || !!success}
                    className="w-full h-16 bg-[var(--bg-principal)] hover:brightness-110 text-white font-bold py-3 px-4 rounded-md transition-all shadow-lg active:scale-[0.99] disabled:opacity-50 uppercase"
                >
                    {loading ? 'Enviando...' : 'Enviar Link'}
                </button>

                {/* Botón para volver al login con icono */}
                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#383f53] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Regresar al login
                    </button>
                </div>
            </form>
        </div>
    );
}