import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';
import PoliceDashboard from './PoliceDashboard.jsx';
import OwnerDashboard from './OwnerDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'Admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'TrafficPolice') {
    return <PoliceDashboard />;
  }

  return <OwnerDashboard />;
};

export default Dashboard;
