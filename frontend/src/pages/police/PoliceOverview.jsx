import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Camera, Edit3, Receipt, Bell, Activity } from "lucide-react";

const PoliceOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [violationRes, statsRes] = await Promise.all([
          api.get("/api/violations"),
          api.get("/api/admin/reports"),
        ]);
        setViolations(violationRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout title="Duty Station">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Duty Station">
      <div className="space-y-12 animate-fade-in pb-20">
        {/* --- COMMAND BANNER --- */}
        <div className="bg-primary-950 rounded-[64px] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-b-[16px] border-accent-crimson group transition-all duration-1000">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="space-y-10">
              <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-crimson shadow-[0_0_15px_#dc143c] animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-white/80">
                  Duty Station: Grid North
                </span>
              </div>
              <div className="space-y-4">
                <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">
                  {user?.name?.split(" ")[0]} <br />
                  <span className="text-accent-crimson font-black tracking-[-0.1em]">
                    Officer.
                  </span>
                </h2>
                <p className="text-white/30 font-bold uppercase text-[11px] tracking-[0.6em] italic border-l-4 border-accent-crimson pl-8 max-w-md">
                  Central Enforcement Hub. <br />
                  Record incidents and scan grid footage.
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl p-14 rounded-[56px] border border-white/10 flex flex-col items-center justify-center space-y-4 min-w-[280px] shadow-inner group-hover:bg-white/10 transition-all duration-700 cursor-crosshair">
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic">
                Pending Review
              </p>
              <p className="text-9xl font-black italic tracking-tighter text-white leading-none group-hover:scale-110 transition-transform duration-700">
                {violations.filter((v) => v.status === "Pending").length}
              </p>
              <button
                onClick={() => navigate("/manage")}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                Go to Desk
              </button>
            </div>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              label: "Today Catch",
              value: violations.filter(
                (v) =>
                  new Date(v.createdAt).toDateString() ===
                  new Date().toDateString(),
              ).length,
              icon: Camera,
              color: "text-primary-950",
              bg: "bg-primary-950/5",
              border: "border-primary-950/10",
            },
            {
              label: "Manual Entry",
              value: violations.filter((v) => !v.aiDetected).length,
              icon: Edit3,
              color: "text-yellow-600",
              bg: "bg-yellow-500/5",
              border: "border-yellow-500/20",
            },
            {
              label: "Fines Issued",
              value: `NPR ${stats?.summary?.totalRevenue?.toLocaleString() || 0}`,
              icon: Receipt,
              color: "text-green-600",
              bg: "bg-green-500/5",
              border: "border-green-500/20",
            },
            {
              label: "Active Alerts",
              value: 2,
              icon: Bell,
              color: "text-accent-crimson",
              bg: "bg-accent-crimson/5",
              border: "border-accent-crimson/10",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-white p-10 rounded-[56px] shadow-xl border-2 ${s.border} flex flex-col items-center text-center space-y-5 hover:-translate-y-3 transition-all duration-500 relative overflow-hidden group`}>
              <div
                className={`w-16 h-16 ${s.bg} rounded-[24px] flex items-center justify-center ${s.color} shadow-inner group-hover:rotate-12 transition-transform`}>
                <s.icon size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-neutral-300 tracking-[0.2em] italic">
                  {s.label}
                </p>
                <p
                  className={`text-3xl font-black italic tracking-tighter ${s.color}`}>
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- ACTION NODES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b-2 border-neutral-50 pb-6">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary-950 underline decoration-accent-crimson decoration-4 underline-offset-8">
                Quick Actions.
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                onClick={() => navigate("/detect")}
                className="p-10 bg-white border border-neutral-100 rounded-[48px] shadow-2xl space-y-6 group cursor-pointer hover:bg-primary-950 transition-all duration-500">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-900 group-hover:bg-white/10 group-hover:text-white transition-all">
                  <Camera size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black italic uppercase text-primary-950 group-hover:text-white">
                    AI Detection.
                  </h4>
                  <p className="text-[10px] font-bold text-neutral-300 group-hover:text-white/40 uppercase tracking-widest mt-2 italic leading-relaxed">
                    Scan footage for auto-detecting rules.
                  </p>
                </div>
              </div>
              <div
                onClick={() => navigate("/manual-entry")}
                className="p-10 bg-white border border-neutral-100 rounded-[48px] shadow-2xl space-y-6 group cursor-pointer hover:bg-accent-crimson transition-all duration-500">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-900 group-hover:bg-white/10 group-hover:text-white transition-all">
                  <Edit3 size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black italic uppercase text-primary-950 group-hover:text-white">
                    Manual Entry.
                  </h4>
                  <p className="text-[10px] font-bold text-neutral-300 group-hover:text-white/40 uppercase tracking-widest mt-2 italic leading-relaxed">
                    Input violation details manually.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-900 p-12 rounded-[64px] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]"></div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner">
                <Activity size={28} />
              </div>
              <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-tight underline decoration-white/20 underline-offset-8">
                Duty <br /> Log.
              </h4>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">
                All actions are recorded for legal verification. Ensure
                evidence is linked.
              </p>
            </div>
            <button
              onClick={() => navigate("/records")}
              className="w-full py-6 bg-white text-primary-900 rounded-[28px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-neutral-50 transition-all mt-10">
              Historical Data
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PoliceOverview;
