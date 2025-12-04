import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../auth/auth'; // Asegúrate de importar tu servicio de autenticación

export default function ResetPassword() {
    // 1. Obtener parámetros de la URL
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Se extrae el token

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Validación inicial: Si no hay token, muestra un error inmediatamente.
        if (!token) {
            setError('Acceso inválido. Falta el token de restablecimiento.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword.length < 6) { // Ejemplo de validación mínima
            return setError('La contraseña debe tener al menos 6 caracteres.');
        }
        if (newPassword !== confirmPassword) {
            return setError('Las contraseñas no coinciden.');
        }
        if (!token) {
            return setError('Operación inválida: Falta el token.');
        }
        
        setLoading(true);
        try {
            // 2. LLAMADA AL BACKEND: Usar el servicio de Auth para restablecer
            await auth.resetPassword(token, newPassword); 

            setMessage('Contraseña actualizada exitosamente. Serás redirigido al login...');
            
            // Redirigir al login después de un éxito
            setTimeout(() => {
                navigate('/login');
            }, 3000); 

        } catch (err: any) {
            // El error más común aquí es que el token haya expirado
            setError(err.message || 'Error al cambiar la contraseña. El enlace podría haber expirado o es incorrecto.');
        } finally {
            setLoading(false);
        }
    };
    
    // Muestra el formulario
    return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
             <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border rounded-2xl p-6 space-y-4">
                <h1 className="text-lg font-semibold text-center">Establecer Nueva Contraseña</h1>
                
                {error && <p className="text-sm text-red-600">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}

                {/* Solo muestra los campos si hay un token y no hay mensaje de éxito */}
                {token && !message ? (
                    <>
                        <label className="block">
                            <span className="text-sm">Nueva Contraseña</span>
                            <input
                                type="password"
                                className="mt-1 w-full border rounded px-3 py-2"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm">Confirmar Contraseña</span>
                            <input
                                type="password"
                                className="mt-1 w-full border rounded px-3 py-2"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </label>

                        <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white">
                            {loading ? 'Cambiando...' : 'Establecer Nueva Contraseña'}
                        </button>
                    </>
                ) : (
                    // Si no hay token o ya tuvo éxito, solo muestra el mensaje
                    <div className="text-center pt-2">
                         <button type="button" onClick={() => navigate('/login')} className="text-sm text-blue-600 hover:text-blue-800">
                            Volver a Iniciar Sesión
                        </button>
                    </div>
                )}
             </form>
        </div>
    );
}