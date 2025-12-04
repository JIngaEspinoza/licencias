import React, { useState } from 'react'
import { auth } from '../auth/auth' // Asegúrate de que la ruta sea correcta

// Definimos las props que recibirá el componente
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
            // Llama al método de autenticación para solicitar la recuperación
            await auth.forgotPassword(email) 
            setSuccess('Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.')
            setEmail('')
        } catch (err: any) {
            setError(err.message || 'Error al solicitar el restablecimiento. Verifica el correo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={onSubmit}
            className="w-full max-w-sm bg-white border rounded-2xl p-6 space-y-4"
        >
            <h1 className="text-lg font-semibold text-center">Recuperar Contraseña</h1>
            <p className="text-sm text-gray-600">
                Ingresa el correo electrónico asociado a tu cuenta para recibir un enlace de restablecimiento.
            </p>

            {/* Mensajes de estado */}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <label className="block">
                <span className="text-sm">Usuario (correo)</span>
                <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                disabled={loading || !!success} // Deshabilita si está cargando o ya tuvo éxito
                />
            </label>
            
            <button
                type="submit"
                disabled={loading || !!success}
                className={`w-full px-3 py-2 rounded text-white ${
                    loading || !!success ? 'bg-gray-400' : 'bg-[var(--brand)] hover:bg-opacity-90'
                }`}
            >
                {loading ? 'Enviando...' : 'Restablecer Contraseña'}
            </button>

            {/* Botón para volver al login */}
            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Volver a Iniciar Sesión
                </button>
            </div>
        </form>
    );
}