import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, AlertCircle, ArrowLeft, UserCircle, Phone, BadgeCheck, Car, Globe, ArrowRight, Cpu, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VehicleOwner');
  const [phone, setPhone] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [citizenshipNumber, setCitizenshipNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/users', { 
        fullName, 
        email, 
        password, 
        role,
        phone,
        badgeNumber: role === 'TrafficPolice' ? badgeNumber : undefined,
        citizenshipNumber: role === 'VehicleOwner' ? citizenshipNumber : undefined,
        address: role === 'VehicleOwner' ? address : undefined
      });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Protocol Rejected. Ensure data integrity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden font-sans selection:bg-primary-950 selection:text-white">
      {/* Brand Side (Left) - Cinematic Command Center */}
      <div className="hidden lg:flex lg:w-1/3 bg-primary-950 p-12 flex-col justify-between relative border-r-[12px] border-accent-crimson overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent-crimson rounded-full blur-[120px] opacity-10 -mr-48"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] group-hover:rotate-12 transition-transform duration-700">
              <Shield className="text-primary-950" size={28} />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white uppercase italic">TVDS <span className="text-white/20">JOIN</span></span>
          </Link>
        </div>

        <div className="relative z-10 space-y-10">
           <div className="inline-flex items-center space-x-4 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/60 text-[10px] font-black uppercase tracking-[0.4em] shadow-inner">
              <Globe size={12} className="animate-pulse" />
              <span>Enrollment Protocol Active</span>
           </div>
           <h1 className="text-7xl font-black text-white leading-[0.85] uppercase italic tracking-tighter">New <br /> Identity <br /> <span className="text-accent-crimson">Node.</span></h1>
           <p className="text-neutral-400 text-lg font-bold uppercase tracking-widest leading-relaxed italic max-w-sm border-l-4 border-white/10 pl-6">Initialize your digital credentials to integrate with the Nepal safety ecosystem.</p>
        </div>

        <div className="relative z-10 flex items-center space-x-6">
            <div className="h-0.5 w-12 bg-white/10 rounded-full"></div>
            <span className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.6em] italic">Authorized Registrar Node © 2026</span>
        </div>
      </div>

      {/* Register Side (Right) - Modern UI */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16 relative animate-fade-in overflow-y-auto bg-slate-50/50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.02]"></div>
        
        <div className="max-w-xl w-full mx-auto space-y-12 relative z-10">
          <div>
            <Link to="/login" className="inline-flex items-center text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] hover:text-primary-950 transition-colors mb-8 group bg-white px-5 py-2 rounded-full border border-neutral-100 shadow-sm">
              <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform text-accent-crimson" /> Access Established Node
            </Link>
            <div className="space-y-4">
                <h2 className="text-5xl font-black text-primary-950 uppercase italic tracking-tighter leading-none">System Enrollment.</h2>
                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2 italic border-l-4 border-accent-crimson pl-6">Map new authorized identifiers to the grid.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Grid Clearance</label>
                    <div className="relative group">
                        <select
                        className="block w-full px-6 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 outline-none font-black text-xs appearance-none shadow-xl shadow-neutral-100/50 italic uppercase tracking-widest cursor-pointer"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        >
                        <option value="VehicleOwner">Citizen Node</option>
                        <option value="TrafficPolice">Police Hub</option>
                        <option value="Admin">Core Admin</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-accent-crimson">
                            <ShieldCheck size={18} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Mobile Sync Node</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Phone className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={18} />
                        </div>
                        <input
                        type="text"
                        className="block w-full pl-14 pr-6 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none italic tracking-widest"
                        placeholder="+977 98..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Legal Signature</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <UserCircle className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-14 pr-8 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none uppercase italic tracking-widest"
                        placeholder="NAME.IDENTITY"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Electronic Mail Node</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Mail className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                    </div>
                    <input
                        type="email"
                        className="block w-full pl-14 pr-8 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none italic tracking-widest lowercase"
                        placeholder="alias@agency.hub"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                  </div>
                </div>

                {role === 'TrafficPolice' && (
                  <div className="space-y-3 animate-slide-up">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Enforcement Badge ID</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <BadgeCheck className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                        </div>
                        <input
                        type="text"
                        className="block w-full pl-14 pr-8 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none uppercase italic tracking-widest"
                        placeholder="POL-HUB-X"
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        required
                        />
                    </div>
                  </div>
                )}

                {role === 'VehicleOwner' && (
                  <>
                  <div className="space-y-3 animate-slide-up">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Citizenship Number</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Shield className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                        </div>
                        <input
                        type="text"
                        className="block w-full pl-14 pr-8 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none uppercase italic tracking-widest"
                        placeholder="27-01-72-..."
                        value={citizenshipNumber}
                        onChange={(e) => setCitizenshipNumber(e.target.value)}
                        required
                        />
                    </div>
                  </div>
                  <div className="space-y-3 animate-slide-up">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Resident Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Globe className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                        </div>
                        <input
                        type="text"
                        className="block w-full pl-14 pr-8 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none uppercase italic tracking-widest"
                        placeholder="Kathmandu, Nepal"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        />
                    </div>
                  </div>
                  </>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic ml-1">Secure Access Key</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Lock className="text-neutral-200 group-focus-within:text-primary-950 transition-colors" size={20} />
                    </div>
                    <input
                        type="password"
                        className="block w-full pl-14 pr-8 py-5 bg-white border-2 border-neutral-100 rounded-[24px] focus:ring-8 focus:ring-primary-950/5 focus:border-primary-950 transition-all font-black text-xs shadow-xl shadow-neutral-100/50 outline-none italic tracking-widest uppercase"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
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
                    <span>Initialize Identity</span>
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center pt-8 border-t border-neutral-100 text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic">
            Identity already mapped to grid? <Link to="/login" className="text-primary-950 hover:text-accent-crimson transition-all underline underline-offset-8 decoration-accent-crimson/20">Access Grid Node</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
