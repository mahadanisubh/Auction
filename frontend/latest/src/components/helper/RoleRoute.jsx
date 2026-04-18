import { Navigate } from "react-router-dom";
import { useAuction } from "../../hooks/useAuction";

const RoleRoute = ({ children }) => {
  const {role} = useAuction();
  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default RoleRoute;