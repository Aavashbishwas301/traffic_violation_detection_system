import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Megaphone,
  Activity,
  Edit3,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans text-neutral-900">
      
      {/* --- MOBILE OVERLAY --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shrink-0 border-r border-neutral-200 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="p-8 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="p-2 bg-primary-900 rounded-lg shadow-sm">
               <Shield className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-primary-950 leading-none">TVDS</span>
              <span className="text-xs text-neutral-500 font-medium mt-1">Traffic System</span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-md" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-900 font-semibold' 
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={18} className={isActive ? 'text-primary-700' : 'text-neutral-400'} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-900 font-bold text-sm">
               {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border border-neutral-200 text-neutral-700 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-50">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-20">
           <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-md" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="hidden sm:flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
              </div>
           </div>
           
           <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                 <Activity size={14} className="text-emerald-600" />
                 <span className="text-xs font-medium text-emerald-700">System Healthy</span>
              </div>
              
              <div className="flex items-center space-x-4">
                 <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full relative transition-colors" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                 </button>
                 
                 <div className="h-8 w-px bg-neutral-200"></div>
                 
                 <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/settings')}>
                    <div className="text-right hidden sm:block">
                       <p className="text-sm font-semibold text-neutral-800 leading-none">{user?.name}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary-900 flex items-center justify-center text-white">
                       <User size={18} />
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth custom-scrollbar">
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
