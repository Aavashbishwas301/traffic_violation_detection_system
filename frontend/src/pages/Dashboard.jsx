import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'TrafficPolice') {
    return <Navigate to="/police" replace />;
  }

  return <Navigate to="/owner" replace />;
};

export default Dashboard;
