import { Navigate, Outlet } from 'react-router-dom';
import { auth, hasValidToken, tryRefresh } from '../auth/auth';
import { useEffect, useState } from 'react';

export default function Protected() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      if (auth.current() && hasValidToken()) return setOk(true);
      // intenta renovar si hay user guardado pero token vencido
      if (auth.current() && await tryRefresh()) return setOk(true);
      setOk(false);
    })();
  }, []);

  if (ok === null) return null; // puedes mostrar un spinner aquí
  return ok ? <Outlet /> : <Navigate to="/login" replace />;
}

/*import { Navigate, Outlet } from 'react-router-dom'
import { auth } from '../auth/auth'

export default function Protected() {
    return auth.current() ? <Outlet /> : <Navigate to="/login" replace />
}
*/