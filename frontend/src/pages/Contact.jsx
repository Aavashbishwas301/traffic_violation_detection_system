import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight, Zap, Cpu, Activity, ShieldAlert } from 'lucide-react';

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden font-sans selection:bg-primary-950 selection:text-white">
      {/* Premium Professional Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-10 py-5 flex justify-between items-center transition-all">
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="w-10 h-10 bg-primary-950 rounded-xl flex items-center justify-center shadow-2xl border-b-4 border-accent-crimson group-hover:rotate-6 transition-transform">
             <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-primary-950 uppercase italic leading-none block">Traffic Violation <span className="text-accent-crimson font-light">Detection System</span></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 -mt-0.5 block italic">Nepal Safety Infrastructure</span>
          </div>
        </div>
        <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-primary-950 transition-colors italic">Home</Link>
            <Link to="/contact" className="text-xs font-black uppercase tracking-[0.3em] text-primary-950 border-b-2 border-accent-crimson pb-0.5 italic">Contact</Link>
            <Link to="/about" className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-primary-950 transition-colors italic">About Us</Link>
            <Link to="/login" className="bg-primary-950 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-black transition-all">Login</Link>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-10 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -skew-x-12 transform origin-top-right -z-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          {/* Header Section */}
          <div className="lg:col-span-7 space-y-12 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-4 px-5 py-2 rounded-full bg-white border border-slate-100 shadow-lg shadow-slate-200/50">
                 <Globe className="w-2 h-2 text-accent-crimson animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-950 italic">Communication Node Active</span>
              </div>
              
              <h1 className="text-7xl md:text-[9rem] font-black leading-[0.8] tracking-[-0.03em] text-primary-950 uppercase italic">
                 Connect <br />
                 With the <br /> 
                 <span className="text-accent-crimson underline decoration-slate-100 decoration-8 underline-offset-[16px]">Grid.</span>
              </h1>
              
              <p className="text-2xl text-neutral-400 font-bold uppercase tracking-widest leading-relaxed max-w-2xl italic pt-8 border-l-[8px] border-primary-950 pl-8">
                 Direct protocols for <br /> 
                 <span className="text-primary-950 font-black italic">System Inquiry & Technical Support.</span>
              </p>
            </div>

            <div className="flex items-center space-x-12 pt-4">
               <div className="space-y-1">
                  <p className="text-3xl font-black text-primary-950 tracking-tighter italic leading-none">24/7</p>
                  <p className="text-[11px] font-black text-neutral-300 uppercase tracking-[0.4em] italic">Node Uptime</p>
               </div>
               <div className="space-y-1">
                  <p className="text-3xl font-black text-primary-950 tracking-tighter italic leading-none">&lt;2hr</p>
                  <p className="text-[11px] font-black text-neutral-300 uppercase tracking-[0.4em] italic">Response Latency</p>
               </div>
            </div>
          </div>

          {/* Contact Grid Section */}
          <div className="lg:col-span-5 relative animate-slide-up">
            <div className="absolute -inset-10 bg-primary-900/5 blur-[120px] rounded-full"></div>
            <div className="relative z-10 grid grid-cols-1 gap-6">
              {[
                { 
                  name: 'Electronic Mail', 
                  value: 'chaudharypremlata10@gmail.com', 
                  icon: Mail, 
                  sub: 'Technical Inquiries',
                  action: 'mailto:chaudharypremlata10@gmail.com'
                },
                { 
                  name: 'Direct Line', 
                  value: '+977 9842026771', 
                  icon: Phone, 
                  sub: 'Emergency Protocol',
                  action: 'tel:+9779842026771'
                },
                { 
                  name: 'HQ Location', 
                  value: 'Nepal', 
                  icon: MapPin, 
                  sub: 'Enforcement Center',
                  action: '#'
                },
                { 
                  name: 'Citizen Desk', 
                  value: 'Open Support Ticket', 
                  icon: MessageSquare, 
                  sub: 'Public Assistance',
                  action: '/login?role=owner',
                  prime: true 
                }
              ].map((p, i) => {
                const Icon = p.icon;
                const Wrapper = p.action.startsWith('http') || p.action.startsWith('mailto') || p.action.startsWith('tel') ? 'a' : Link;
                const props = Wrapper === 'a' ? { href: p.action } : { to: p.action };

                return (
                  <Wrapper key={i} {...props} className={`p-8 rounded-[40px] flex items-center justify-between group transition-all duration-700 shadow-xl relative overflow-hidden ${p.prime ? 'bg-primary-950 text-white border-b-8 border-accent-crimson hover:scale-105' : 'bg-white border border-slate-100 hover:border-primary-950 hover:-translate-y-1'}`}>
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
      </main>

      <footer className="py-20 bg-slate-50 px-10 relative overflow-hidden border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-950 rounded-xl flex items-center justify-center shadow-2xl border-b-4 border-accent-crimson">
              <Shield className="text-white w-6 h-6" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary-950 italic">Nepal Enforcement Division</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-300 italic">Official Support Infrastructure © 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;

