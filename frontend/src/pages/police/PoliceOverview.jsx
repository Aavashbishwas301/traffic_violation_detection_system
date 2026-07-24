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
        <div className="bg-primary-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden border border-primary-800">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <Badge variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-md mb-2">
                <div className="w-2 h-2 rounded-full bg-rose-400 mr-2 animate-pulse"></div>
                Duty Station: Grid North
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Officer {user?.name?.split(" ")[0]}
              </h2>
              <p className="text-primary-100 max-w-md">
                Central Enforcement Hub. Record incidents, verify AI-detected violations, and monitor the grid.
              </p>
            </div>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-lg min-w-[240px]">
              <CardHeader className="pb-2">
                <CardDescription className="text-primary-100 uppercase tracking-wider text-xs">Pending Review</CardDescription>
                <CardTitle className="text-5xl font-bold text-white">
                  {violations.filter((v) => v.status === "Pending").length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary" 
                  className="w-full mt-2"
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
            <Card key={i}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{s.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.colorClass}`}>
                  <s.icon size={24} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- ACTION NODES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:border-primary-500 hover:shadow-md transition-all group"
                onClick={() => navigate("/detect")}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-50">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">AI Detection</h4>
                    <p className="text-sm text-slate-500 mt-1">Scan footage for auto-detecting rules and traffic violations.</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-amber-500 hover:shadow-md transition-all group"
                onClick={() => navigate("/manual-entry")}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-50">
                    <Edit3 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Manual Entry</h4>
                    <p className="text-sm text-slate-500 mt-1">Manually input violation details from on-ground reports.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="h-full">
            <Card className="bg-slate-900 text-white border-slate-800 h-full flex flex-col justify-between">
              <CardHeader>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4">
                  <Activity size={24} />
                </div>
                <CardTitle className="text-2xl text-white">Duty Log</CardTitle>
                <CardDescription className="text-slate-400 mt-2 leading-relaxed">
                  All actions are recorded for legal verification. Ensure evidence is strictly linked to standard operating procedures.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button 
                  variant="secondary" 
                  className="w-full"
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
