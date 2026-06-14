import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Eye, Users, ChevronRight, Globe, Zap, Cpu } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden font-sans selection:bg-primary-950 selection:text-white">
      {/* Premium Professional Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-8 py-6 flex justify-between items-center transition-all">
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="w-11 h-11 bg-primary-950 rounded-xl flex items-center justify-center shadow-2xl border-b-4 border-accent-crimson group-hover:rotate-6 transition-transform">
             <Shield className="text-white w-6 h-6" />
          </div>
          <div className="hidden lg:block leading-none">
            <span className="text-xl font-black tracking-tighter text-primary-950 uppercase italic block leading-none">Traffic Violation <span className="text-accent-crimson font-light">Detection System</span></span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 -mt-0.5 block italic">Autonomous Enforcement Intelligence Grid</span>
          </div>
        </div>
        <div className="flex space-x-12 items-center">
          <div className="hidden md:flex space-x-10">
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-primary-950 transition-colors italic">Home</Link>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-primary-950 transition-colors italic">Contact</Link>
            <Link to="/about" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950 border-b-2 border-accent-crimson pb-1 italic">About Us</Link>
          </div>
          <Link to="/login" className="bg-primary-950 text-white px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-black transition-all">Login</Link>
        </div>
      </nav>

      {/* Main Content Hub */}
      <main className="pt-48 pb-32 px-8 max-w-7xl mx-auto space-y-40 relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary-900/5 blur-[160px] rounded-full -z-10"></div>
        
        {/* Mission Section - High Authority */}
        <section className="text-center space-y-10 animate-fade-in relative z-10">
           <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
              <Globe className="w-3 h-3 text-accent-crimson animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary-950 italic">Digital Sovereignty / Safety Grid Alpha</span>
           </div>
           <h1 className="text-8xl md:text-[10rem] font-black text-primary-950 uppercase italic tracking-tighter leading-[0.8]">The <br /><span className="text-accent-crimson underline decoration-slate-100 decoration-8 underline-offset-[24px]">Mission.</span></h1>
           <p className="text-2xl text-neutral-400 max-w-4xl mx-auto font-bold uppercase tracking-widest leading-relaxed italic pt-12 border-t border-slate-50">
             Engineering high-fidelity automation to secure the urban transit nodes of Nepal. <br />
             <span className="text-primary-950 font-black">Absolute transparency through distributed neural vision.</span>
           </p>
        </section>

        {/* Technical Pillars - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
           {[
             { title: 'Neural Precision', desc: 'Leveraging YOLOv8 architectures to eliminate human error in high-speed violation classification.', icon: Cpu, id: 'PROTOCOL_01' },
             { title: 'Data Integrity', desc: 'Immutable evidence trails verified across the centralized enforcement grid for authorized audit.', icon: Shield, id: 'SECURE_GRID' },
             { title: 'Citizen Trust', desc: 'Standardized settlement protocols and accessible compliance records for unified road governance.', icon: Users, id: 'PUBLIC_NODE' }
           ].map((p, i) => (
             <div key={i} className="space-y-10 group cursor-crosshair">
                <div className="flex items-center justify-between">
                    <div className="w-1.5 h-12 bg-accent-crimson rounded-full group-hover:h-20 transition-all duration-700"></div>
                    <span className="text-[9px] font-black text-neutral-200 tracking-widest">{p.id}</span>
                </div>
                <div className="space-y-8">
                   <div className="w-20 h-20 bg-primary-950 rounded-[28px] flex items-center justify-center text-white shadow-2xl border-b-8 border-black group-hover:rotate-6 transition-transform">
                      <p.icon size={36} />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter text-primary-950 group-hover:translate-x-2 transition-transform duration-500 underline decoration-slate-100 underline-offset-8 decoration-4">{p.title}.</h3>
                      <p className="text-neutral-400 text-sm font-black leading-relaxed uppercase tracking-widest italic">{p.desc}</p>
                   </div>
                </div>
                <div className="h-1 w-12 bg-slate-100 group-hover:w-full group-hover:bg-primary-950 transition-all duration-1000"></div>
             </div>
           ))}
        </div>

        {/* Vision Statement - Cinematic Banner */}
        <section className="bg-primary-950 rounded-[64px] p-20 md:p-32 text-white relative overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border-b-[16px] border-accent-crimson group">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-900/20 -skew-x-12 transform origin-top-right"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accent-crimson/5 blur-[160px] rounded-full"></div>
           
           <div className="relative z-10 space-y-16">
              <div className="space-y-8">
                 <p className="text-[10px] font-black uppercase tracking-[0.6em] text-accent-crimson italic">Infrastructure Architecture v2.0</p>
                 <h2 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">Autonomous <br /> Enforcement <br /> <span className="text-accent-crimson">Era.</span></h2>
              </div>
              <div className="h-2 w-32 bg-white/10 rounded-full group-hover:w-64 transition-all duration-1000"></div>
              <p className="text-white/40 text-2xl max-w-3xl font-black uppercase tracking-widest leading-relaxed italic">By digitizing the enforcement pipeline, we create a scalable, objective, and efficient traffic management system optimized for the unique dynamics of Nepal transit nodes.</p>
              
              <div className="pt-12 flex items-center space-x-8">
                 <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-inner group-hover:rotate-12 transition-transform">
                    <Zap className="text-accent-crimson" size={32} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-white">System Health: Nominal</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Verified Infrastructure Status Node Active</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Engineering Hub - Professional CTA */}
        <div className="text-center py-32 border-t-4 border-primary-950 relative group">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-24 bg-gradient-to-t from-primary-950 to-transparent"></div>
           <div className="space-y-12">
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.8em] italic">Architected & Engineered for the Safety Grid by</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 relative z-10">
                 <div className="space-y-2 group/name cursor-crosshair">
                    <p className="text-4xl font-black text-primary-950 uppercase tracking-[-0.02em] italic group-hover/name:text-accent-crimson transition-colors">Premlata Chaudhary</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-300">Lead Intelligence Architect</p>
                 </div>
                 <div className="hidden md:block w-3 h-3 rotate-45 bg-primary-950"></div>
                 <div className="space-y-2 group/name cursor-crosshair">
                    <p className="text-4xl font-black text-primary-950 uppercase tracking-[-0.02em] italic group-hover/name:text-accent-crimson transition-colors">Aavash Bishwas</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-300">Senior Neural Engineer</p>
                 </div>
              </div>
              <div className="pt-20">
                 <Link to="/contact" className="px-12 py-5 bg-white border-2 border-slate-100 text-primary-950 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] italic hover:border-primary-950 hover:bg-slate-50 transition-all shadow-xl">Contact Engineering Hub</Link>
              </div>
           </div>
        </div>
      </main>

      {/* master footer partial */}
      <footer className="py-20 bg-slate-50 px-8 text-center border-t border-slate-100">
         <p className="text-[9px] font-black uppercase tracking-[0.6em] text-neutral-300 italic">Traffic Violation Detection System Grid © 2026</p>
      </footer>
    </div>
  );
};

export default About;
