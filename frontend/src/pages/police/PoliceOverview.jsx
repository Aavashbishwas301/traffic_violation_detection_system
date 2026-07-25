import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Camera, Edit3, Receipt, Bell, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: "Today's Catch",
      value: violations.filter(
        (v) => new Date(v.createdAt).toDateString() === new Date().toDateString()
      ).length,
      icon: Camera,
      colorClass: "text-primary-600 bg-primary-50"
    },
    {
      title: "Manual Entry",
      value: violations.filter((v) => !v.aiDetected).length,
      icon: Edit3,
      colorClass: "text-amber-600 bg-amber-50"
    },
    {
      title: "Fines Issued",
      value: `NPR ${stats?.summary?.totalRevenue?.toLocaleString() || 0}`,
      icon: Receipt,
      colorClass: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Active Alerts",
      value: 2,
      icon: Bell,
      colorClass: "text-rose-600 bg-rose-50"
    },
  ];

  return (
    <Layout title="Duty Station">
      <div className="space-y-8 animate-fade-in pb-20">
        
        {/* --- COMMAND BANNER --- */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700/50">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-5">
              <Badge variant="outline" className="text-white border-white/10 bg-white/5 backdrop-blur-md mb-2 py-1.5 px-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                Duty Station: Grid North (Live)
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                Officer {user?.name?.split(" ")[0]}
              </h2>
              <p className="text-slate-300 max-w-md text-lg leading-relaxed font-light">
                Central Enforcement Hub. Record incidents, verify AI-detected violations, and monitor the grid.
              </p>
            </div>

            <Card className="bg-white/5 border-white/10 text-white backdrop-blur-xl min-w-[260px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] rounded-2xl">
              <CardHeader className="pb-2 text-center">
                <CardDescription className="text-slate-300 uppercase tracking-widest text-xs font-semibold">Pending Review</CardDescription>
                <CardTitle className="text-6xl font-black text-white mt-2">
                  {violations.filter((v) => v.status === "Pending").length}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-slate-900 hover:bg-slate-200 transition-colors font-bold rounded-xl py-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  onClick={() => navigate("/manage")}
                >
                  Open Verification Desk
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s, i) => (
            <Card key={i} className="card-enterprise">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500/80 uppercase tracking-wider">{s.title}</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{s.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${s.colorClass}`}>
                  <s.icon size={26} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- ACTION NODES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card 
                className="card-enterprise cursor-pointer group"
                onClick={() => navigate("/detect")}
              >
                <CardContent className="p-8 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors shadow-sm">
                    <Camera size={26} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">AI Detection</h4>
                    <p className="text-sm text-slate-500/90 mt-2 leading-relaxed">Upload CCTV footage for automated, machine-learning powered violation detection.</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="card-enterprise cursor-pointer group"
                onClick={() => navigate("/manual-entry")}
              >
                <CardContent className="p-8 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors shadow-sm">
                    <Edit3 size={26} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">Manual Entry</h4>
                    <p className="text-sm text-slate-500/90 mt-2 leading-relaxed">Securely input violation details and upload photographic evidence directly from the field.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="h-full mt-14">
            <Card className="bg-slate-900 text-white border-slate-800/50 shadow-2xl h-full flex flex-col justify-between rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80 pointer-events-none"></div>
              <CardHeader className="relative z-10 p-8">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-emerald-400 mb-6 shadow-inner border border-white/5">
                  <Activity size={26} />
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-white">Duty Log</CardTitle>
                <CardDescription className="text-slate-400 mt-3 text-base leading-relaxed font-light">
                  All actions are recorded for legal verification. Ensure evidence is strictly linked to standard operating procedures.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-8 pt-0">
                <Button 
                  variant="outline" 
                  className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 transition-all rounded-xl py-6"
                  onClick={() => navigate("/records")}
                >
                  View Historical Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PoliceOverview;
