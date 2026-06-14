import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, Globe, Cpu, ArrowRight } from 'lucide-react';

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
        return { title: 'Login', subtitle: 'Sign in to access your dashboard.' };
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
      // Ensure we store fullName as name in the auth state if that's what components expect, 
      // or update components to use fullName. I'll normalize it to 'name' for backward compatibility in the state.
      login({ ...data, name: data.name }); 
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Protocol Failure. Verify identity credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden font-sans selection:bg-primary-950 selection:text-white">
      {/* Brand Side (Left) - Cinematic Command Center */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-950 p-16 flex-col justify-between relative border-r-[12px] border-accent-crimson overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-900 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent-crimson rounded-full blur-[80px] opacity-10"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] group-hover:rotate-12 transition-transform duration-700">
              <Shield className="text-primary-950" size={32} />
            </div>
            <span className="text-4xl font-black tracking-tighter text-white uppercase italic">TVDS <span className="text-white/20">GRID</span></span>
          </Link>
        </div>

        <div className="relative z-10 space-y-12">
           <div className="inline-flex items-center space-x-4 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/60 text-[10px] font-black uppercase tracking-[0.4em] shadow-inner">
              <Globe size={12} className="animate-pulse" />
              <span>Authentication Protocol Alpha</span>
           </div>
           <h1 className="text-8xl font-black text-white leading-[0.8] uppercase italic tracking-tighter">Secure <br /> Grid <br /> <span className="text-accent-crimson">Node.</span></h1>
           <p className="text-neutral-400 text-xl font-bold uppercase tracking-widest leading-relaxed italic max-w-md border-l-4 border-white/10 pl-8">Access the centralized enforcement ecosystem and manage urban safety in real-time.</p>
        </div>

        <div className="relative z-10 flex items-center space-x-6">
            <div className="h-0.5 w-12 bg-white/10 rounded-full"></div>
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.6em] italic">Digital Intelligence Division © 2026</span>
        </div>
      </div>

      {/* Login Side (Right) - Modern Clean UI */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-28 py-20 relative animate-fade-in bg-slate-50/50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.02]"></div>
        
        <div className="max-w-md w-full mx-auto space-y-16 relative z-10">
          <div>
            <Link to="/" className="inline-flex items-center text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] hover:text-primary-950 transition-colors mb-10 group bg-white px-5 py-2 rounded-full border border-neutral-100 shadow-sm">
              <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform text-accent-crimson" /> Return to Command
            </Link>
            <div className="space-y-4">
                <h2 className="text-6xl font-black text-primary-950 uppercase italic tracking-tighter leading-none">{portalInfo.title}.</h2>
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2 italic border-l-4 border-accent-crimson pl-6">{portalInfo.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Mail className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                </div>
                <input
                  type="email"
                  className="block w-full pl-16 pr-8 py-6 bg-white border-2 border-neutral-100 rounded-[32px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none italic tracking-widest"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Password</label>
                 <a href="#" className="text-[9px] font-black text-accent-crimson uppercase tracking-widest hover:underline transition-all">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Lock className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                </div>
                <input
                  type="password"
                  className="block w-full pl-16 pr-8 py-6 bg-white border-2 border-neutral-100 rounded-[32px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none italic tracking-widest"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-6 bg-accent-crimson/5 border border-accent-crimson/10 rounded-[24px] flex items-start space-x-4 text-accent-crimson animate-slide-up shadow-inner">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed italic">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group w-full py-6 rounded-[32px] text-white font-black tracking-[0.5em] uppercase text-xs shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-4 ${
                loading ? 'bg-neutral-200 cursor-not-allowed text-neutral-400 shadow-none' : 'bg-primary-950 hover:bg-black shadow-primary-950/40 hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <Cpu className="animate-spin" size={20} />
              ) : (
                <>
                    <span>Sign In</span>
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-12 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                    <Shield className="text-green-600" size={14} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-300">Encrypted Grid Session Active</p>
             </div>
             <Link to="/register" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950 hover:text-accent-crimson transition-all italic underline decoration-accent-crimson/20 underline-offset-8">Create New Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
