import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext, { AuthContextType } from '../context/AuthContext';

interface PrivateRouteProps {
  element: React.ComponentType<any>;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Element, ...rest }) => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { isAuthenticated, loading }: AuthContextType = context;

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;

