import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Shield } from 'lucide-react';
import './App.css';

// Lazy load pages for performance optimization
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus.jsx'));

const Loader = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-white font-sans overflow-hidden relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/5 blur-[120px] rounded-full"></div>
    <div className="relative z-10 space-y-10 flex flex-col items-center">
       <div className="relative">
          <div className="absolute -inset-4 border-4 border-primary-950/10 rounded-full animate-spin"></div>
          <div className="w-24 h-24 bg-primary-950 rounded-[28px] flex items-center justify-center shadow-2xl border-b-8 border-accent-crimson animate-pulse">
             <Shield className="text-white w-12 h-12" />
          </div>
       </div>
       <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter text-primary-950 uppercase italic leading-none block">TVDS <span className="text-accent-crimson font-light text-2xl">GRID</span></h2>
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-neutral-300 italic animate-pulse">Initializing Neural Nodes...</p>
       </div>
    </div>
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
       <div className="flex items-center space-x-2">
          <div className="w-1 h-1 rounded-full bg-accent-emerald animate-ping"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-200">Secure Sync Active</span>
       </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Navigate to="/#about" replace />} />
            <Route path="/contact" element={<Navigate to="/#contact" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            
            {/* Admin Specific Routes */}
            <Route path="/users" element={<Dashboard />} />
            <Route path="/officers" element={<Dashboard />} />
            <Route path="/vehicle-mgmt" element={<Dashboard />} />
            <Route path="/violation-mgmt" element={<Dashboard />} />
            <Route path="/evidence-mgmt" element={<Dashboard />} />
            <Route path="/fines-mgmt" element={<Dashboard />} />
            <Route path="/financial-rules" element={<Dashboard />} />
            <Route path="/global-reports" element={<Dashboard />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/ai-monitoring" element={<Dashboard />} />
            <Route path="/notifications-mgmt" element={<Dashboard />} />
            <Route path="/system-settings" element={<Dashboard />} />
            
            {/* Police Specific Routes */}
            <Route path="/detect" element={<Dashboard />} />
            <Route path="/manage" element={<Dashboard />} />
            <Route path="/evidence" element={<Dashboard />} />
            <Route path="/search" element={<Dashboard />} />
            <Route path="/fines" element={<Dashboard />} />
            
            {/* Owner Specific Routes */}
            <Route path="/violations" element={<Dashboard />} />
            <Route path="/gallery" element={<Dashboard />} />
            <Route path="/payments" element={<Dashboard />} />
            <Route path="/vehicle" element={<Dashboard />} />
            <Route path="/notifications" element={<Dashboard />} />
            <Route path="/complaints" element={<Dashboard />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
