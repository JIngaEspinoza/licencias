import { Navigate, Outlet } from 'react-router-dom';
import { auth } from "../auth/auth";

interface Props {
  prohibitedRole: string;
  redirectTo?: string;
}

const RoleGuard = ({ prohibitedRole, redirectTo = "/" }: Props) => {
  const user = auth.current();
  const hasProhibitedRole = user?.roles?.includes(prohibitedRole);

  // Si tiene el rol prohibido, lo mandamos al dashboard
  if (hasProhibitedRole) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si no lo tiene, puede ver la página
  return <Outlet />;
};

export default RoleGuard;