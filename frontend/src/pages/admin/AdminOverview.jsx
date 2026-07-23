import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import {
  Car,
  Clock,
  Activity,
  Zap,
  Camera,
  ChevronRight,
  Database,
} from "lucide-react";

const AdminOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes, vRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/users"),
          api.get("/api/violations"),
        ]);
        setStats(sRes.data);
        setUsers(uRes.data || []);
        setAllViolations(
          Array.isArray(vRes.data) ? vRes.data : vRes.data.violations || []
        );
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-12 animate-fade-in pb-20">
        {/* --- WELCOME BANNER --- */}
        <div className="bg-primary-950 rounded-[64px] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-b-[16px] border-accent-crimson group transition-all duration-1000">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_15px_#10b981] animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-white/80">
                  Authorized Command Session
                </span>
              </div>
              <div className="space-y-4">
                <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">
                  {user?.name?.split(" ")[0] || "Admin"} <br />
                  <span className="text-accent-crimson">Dashboard.</span>
                </h2>
                <p className="text-white/30 font-bold uppercase text-[11px] tracking-[0.6em] italic border-l-4 border-accent-crimson pl-8 max-w-md">
                  Manage officers, vehicles, and violation records easily.
                </p>
              </div>
            </div>

            <div className="relative group/stats cursor-crosshair">
              <div className="bg-white/5 backdrop-blur-3xl p-14 rounded-[56px] border border-white/10 flex flex-col items-center justify-center space-y-4 min-w-[300px] shadow-inner">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic">
                  Active Officers
                </p>
                <p className="text-8xl font-black italic tracking-tighter text-white leading-none group-hover/stats:scale-110 transition-transform duration-700">
                  {users.filter((u) => u.role === "TrafficPolice").length}
                </p>
                <div className="flex items-center space-x-3 text-accent-emerald font-black text-[10px] uppercase tracking-widest bg-accent-emerald/10 px-4 py-1.5 rounded-xl border border-accent-emerald/20">
                  <Activity size={14} /> <span>Status: Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              label: "Total Paid Fines",
              value: `NPR ${stats?.summary?.totalRevenue?.toLocaleString() ?? 0}`,
              icon: Zap,
              color: "text-green-600",
              bg: "bg-green-500/5",
              border: "border-green-500/20",
            },
            {
              label: "Total Violations",
              value: stats?.summary?.totalViolations ?? 0,
              icon: Activity,
              color: "text-primary-950",
              bg: "bg-primary-900/5",
              border: "border-primary-900/10",
            },
            {
              label: "Outstanding Fines",
              value: stats?.summary?.totalLiability?.toLocaleString() ?? 0,
              icon: Clock,
              color: "text-yellow-600",
              bg: "bg-yellow-500/5",
              border: "border-yellow-500/20",
            },
            {
              label: "Total Vehicles",
              value: stats?.summary?.totalVehicles ?? 0,
              icon: Car,
              color: "text-blue-600",
              bg: "bg-blue-500/5",
              border: "border-blue-500/20",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-white p-12 rounded-[56px] shadow-xl border-2 ${s.border} flex flex-col items-center text-center space-y-6 hover:-translate-y-4 transition-all duration-700 relative overflow-hidden group`}>
              <div
                className={`w-20 h-20 ${s.bg} rounded-[28px] flex items-center justify-center ${s.color} shadow-inner group-hover:rotate-12 transition-transform duration-700`}>
                <s.icon size={36} />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase text-neutral-300 tracking-[0.3em] italic">
                  {s.label}
                </p>
                <p
                  className={`text-4xl font-black italic tracking-tighter ${s.color}`}>
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- RECENT ACTIVITY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between border-b-2 border-neutral-50 pb-6">
              <div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary-950 underline decoration-accent-crimson decoration-4 underline-offset-8">
                  Recent History.
                </h3>
                <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-6 italic leading-none">
                  Last few events caught by traffic cameras
                </p>
              </div>
              <Link
                to="/violation-mgmt"
                className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-900 hover:text-accent-crimson transition-all flex items-center space-x-3 bg-white px-5 py-2.5 rounded-full border border-neutral-100 shadow-sm">
                <span>View All</span> <ChevronRight size={14} />
              </Link>
            </div>
            <div className="bg-white rounded-[64px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-neutral-100 overflow-hidden flex flex-col max-h-[500px]">
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-neutral-50 text-xs font-black uppercase italic">
                    {allViolations.slice(0, 7).map((v) => (
                      <tr
                        key={v._id}
                        className="group hover:bg-slate-50 transition-all">
                        <td className="py-8 pr-6 pl-10">
                          <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 bg-primary-950 text-white rounded-[22px] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                              <Camera size={24} />
                            </div>
                            <div>
                              <p className="text-xl text-primary-950 tracking-tighter">
                                #EVT-{v._id.slice(-6)}
                              </p>
                              <p className="text-[10px] text-neutral-300 tracking-[0.3em] uppercase font-bold mt-1">
                                {v.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-6 font-mono text-primary-950">
                          {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                        </td>
                        <td className="py-8 px-6 text-neutral-400 font-black underline decoration-accent-crimson/10 underline-offset-8 decoration-4">
                          {v.violationType}
                        </td>
                        <td className="py-8 pl-10 pr-10 text-right font-black italic text-primary-950 text-lg">
                          {new Date(v.violationDateTime).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-primary-900 rounded-[64px] p-12 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[150px]"></div>
              <div className="relative z-10 space-y-8">
                <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-tight underline decoration-white/20 underline-offset-8">
                  Quick <br /> Message.
                </h4>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">
                  Send an important notice to everyone in the system
                  immediately.
                </p>
                <button
                  onClick={() => navigate("/notifications-mgmt")}
                  className="w-full py-6 bg-white text-primary-900 rounded-[28px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-neutral-50 transition-all active:scale-95">
                  Write Message
                </button>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[64px] shadow-2xl border border-neutral-100 space-y-10 text-center relative overflow-hidden group">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto relative z-10 shadow-inner group-hover:rotate-[360deg] transition-transform duration-1000">
                <Database className="text-primary-900" size={32} />
              </div>
              <div className="space-y-4 relative z-10">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter text-primary-950 leading-none">
                  System Status.
                </h4>
                <div className="space-y-3 pt-2">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-accent-emerald h-full w-[99.9%] shadow-[0_0_15px_#10b981] animate-pulse"></div>
                  </div>
                  <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest italic">
                    All systems running at 99.9%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOverview;
