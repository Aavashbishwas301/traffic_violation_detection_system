import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import policeLogo from '../assets/police_logo.jpg';
import { 
  Shield, 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  Bell, 
  User, 
  ChevronRight, 
  FileText, 
  Image, 
  CreditCard, 
  Car, 
  MessageSquare, 
  Search, 
  Camera, 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert,
  Megaphone, 
  Activity, 
  Edit3, 
  Sliders, 
  Menu, 
  X, 
  Radio
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItemsByRole = {
    TrafficPolice: [
      { name: t.nav_dashboard, icon: LayoutDashboard, path: '/dashboard' },
      { name: t.nav_verify_desk, icon: FileText, path: '/manage' },
      { name: t.nav_ai_scan, icon: Camera, path: '/detect' },
      { name: t.nav_manual_entry, icon: Edit3, path: '/manual-entry' },
      { name: t.nav_evidence_photos, icon: Image, path: '/evidence' },
      { name: t.nav_search_vehicle, icon: Search, path: '/search' },
      { name: t.nav_violation_records, icon: History, path: '/records' },
      { name: t.nav_camera_zones, icon: Sliders, path: '/camera-calibration' },
      { name: t.nav_officer_alerts, icon: Megaphone, path: '/notifications' },
      { name: t.nav_my_profile, icon: Settings, path: '/police-settings' },
    ],
    Admin: [
      { name: t.nav_dashboard, icon: LayoutDashboard, path: '/dashboard' },
      { name: t.nav_verifications, icon: ShieldAlert, path: '/verifications' },
      { name: t.nav_manage_police, icon: ShieldCheck, path: '/officers' },
      { name: t.nav_vehicle_registry, icon: Car, path: '/vehicle-mgmt' },
      { name: t.nav_violation_mgmt, icon: FileText, path: '/violation-mgmt' },
      { name: t.nav_fine_mgmt, icon: CreditCard, path: '/fines-mgmt' },
      { name: t.nav_traffic_rules, icon: Settings, path: '/financial-rules' },
      { name: t.nav_ai_scan, icon: Camera, path: '/detect' },
      { name: t.nav_manual_entry, icon: Edit3, path: '/manual-entry' },
      { name: t.nav_camera_zones, icon: Sliders, path: '/camera-calibration' },
      { name: t.nav_citizen_complaints, icon: MessageSquare, path: '/complaints-mgmt' },
      { name: t.nav_reports_analytics, icon: BarChart3, path: '/global-reports' },
      { name: t.nav_notifications, icon: Megaphone, path: '/notifications-mgmt' },
      { name: t.nav_profile_mgmt, icon: User, path: '/settings' },
    ],
    VehicleOwner: [
      { name: t.nav_dashboard, icon: LayoutDashboard, path: '/dashboard' },
      { name: t.nav_my_violations, icon: FileText, path: '/violations' },
      { name: t.nav_my_photos, icon: Image, path: '/gallery' },
      { name: t.nav_payment_history, icon: CreditCard, path: '/payments' },
      { name: t.nav_my_vehicles, icon: Car, path: '/vehicle' },
      { name: t.nav_notifications, icon: Bell, path: '/notifications' },
      { name: t.nav_send_complaint, icon: MessageSquare, path: '/complaints' },
      { name: t.nav_my_profile, icon: User, path: '/owner-settings' },
    ],
  };

  const filteredNav = navItemsByRole[user?.role] || [];

  const getRoleBadge = () => {
    if (user?.role === 'Admin') {
      return { label: lang === 'np' ? 'केन्द्रीय प्रशासक' : 'Central Admin', color: 'bg-[#990000] text-white border-red-800' };
    }
    if (user?.role === 'TrafficPolice') {
      return { label: lang === 'np' ? 'ट्राफिक प्रहरी' : 'Traffic Police', color: 'bg-[#003893] text-white border-blue-900' };
    }
    return { label: lang === 'np' ? 'सवारी धनी' : 'Vehicle Owner', color: 'bg-emerald-700 text-white border-emerald-800' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      
      {/* --- MOBILE OVERLAY --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shrink-0 border-r border-slate-200/90 shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* National Flag Dual Stripe Accent */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="w-1/2 bg-[#DC143C]"></div>
          <div className="w-1/2 bg-[#003893]"></div>
        </div>

        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-slate-200 to-amber-500 shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={policeLogo}
                alt="Nepal Police"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-black tracking-tight text-slate-950 leading-none">TVDS</span>
                <span className="px-1.5 py-0.5 text-[8.5px] font-extrabold bg-[#DC143C] text-white rounded tracking-wider uppercase">NEPAL</span>
              </div>
              <span className="text-[11px] font-bold text-[#003893] truncate mt-1 leading-tight">
                {lang === 'np' ? 'नेपाल प्रहरी ट्राफिक' : 'Nepal Police Traffic'}
              </span>
              <span className="text-[9.5px] text-slate-400 font-medium truncate">
                {lang === 'np' ? 'डिजिटल अनुगमन ग्रिड' : 'Digital Enforcement Grid'}
              </span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold shadow-sm border-l-4 border-l-[#DC143C]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={18} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                  <span className="text-[13.5px] tracking-tight">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={15} className="text-amber-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3 mb-4 p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-[#003893] flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
               {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user?.name}</p>
              <div className="mt-1">
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white border border-slate-200 text-slate-700 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all font-semibold text-xs shadow-2xs group"
          >
            <LogOut size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.nav_logout}</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        
        {/* Header Top Accent Ribbon */}
        <div className="h-1 w-full flex shrink-0">
          <div className="w-1/2 bg-[#DC143C]"></div>
          <div className="w-1/2 bg-[#003893]"></div>
        </div>

        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200/90 flex items-center justify-between px-5 lg:px-9 shrink-0 z-20 shadow-2xs">
           <div className="flex items-center space-x-3.5">
              <button 
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={22} />
              </button>
              <div className="flex flex-col">
                 <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
                 </div>
                 <span className="hidden sm:block text-[11px] font-medium text-slate-500 mt-0.5">
                   {lang === 'np' ? 'नेपाल सरकार • गृह मन्त्रालय • ट्राफिक निर्देशनालय' : 'Government of Nepal • Traffic Directorate Enforcement Grid'}
                 </span>
              </div>
           </div>
           
           <div className="flex items-center space-x-3 sm:space-x-5">
              
              {/* Bilingual Language Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setLang('np')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    lang === 'np'
                      ? 'bg-[#990000] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                  title="नेपाली भाषा"
                >
                  नेपाली
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    lang === 'en'
                      ? 'bg-[#003893] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                  title="English Language"
                >
                  English
                </button>
              </div>

              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                 <Activity size={14} className="text-emerald-600 animate-pulse" />
                 <span className="text-xs font-bold">{t.system_healthy}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                 <button 
                   onClick={() => navigate('/notifications')} 
                   className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors" 
                   aria-label="Notifications"
                 >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white animate-pulse"></span>
                 </button>
                 
                 <div className="h-7 w-px bg-slate-200"></div>
                 
                 <div className="flex items-center space-x-2.5 cursor-pointer pl-1 group" onClick={() => navigate('/settings')}>
                    <div className="text-right hidden sm:block">
                       <p className="text-xs font-bold text-slate-900 group-hover:text-[#003893] transition-colors leading-none truncate max-w-[130px]">
                         {user?.name}
                       </p>
                       <span className="text-[10px] text-slate-400 font-medium">{user?.role}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-[#003893] flex items-center justify-center text-white shadow-sm group-hover:ring-2 ring-amber-400 transition-all">
                       <User size={17} />
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-9 scroll-smooth custom-scrollbar">
            <div className="max-w-[1400px] mx-auto w-full">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
