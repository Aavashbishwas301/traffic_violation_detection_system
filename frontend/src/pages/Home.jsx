import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Camera, BarChart3, UserCheck, 
  MapPin, Mail, Phone, Menu, X, ArrowRight, FileText
} from 'lucide-react';

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 font-sans text-slate-800">
      
      {/* --- STANDARD PRACTICAL NAVBAR --- */}
      <nav className="sticky top-0 w-full z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center w-full">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={(e) => scrollToSection(e, 'home')}>
            <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
               <Shield className="text-white w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 leading-none block">TVDS Portal</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">Nepal Traffic Authority</span>
            </div>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
              <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors duration-150">Home</a>
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors duration-150">Features</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors duration-150">Contact Support</a>
              <Link to="/login" className="bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-800 transition-colors duration-150">Sign In</Link>
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden pt-24 px-6 flex flex-col space-y-6">
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="text-xl font-medium text-slate-800 border-b border-neutral-100 pb-4">Home</a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-xl font-medium text-slate-800 border-b border-neutral-100 pb-4">Features</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-xl font-medium text-slate-800 border-b border-neutral-100 pb-4">Contact Support</a>
            <div className="pt-4">
              <Link to="/login" className="bg-blue-700 text-white px-6 py-3 rounded text-lg font-medium block text-center" onClick={() => setMobileMenuOpen(false)}>Sign In to Portal</Link>
            </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section id="home" className="pt-20 pb-24 px-6 lg:px-8 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-blue-50 border border-blue-100 mx-auto">
             <div className="w-2 h-2 rounded-full bg-blue-600"></div>
             <span className="text-xs font-semibold text-blue-800">System Status: Active</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
             Traffic Violation Management System
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
             The official portal for the Nepal Traffic Authority. Check vehicle citation records, manage traffic enforcement data, and handle administrative operations securely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="w-full sm:w-auto px-6 py-3 bg-blue-700 text-white rounded font-medium shadow-sm hover:bg-blue-800 transition-colors duration-150 flex items-center justify-center">
              Login to Portal <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 transition-colors duration-150 flex items-center justify-center">
              Register New Vehicle
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">System Capabilities</h2>
            <p className="text-slate-600">Core functional areas of the TVDS platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-8 rounded-lg border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-6">
                <Camera className="text-blue-700 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Detection</h3>
              <p className="text-slate-600 text-sm leading-relaxed">System integration for processing images from traffic cameras to identify potential violations automatically.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-6">
                <FileText className="text-blue-700 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Citation Management</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Secure database for traffic police to log, review, and issue official citations to vehicle owners.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-6">
                <UserCheck className="text-blue-700 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Citizen Access</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Dedicated login for vehicle owners to view their violation history and access payment gateways.</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-20 px-6 lg:px-8 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Contact Support</h3>
            <p className="text-slate-600 mb-8">
              If you require assistance accessing your records or have questions regarding a citation, please contact our support desk.
            </p>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-start space-x-4 p-4 rounded bg-neutral-50 border border-neutral-200">
                <Mail className="text-slate-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Email Support</p>
                  <a href="mailto:chaudharypremlata10@gmail.com" className="text-blue-700 text-sm hover:underline">chaudharypremlata10@gmail.com</a>
                </div>
             </div>
             
             <div className="flex items-start space-x-4 p-4 rounded bg-neutral-50 border border-neutral-200">
                <Phone className="text-slate-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Phone Directory</p>
                  <a href="tel:+9779842026771" className="text-blue-700 text-sm hover:underline">+977 9842026771</a>
                </div>
             </div>
             
             <div className="flex items-start space-x-4 p-4 rounded bg-neutral-50 border border-neutral-200">
                <MapPin className="text-slate-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Office Location</p>
                  <p className="text-slate-600 text-sm">Biratnagar, Nepal</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>TVDS Portal © 2026</span>
           </div>
           
           <div>
              Developed by Premlata & Aavash
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
