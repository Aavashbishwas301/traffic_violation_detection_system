import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, ArrowRight, Cpu, Zap, Camera, BarChart3, UserCheck, 
  ShieldAlert, Activity, Globe, Mail, Phone, MapPin, MessageSquare 
} from 'lucide-react';

const Home = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-primary-950 selection:text-white scroll-smooth">
      {/* --- CLEAN PROFESSIONAL NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-10 py-5 flex justify-between items-center transition-all">
        <div className="flex items-center space-x-4 group cursor-pointer" onClick={(e) => scrollToSection(e, 'home')}>
          <div className="w-10 h-10 bg-primary-950 rounded-xl flex items-center justify-center shadow-2xl border-b-4 border-accent-crimson group-hover:rotate-6 transition-transform">
             <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-semibold text-primary-950 leading-none block">Traffic Violation <span className="text-accent-crimson font-light">Detection System</span></span>
            <span className="text-[10px] font-semibold text-neutral-400 -mt-0.5 block ">Nepal Safety Infrastructure</span>
          </div>
        </div>
        <div className="hidden md:flex space-x-8 items-center">
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="text-sm font-semibold text-primary-950 hover:text-accent-crimson transition-colors ">Home</a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-sm font-semibold text-neutral-400 hover:text-primary-950 transition-colors ">About Us</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-sm font-semibold text-neutral-400 hover:text-primary-950 transition-colors ">Contact</a>
            <Link to="/login" className="bg-primary-950 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-2xl hover:bg-black transition-all">Login</Link>
        </div>
      </nav>

      {/* --- HOME / HERO SECTION --- */}
      <section id="home" className="relative pt-40 pb-20 px-10 overflow-hidden bg-white border-b border-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -skew-x-12 transform origin-top-right -z-10"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
          <div className="lg:col-span-8 space-y-10 animate-fade-in">
            <div className="space-y-6">
                <div className="inline-flex items-center space-x-4 px-5 py-2 rounded-full bg-white border border-slate-100 shadow-lg shadow-slate-200/50">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent-crimson animate-pulse"></div>
                   <span className="text-[11px] font-semibold text-primary-950 ">Central Enforcement Node Active</span>
                </div>
                
                <h1 className="text-7xl md:text-[8rem] font-semibold leading-[0.8] text-primary-950 ">
                   Traffic <br />
                   Violation <br /> 
                   <span className="text-accent-crimson underline decoration-slate-100 decoration-8 underline-offset-[16px]">Detection.</span>
                   <span className="block text-4xl md:text-5xl mt-4 text-primary-950/20">System Grid.</span>
                </h1>
                
                <p className="text-2xl text-neutral-400 font-bold leading-relaxed max-w-2xl pt-4 border-l-[8px] border-primary-950 pl-8">
                   Autonomous Road Safety <br /> 
                   <span className="text-primary-950 font-semibold ">Traffic Violation Detection System Grid.</span>
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <Link to="/login" className="w-full sm:w-auto px-16 py-6 bg-primary-950 text-white rounded-[24px] font-semibold shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-black hover:-translate-y-1.5 transition-all group flex items-center justify-center">
                Launch Grid <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={20} />
              </Link>
              <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-white border-4 border-slate-50 text-primary-950 rounded-[24px] font-semibold hover:border-primary-950 transition-all flex items-center justify-center">
                Enroll Node
              </Link>
            </div>

            <div className="flex items-center space-x-12 pt-10 border-t-2 border-slate-50 max-w-xl">
               <div className="space-y-1">
                  <p className="text-3xl font-semibold text-primary-950 leading-none">99.2%</p>
                  <p className="text-[11px] font-semibold text-neutral-300 ">Neural Precision</p>
               </div>
               <div className="space-y-1">
                  <p className="text-3xl font-semibold text-primary-950 leading-none">99.9%</p>
                  <p className="text-[11px] font-semibold text-neutral-300 ">System Uptime</p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block relative animate-slide-up">
             <div className="absolute -inset-10 bg-primary-900/5 blur-[120px] rounded-full"></div>
             <div className="relative z-10 grid grid-cols-2 gap-4">
                {[
                  { name: 'Prahari', role: 'police', icon: ShieldAlert, sub: 'Police Portal' },
                  { name: 'Prashasan', role: 'admin', icon: Activity, sub: 'Command Hub' },
                  { name: 'Nagarik', role: 'owner', icon: UserCheck, sub: 'Citizen Node' },
                  { name: 'Join', role: 'register', icon: Zap, sub: 'Join Grid', prime: true }
                ].map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <Link key={i} to={p.role === 'register' ? '/register' : `/login?role=${p.role}`} className={`p-6 rounded-[32px] flex flex-col justify-between aspect-square group transition-all duration-700 shadow-xl relative overflow-hidden ${p.prime ? 'bg-primary-950 text-white border-b-8 border-accent-crimson hover:scale-105' : 'bg-white border border-slate-100 hover:border-primary-950 hover:-translate-y-2'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-700 ${p.prime ? 'bg-white/10' : 'bg-slate-50 text-primary-950 group-hover:bg-primary-950 group-hover:text-white'}`}>
                          <Icon size={20} />
                      </div>
                      <div className="relative z-10">
                          <p className="font-semibold text-xl leading-none">{p.name}</p>
                          <p className={`text-[10px] font-semibold mt-1 ${p.prime ? 'text-white/40' : 'text-neutral-300'}`}>{p.sub}</p>
                      </div>
                      <ArrowRight className={`absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${p.prime ? 'text-accent-crimson' : 'text-primary-950'}`} size={16} />
                    </Link>
                  );
                })}
             </div>
          </div>
        </div>
      </section>

      {/* --- TIGHT MISSION GRID --- */}
      <section className="py-20 bg-slate-50 px-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[40px] shadow-lg hover:shadow-2xl transition-all duration-700 border border-neutral-50 space-y-6 group cursor-crosshair">
                <div className="w-16 h-16 bg-primary-950 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                  <Camera size={28} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-2xl font-semibold text-primary-950">Vision Node.</h3>
                   <p className="text-neutral-400 text-xs font-semibold leading-relaxed ">Real-time classification using distributed neural networks for transit monitoring.</p>
                </div>
            </div>
            <div className="bg-white p-10 rounded-[40px] shadow-lg hover:shadow-2xl transition-all duration-700 border border-neutral-50 space-y-6 group cursor-crosshair">
                <div className="w-16 h-16 bg-primary-950 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                  <BarChart3 size={28} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-2xl font-semibold text-primary-950">Intel Node.</h3>
                   <p className="text-neutral-400 text-xs font-semibold leading-relaxed ">Deep-tier analytics platform providing insights into safety metrics.</p>
                </div>
            </div>
            <div className="bg-white p-10 rounded-[40px] shadow-lg hover:shadow-2xl transition-all duration-700 border border-neutral-50 space-y-6 group cursor-crosshair">
                <div className="w-16 h-16 bg-primary-950 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                  <UserCheck size={28} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-2xl font-semibold text-primary-950">Public Grid.</h3>
                   <p className="text-neutral-400 text-xs font-semibold leading-relaxed ">Transparent portal ensuring seamless liability settlement for citizens.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- ABOUT US SECTION --- */}
      <section id="about" className="py-24 bg-white px-10 border-t border-slate-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-950 shadow-inner border border-slate-100 flex-shrink-0">
            <Globe size={40} />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-4xl font-semibold text-primary-950">Who We Are</h3>
            <p className="text-xl text-slate-500 leading-relaxed max-w-3xl">
              We are engineering high-fidelity automation to secure the urban transit nodes of Nepal. Our mission is to eliminate human error in traffic enforcement and ensure absolute transparency through a centralized, AI-driven enforcement grid.
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTACT US SECTION --- */}
      <section id="contact" className="py-32 px-10 relative overflow-hidden bg-primary-950 text-white border-b-8 border-accent-crimson">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-1/3 h-full bg-accent-crimson/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-start justify-between gap-16">
          <div className="space-y-6 max-w-lg text-center md:text-left">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md mx-auto md:mx-0 shadow-lg border border-white/10">
              <MessageSquare size={32} />
            </div>
            <div>
              <h3 className="text-5xl font-semibold text-white mb-6">Get in Touch</h3>
              <p className="text-primary-100 text-lg leading-relaxed">
                Direct protocols for system inquiry and technical support. Our communication nodes are active 24/7 to assist citizens and enforcement officers alike.
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[32px] shadow-2xl flex-shrink-0 w-full md:w-auto">
            <div className="space-y-6">
               <a href="mailto:chaudharypremlata10@gmail.com" className="group flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center text-accent-crimson group-hover:scale-110 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">Electronic Mail</p>
                    <p className="text-white font-medium">chaudharypremlata10@gmail.com</p>
                  </div>
               </a>
               <a href="tel:+9779842026771" className="group flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center text-accent-crimson group-hover:scale-110 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">Direct Line</p>
                    <p className="text-white font-medium">+977 9842026771</p>
                  </div>
               </a>
               <div className="group flex items-center space-x-4 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                  <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center text-accent-crimson group-hover:scale-110 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">HQ Location</p>
                    <p className="text-white font-medium">Biratnagar, Nepal</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROFESSIONAL CLEAN FOOTER --- */}
      <footer className="py-20 bg-slate-50 px-10 relative overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-primary-950 rounded-2xl flex items-center justify-center mx-auto shadow-2xl border-b-4 border-accent-crimson">
                 <Shield className="text-white w-7 h-7" />
              </div>
              <h2 className="text-2xl font-semibold text-primary-950 leading-none">Traffic Violation <span className="text-accent-crimson font-light">Detection System</span></h2>
              <p className="text-xs font-semibold text-neutral-300 ">Official Enforcement Infrastructure © 2026</p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-12 border-y border-slate-200/50 w-full py-8">
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-sm font-semibold text-neutral-400 hover:text-primary-950 transition-colors ">About Us</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-sm font-semibold text-neutral-400 hover:text-primary-950 transition-colors ">Contact</a>
              <Link to="/login" className="text-sm font-semibold text-neutral-400 hover:text-primary-950 transition-colors ">Login</Link>
           </div>

           <div className="w-full flex flex-col md:flex-row items-end justify-between gap-8 text-center md:text-left relative z-10">
              <div className="space-y-1">
                 <p className="text-[11px] font-semibold text-primary-950 ">Nepal Enforcement Division</p>
                 <p className="text-xs font-bold text-neutral-400 leading-relaxed">Official Government Transit Intelligence Platform © 2026</p>
              </div>
              <div className="md:text-right space-y-1">
                 <p className="text-[11px] font-semibold text-neutral-400 ">Architected & Engineered by</p>
                 <p className="text-base font-semibold text-primary-950 leading-none">Premlata Chaudhary <span className="text-neutral-100 mx-1">&</span> Aavash Bishwas</p>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
