import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Cpu } from 'lucide-react';
import Layout from '../../components/Layout.jsx';

const AuthRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout title="System Verification">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Cpu className="text-primary-950 animate-spin" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
            Verifying Identity...
          </p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
