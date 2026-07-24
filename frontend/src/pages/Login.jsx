import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const roleParam = searchParams.get('role');

  const getPortalInfo = () => {
    switch (roleParam) {
      case 'admin':
        return { title: 'Admin Portal', subtitle: 'Manage users, view reports, and system settings.' };
      case 'police':
        return { title: 'Police Portal', subtitle: 'Check violations and manage traffic records.' };
      case 'owner':
        return { title: 'Owner Portal', subtitle: 'View your violations and pay fines.' };
      default:
        return { title: 'Sign In', subtitle: 'Access your account to manage your profile.' };
    }
  };

  const portalInfo = getPortalInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email: normalizedEmail, password });
      login({ ...data, name: data.name }); 
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your identity and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Brand Side (Left) */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-900 p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-primary-950 rounded-full blur-[100px] opacity-60"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 group w-max">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Shield className="text-primary-900" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">TVDS</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-primary-100 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>System Online</span>
           </div>
           <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
             Traffic <br /> Violation <br /> Detection System
           </h1>
           <p className="text-primary-200 text-lg max-w-md">
             A unified platform for managing traffic rules, tracking violations, and processing fines automatically.
           </p>
        </div>

        <div className="relative z-10 text-primary-400 text-xs font-medium tracking-wider">
            © 2026 TVDS GOVERNMENT PORTAL
        </div>
      </div>

      {/* Login Side (Right) */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 relative animate-fade-in">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{portalInfo.title}</h2>
                <p className="text-slate-500">{portalInfo.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label htmlFor="password">Password</Label>
                 <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start space-x-3 text-rose-600 animate-slide-up">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-base py-6 group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="pt-8 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
