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
            <span className="text-xl font-black tracking-tighter text-primary-950 uppercase italic leading-none block">Traffic Violation <span className="text-accent-crimson font-light">Detection System</span></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 -mt-0.5 block italic">Nepal Safety Infrastructure</span>
          </div>
        </div>
        <div className="hidden md:flex space-x-8 items-center">
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="text-xs font-black uppercase tracking-[0.3em] text-primary-950 hover:text-accent-crimson transition-colors italic">Home</a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-primary-950 transition-colors italic">About Us</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-primary-950 transition-colors italic">Contact</a>
            <Link to="/login" className="bg-primary-950 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-black transition-all">Login</Link>
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
                   <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary-950 italic">Central Enforcement Node Active</span>
                </div>
                
                <h1 className="text-7xl md:text-[8rem] font-black leading-[0.8] tracking-[-0.03em] text-primary-950 uppercase italic">
                   Traffic <br />
                   Violation <br /> 
                   <span className="text-accent-crimson underline decoration-slate-100 decoration-8 underline-offset-[16px]">Detection.</span>
                   <span className="block text-4xl md:text-5xl mt-4 text-primary-950/20">System Grid.</span>
                </h1>
                
                <p className="text-2xl text-neutral-400 font-bold uppercase tracking-widest leading-relaxed max-w-2xl italic pt-4 border-l-[8px] border-primary-950 pl-8">
                   Autonomous Road Safety <br /> 
                   <span className="text-primary-950 font-black italic">Traffic Violation Detection System Grid.</span>
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <Link to="/login" className="w-full sm:w-auto px-16 py-6 bg-primary-950 text-white rounded-[24px] font-black uppercase tracking-[0.5em] italic shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-black hover:-translate-y-1.5 transition-all group flex items-center justify-center">
                Launch Grid <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={20} />
              </Link>
              <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-white border-4 border-slate-50 text-primary-950 rounded-[24px] font-black uppercase tracking-[0.5em] italic hover:border-primary-950 transition-all flex items-center justify-center">
                Enroll Node
              </Link>
            </div>

            <div className="flex items-center space-x-12 pt-10 border-t-2 border-slate-50 max-w-xl">
               <div className="space-y-1">
                  <p className="text-3xl font-black text-primary-950 tracking-tighter italic leading-none">99.2%</p>
                  <p className="text-[11px] font-black text-neutral-300 uppercase tracking-[0.4em] italic">Neural Precision</p>
               </div>
               <div className="space-y-1">
                  <p className="text-3xl font-black text-primary-950 tracking-tighter italic leading-none">99.9%</p>
                  <p className="text-[11px] font-black text-neutral-300 uppercase tracking-[0.4em] italic">System Uptime</p>
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
                          <p className="font-black uppercase tracking-tighter text-xl italic leading-none">{p.name}</p>
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic ${p.prime ? 'text-white/40' : 'text-neutral-300'}`}>{p.sub}</p>
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
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-950">Vision Node.</h3>
                   <p className="text-neutral-400 text-xs font-black leading-relaxed uppercase tracking-widest italic">Real-time classification using distributed neural networks for transit monitoring.</p>
                </div>
            </div>
            <div className="bg-white p-10 rounded-[40px] shadow-lg hover:shadow-2xl transition-all duration-700 border border-neutral-50 space-y-6 group cursor-crosshair">
                <div className="w-16 h-16 bg-primary-950 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                  <BarChart3 size={28} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-950">Intel Node.</h3>
                   <p className="text-neutral-400 text-xs font-black leading-relaxed uppercase tracking-widest italic">Deep-tier analytics platform providing insights into safety metrics.</p>
                </div>
            </div>
            <div className="bg-white p-10 rounded-[40px] shadow-lg hover:shadow-2xl transition-all duration-700 border border-neutral-50 space-y-6 group cursor-crosshair">
                <div className="w-16 h-16 bg-primary-950 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                  <UserCheck size={28} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-950">Public Grid.</h3>
                   <p className="text-neutral-400 text-xs font-black leading-relaxed uppercase tracking-widest italic">Transparent portal ensuring seamless liability settlement for citizens.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- ABOUT US SECTION --- */}
      <section id="about" className="py-40 bg-white px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary-900/5 blur-[160px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-10">
            <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
                <Globe className="w-3 h-3 text-accent-crimson animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary-950 italic">Digital Sovereignty / Safety Grid Alpha</span>
            </div>
            <h2 className="text-8xl md:text-[10rem] font-black text-primary-950 uppercase italic tracking-tighter leading-[0.8]">The <br /><span className="text-accent-crimson underline decoration-slate-100 decoration-8 underline-offset-[24px]">Mission.</span></h2>
            <p className="text-2xl text-neutral-400 max-w-4xl mx-auto font-bold uppercase tracking-widest leading-relaxed italic pt-12 border-t border-slate-50">
              Engineering high-fidelity automation to secure the urban transit nodes of Nepal. <br />
              <span className="text-primary-950 font-black">Absolute transparency through distributed neural vision.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: 'Neural Precision', desc: 'Leveraging YOLOv8 architectures to eliminate human error in high-speed violation classification.', icon: Cpu, id: 'PROTOCOL_01' },
              { title: 'Data Integrity', desc: 'Immutable evidence trails verified across the centralized enforcement grid for authorized audit.', icon: Shield, id: 'SECURE_GRID' },
              { title: 'Citizen Trust', desc: 'Standardized settlement protocols and accessible compliance records for unified road governance.', icon: UserCheck, id: 'PUBLIC_NODE' }
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

          <div className="text-center py-20 border-t-4 border-primary-950 relative group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-24 bg-gradient-to-t from-primary-950 to-transparent"></div>
            <div className="space-y-12">
                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.8em] italic">Architected & Engineered for the Safety Grid by</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24">
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
            </div>
          </div>
        </div>

        {/* Vision Statement - Cinematic Banner */}
        <div className="max-w-7xl mx-auto px-10 pt-20">
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
        </div>
      </section>

      {/* --- CONTACT US SECTION --- */}
      <section id="contact" className="py-40 bg-slate-50 px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white -skew-x-12 transform origin-top-right -z-10"></div>
        <div className="max-w-7xl mx-auto w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            <div className="lg:col-span-7 space-y-12 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-4 px-5 py-2 rounded-full bg-white border border-slate-100 shadow-lg shadow-slate-200/50">
                  <Globe className="w-2 h-2 text-accent-crimson animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-950 italic">Communication Node Active</span>
                </div>
                <h2 className="text-7xl md:text-[9rem] font-black leading-[0.8] tracking-[-0.03em] text-primary-950 uppercase italic">
                  Connect <br />
                  With the <br /> 
                  <span className="text-accent-crimson underline decoration-slate-100 decoration-8 underline-offset-[16px]">Grid.</span>
                </h2>
                <p className="text-2xl text-neutral-400 font-bold uppercase tracking-widest leading-relaxed max-w-2xl italic pt-8 border-l-[8px] border-primary-950 pl-8">
                  Direct protocols for <br /> 
                  <span className="text-primary-950 font-black italic">System Inquiry & Technical Support.</span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-slide-up">
              <div className="absolute -inset-10 bg-primary-900/5 blur-[120px] rounded-full"></div>
              <div className="relative z-10 grid grid-cols-1 gap-6">
                {[
                  { name: 'Electronic Mail', value: 'chaudharypremlata10@gmail.com', icon: Mail, sub: 'Technical Inquiries', action: 'mailto:chaudharypremlata10@gmail.com' },
                  { name: 'Direct Line', value: '+977 9842026771', icon: Phone, sub: 'Emergency Protocol', action: 'tel:+9779842026771' },
                  { name: 'HQ Location', value: 'Nepal', icon: MapPin, sub: 'Enforcement Center', action: '#' },
                  { name: 'Citizen Desk', value: 'Open Support Ticket', icon: MessageSquare, sub: 'Public Assistance', action: '/login?role=owner', prime: true }
                ].map((p, i) => {
                  const Icon = p.icon;
                  const isExternal = p.action.startsWith('mailto:') || p.action.startsWith('tel:') || p.action === '#';
                  const Wrapper = isExternal ? 'a' : Link;
                  const extraProps = isExternal ? { href: p.action } : { to: p.action };

                  return (
                    <Wrapper key={i} {...extraProps} className={`p-8 rounded-[40px] flex items-center justify-between group transition-all duration-700 shadow-xl relative overflow-hidden ${p.prime ? 'bg-primary-950 text-white border-b-8 border-accent-crimson hover:scale-105' : 'bg-white border border-slate-100 hover:border-primary-950 hover:-translate-y-1'}`}>
                      <div className="flex items-center space-x-6 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 ${p.prime ? 'bg-white/10' : 'bg-slate-50 text-primary-950 group-hover:bg-primary-950 group-hover:text-white'}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic ${p.prime ? 'text-white/40' : 'text-neutral-300'}`}>{p.sub}</p>
                          <p className="font-black uppercase tracking-tighter text-xl italic leading-none">{p.name}</p>
                          <p className={`text-xs mt-2 font-bold lowercase tracking-widest ${p.prime ? 'text-white/60' : 'text-neutral-400'}`}>{p.value}</p>
                        </div>
                      </div>
                      <ArrowRight className={`opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${p.prime ? 'text-accent-crimson' : 'text-primary-950'}`} size={20} />
                    </Wrapper>
                  );
                })}
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
              <h2 className="text-2xl font-black tracking-tighter text-primary-950 uppercase italic leading-none">Traffic Violation <span className="text-accent-crimson font-light">Detection System</span></h2>
              <p className="text-xs font-black uppercase tracking-[0.6em] text-neutral-300 italic">Official Enforcement Infrastructure © 2026</p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-12 border-y border-slate-200/50 w-full py-8">
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-xs font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-primary-950 transition-colors italic">About Us</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-xs font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-primary-950 transition-colors italic">Contact</a>
              <Link to="/login" className="text-xs font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-primary-950 transition-colors italic">Login</Link>
           </div>

           <div className="w-full flex flex-col md:flex-row items-end justify-between gap-8 text-center md:text-left relative z-10">
              <div className="space-y-1">
                 <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary-950 italic">Nepal Enforcement Division</p>
                 <p className="text-xs font-bold text-neutral-400 uppercase italic tracking-widest leading-relaxed">Official Government Transit Intelligence Platform © 2026</p>
              </div>
              <div className="md:text-right space-y-1">
                 <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400 italic">Architected & Engineered by</p>
                 <p className="text-base font-black text-primary-950 uppercase tracking-widest italic leading-none">Premlata Chaudhary <span className="text-neutral-100 mx-1">&</span> Aavash Bishwas</p>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
