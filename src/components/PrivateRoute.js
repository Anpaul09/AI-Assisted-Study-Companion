import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, currentUser }) => {
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/Home" />;
  }

  return children;
};

export default PrivateRoute;
