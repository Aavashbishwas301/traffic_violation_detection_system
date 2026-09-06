import React, { useState } from 'react';
import api from '../utils/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import policeLogo from '../assets/police_logo.jpg';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const roleParam = searchParams.get('role');

  const getPortalInfo = () => {
    switch (roleParam) {
      case 'admin':
        return { 
          title: lang === 'np' ? 'प्रशासक पोर्टल' : 'Admin Portal', 
          subtitle: lang === 'np' ? 'प्रणाली व्यवस्थापन, प्रयोगकर्ता तथा प्रतिवेदन कन्सोल।' : 'Manage users, view reports, and system settings.' 
        };
      case 'police':
        return { 
          title: lang === 'np' ? 'ट्राफिक प्रहरी पोर्टल' : 'Police Duty Portal', 
          subtitle: lang === 'np' ? 'उल्लङ्घन प्रमाण प्रमाणीकरण तथा चलान व्यवस्थापन।' : 'Check violations and manage traffic records.' 
        };
      case 'owner':
        return { 
          title: lang === 'np' ? 'सवारी धनी पोर्टल' : 'Vehicle Owner Portal', 
          subtitle: lang === 'np' ? 'आफ्ना ई-चलान हेर्नुहोस् र जरिवाना तुरुन्त तिर्नुहोस्।' : 'View your violations and pay fines securely.' 
        };
      default:
        return { 
          title: lang === 'np' ? 'प्रणालीमा प्रवेश गर्नुहोस्' : 'Sign In to TVDS', 
          subtitle: lang === 'np' ? 'आफ्नो खातामा सुरक्षित रूपमा लगइन गर्नुहोस्।' : 'Access your account to manage your profile.' 
        };
    }
  };

  const portalInfo = getPortalInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await api.post('/api/users/login', { email: normalizedEmail, password });
      login({ ...data, name: data.name }); 
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'np' ? 'इमेल वा पासवर्ड मिलेन। कृपया जाँच गरी पुन: प्रयास गर्नुहोस्।' : 'Invalid credentials. Please verify your identity and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] font-sans">
      
      {/* Brand Side (Left) - Homepage Midnight Navy Theme */}
      <div className="hidden lg:flex lg:w-[46%] bg-gradient-to-br from-[#071126] via-[#091736] to-[#12224D] p-12 flex-col justify-between relative overflow-hidden text-white border-r border-slate-800">
        
        {/* National Flag Dual Stripe */}
        <div className="absolute top-0 left-0 h-1.5 w-full flex">
          <div className="w-1/2 bg-[#DC143C]"></div>
          <div className="w-1/2 bg-[#003893]"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#DC143C]/20 rounded-full blur-[110px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-[#003893]/40 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Top Header Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3.5 group w-max">
            <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-slate-200 to-amber-500 shadow-xl group-hover:scale-105 transition-transform shrink-0">
              <img
                src={policeLogo}
                alt="Nepal Police"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white leading-none">TVDS</span>
                <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#DC143C] text-white rounded tracking-wider uppercase">NEPAL</span>
              </div>
              <p className="text-xs text-amber-300 font-bold mt-1">
                {lang === 'np' ? 'नेपाल प्रहरी • ट्राफिक निर्देशनालय' : 'Nepal Police • Traffic Directorate'}
              </p>
            </div>
          </Link>
        </div>

        {/* Central Pitch */}
        <div className="relative z-10 space-y-6">
           <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-mono text-[11px] uppercase tracking-wider">
                {lang === 'np' ? 'डिजिटल अनुगमन ग्रिड सक्रिय' : 'National Grid Online'}
              </span>
           </div>
           
           <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
             {lang === 'np' ? (
               <>
                 ट्राफिक नियम <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                   उल्लङ्घन पहिचान
                 </span> <br />
                 प्रणाली
               </>
             ) : (
               <>
                 Traffic Violation <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                   Detection System
                 </span>
               </>
             )}
           </h1>
           
           <p className="text-slate-300 text-base leading-relaxed max-w-md font-light">
             {lang === 'np' 
               ? 'स्वचालित AI क्यामेरा तथा कम्प्युटर भिजन मार्फत सडक सुरक्षा सुदृढीकरण, पारदर्शी ई-चलान तथा नागरिक सेवा प्रणाली।'
               : 'Empowering Nepal with AI surveillance, instant number plate detection, automated citation verification, and secure citizen fine settlement.'}
           </p>

           <div className="flex items-center space-x-4 pt-2 text-xs text-slate-300">
             <div className="flex items-center space-x-1.5">
               <CheckCircle2 size={16} className="text-emerald-400" />
               <span>{lang === 'np' ? 'सुरक्षित प्रमाणीकरण' : 'Secure Auth'}</span>
             </div>
             <div className="flex items-center space-x-1.5">
               <CheckCircle2 size={16} className="text-emerald-400" />
               <span>{lang === 'np' ? 'ईसेवा भुक्तानी' : 'eSewa Pay'}</span>
             </div>
           </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 text-slate-400 text-xs font-medium tracking-wider flex items-center justify-between border-t border-white/10 pt-4">
           <span>© 2026 TVDS • GOVT OF NEPAL</span>
           <span className="text-amber-400/80 font-mono text-[10px]">v2.4 SECURE</span>
        </div>
      </div>

      {/* Login Side (Right) */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative animate-fade-in bg-white lg:bg-transparent">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Top Row: Back to Home */}
          <div>
            <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-[#003893] transition-colors group">
              <ArrowLeft size={16} className="mr-1.5 group-hover:-translate-x-1 transition-transform" /> 
              {lang === 'np' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Home'}
            </Link>
          </div>

          <div className="space-y-2">
            <div className="lg:hidden flex items-center space-x-2.5 mb-2">
              <img src={policeLogo} alt="Nepal Police" className="w-8 h-8 rounded-full border border-amber-400" />
              <span className="text-xs font-bold text-[#003893]">TVDS • NEPAL POLICE</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{portalInfo.title}</h2>
            <p className="text-sm text-slate-500">{portalInfo.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {lang === 'np' ? 'इमेल ठेगाना' : 'Email Address'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <Input
                  id="email"
                  type="email"
                  className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                   {lang === 'np' ? 'पासवर्ड' : 'Password'}
                 </Label>
                 <Link to="/forgot-password" className="text-xs font-bold text-[#003893] hover:underline">
                   {lang === 'np' ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot password?'}
                 </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-700 animate-slide-up text-xs font-semibold">
                <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-bold py-6 bg-gradient-to-r from-slate-900 to-[#003893] hover:from-slate-950 hover:to-[#00286b] text-white shadow-md rounded-xl transition-all group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  {lang === 'np' ? 'प्रमाणीकरण हुँदैछ...' : 'Authenticating...'}
                </>
              ) : (
                <>
                  {lang === 'np' ? 'लगइन गर्नुहोस्' : 'Sign In'}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={17} />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            {lang === 'np' ? 'खाता छैन?' : "Don't have an account?"}{' '}
            <Link to="/register" className="font-bold text-[#003893] hover:underline">
              {lang === 'np' ? 'नयाँ दर्ता गर्नुहोस्' : 'Register now'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
