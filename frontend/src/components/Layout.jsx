import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Upload, 
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
  Users,
  ShieldCheck,
  Cpu,
  Megaphone,
  Lock,
  Globe,
  Activity,
  Edit3
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    // --- ADMINISTRATOR ---
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin'] },
    { name: 'Manage Police', icon: ShieldCheck, path: '/officers', roles: ['Admin'] },
    { name: 'Vehicle Registry', icon: Car, path: '/vehicle-mgmt', roles: ['Admin'] },
    { name: 'Violation Management', icon: FileText, path: '/violation-mgmt', roles: ['Admin'] },
    { name: 'Fine Management', icon: CreditCard, path: '/fines-mgmt', roles: ['Admin'] },
    { name: 'Traffic Rules', icon: Settings, path: '/financial-rules', roles: ['Admin'] },
    { name: 'Citizen Complaints', icon: MessageSquare, path: '/complaints-mgmt', roles: ['Admin'] },
    { name: 'Reports & Analytics', icon: BarChart3, path: '/global-reports', roles: ['Admin'] },
    { name: 'Notifications', icon: Megaphone, path: '/notifications-mgmt', roles: ['Admin'] },
    { name: 'Profile Management', icon: User, path: '/settings', roles: ['Admin'] },

    // --- TRAFFIC POLICE ---
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['TrafficPolice'] },
    { name: 'AI Scan', icon: Camera, path: '/detect', roles: ['TrafficPolice'] },
    { name: 'Manual Entry', icon: Edit3, path: '/manual-entry', roles: ['TrafficPolice'] },
    { name: 'Verify Desk', icon: FileText, path: '/manage', roles: ['TrafficPolice'] },
    { name: 'Evidence Photos', icon: Image, path: '/evidence', roles: ['TrafficPolice'] },
    { name: 'Search Vehicle', icon: Search, path: '/search', roles: ['TrafficPolice'] },
    { name: 'Violation Records', icon: History, path: '/records', roles: ['TrafficPolice'] },
    { name: 'Officer Alerts', icon: Megaphone, path: '/notifications', roles: ['TrafficPolice'] },
    { name: 'Fine Records', icon: CreditCard, path: '/fines', roles: ['TrafficPolice'] },
    { name: 'Traffic Stats', icon: BarChart3, path: '/reports', roles: ['TrafficPolice'] },
    
    // --- VEHICLE OWNER ---
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['VehicleOwner'] },
    { name: 'My Violations', icon: FileText, path: '/violations', roles: ['VehicleOwner'] },
    { name: 'My Photos', icon: Image, path: '/gallery', roles: ['VehicleOwner'] },
    { name: 'Make Payments', icon: CreditCard, path: '/payments', roles: ['VehicleOwner'] },
    { name: 'My Vehicles', icon: Car, path: '/vehicle', roles: ['VehicleOwner'] },
    { name: 'Notifications', icon: Bell, path: '/notifications', roles: ['VehicleOwner'] },
    { name: 'Send Complaint', icon: MessageSquare, path: '/complaints', roles: ['VehicleOwner'] },
    
    // --- COMMON ---
    { name: 'My Profile', icon: Settings, path: '/settings', roles: ['TrafficPolice', 'VehicleOwner'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans selection:bg-primary-950 selection:text-white">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-primary-950 text-white flex flex-col shrink-0 border-r-[8px] border-accent-crimson relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="p-10 flex flex-col space-y-1 relative z-10 border-b border-white/5">
          <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="p-2 bg-white rounded-2xl shadow-[0_15px_30px_-5px_rgba(255,255,255,0.2)] group-hover:rotate-12 transition-transform duration-700">
               <Shield className="text-primary-950 w-7 h-7" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase italic leading-none">TVDS <span className="text-white/20 block text-[10px] tracking-[0.5em] mt-1">Traffic System</span></span>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-10 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-6 py-4 rounded-[22px] transition-all duration-500 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-white text-primary-950 shadow-2xl' 
                    : 'text-white/30 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-4 relative z-10">
                  <item.icon size={18} className={isActive ? 'text-accent-crimson' : 'group-hover:text-accent-crimson group-hover:scale-110 transition-transform duration-500'} />
                  <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">{item.name}</span>
                </div>
                {isActive && <div className="absolute left-0 top-0 h-full w-1.5 bg-accent-crimson animate-pulse"></div>}
                {isActive && <ChevronRight size={12} className="text-primary-950/20" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 mt-auto border-t border-white/5 bg-black/40 relative z-10">
          <div className="flex items-center space-x-5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white font-black uppercase text-base shadow-inner group cursor-pointer hover:border-white/30 transition-all">
               {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate uppercase tracking-tighter italic leading-none">{user?.name}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent-crimson mt-2 italic">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-4 py-4 bg-white/5 text-white/40 hover:text-white hover:bg-accent-crimson rounded-[20px] transition-all duration-500 group border border-white/5 hover:border-transparent active:scale-95"
          >
            <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-700" />
            <span className="font-black text-[10px] tracking-[0.4em] uppercase italic">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.03] pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-3xl border-b border-neutral-200 flex items-center justify-between px-12 shrink-0 shadow-sm relative z-20">
           <div className="animate-fade-in">
              <div className="flex items-center space-x-4">
                 <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_10px_#10b981] animate-pulse"></div>
                 <h2 className="text-3xl font-black text-primary-950 uppercase italic tracking-tighter leading-none">{title}.</h2>
              </div>
              <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.5em] mt-3 italic ml-6">System Status: Active & Secure</p>
           </div>
           
           <div className="flex items-center space-x-10">
              <div className="hidden lg:flex items-center space-x-4 px-6 py-2.5 rounded-full bg-neutral-50 border border-neutral-200 shadow-inner group cursor-crosshair">
                 <Activity size={14} className="text-accent-emerald animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 italic group-hover:text-primary-950 transition-colors">Server Healthy</span>
              </div>
              
              <div className="flex items-center space-x-6">
                 <button className="relative p-3 bg-neutral-50 rounded-2xl text-neutral-400 hover:text-primary-950 hover:bg-white hover:shadow-xl transition-all duration-500 group active:scale-90">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent-crimson rounded-full border-2 border-white shadow-sm group-hover:scale-125 transition-transform"></span>
                 </button>
                 
                 <div className="h-10 w-[2px] bg-neutral-100 rounded-full"></div>
                 
                 <div className="flex items-center space-x-5 group cursor-pointer" onClick={() => navigate('/settings')}>
                    <div className="text-right hidden sm:block">
                       <p className="text-sm font-black text-primary-950 uppercase tracking-tighter leading-none italic group-hover:text-accent-crimson transition-colors">{user?.name}</p>
                       <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.3em] mt-1.5 italic">Identity Node Verified</p>
                    </div>
                    <div className="w-12 h-12 rounded-[22px] bg-primary-950 flex items-center justify-center border-b-4 border-accent-crimson text-white shadow-xl group-hover:rotate-12 transition-all duration-500 group-hover:scale-105">
                       <User size={22} />
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area - Locked to Viewport with Internal Scroll */}
        <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-12 scroll-smooth custom-scrollbar">
            <div className="max-w-[1500px] mx-auto relative h-full">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
