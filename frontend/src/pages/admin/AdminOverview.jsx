import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import policeLogo from "../../assets/police_logo.jpg";
import {
  Car,
  Clock,
  Activity,
  Zap,
  Camera,
  ChevronRight,
  Database,
  Users,
  Megaphone,
  ShieldCheck,
  Radio,
  ArrowUpRight,
  Sliders,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const AdminOverview = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes, vRes] = await Promise.all([
          api.get("/api/admin/stats").catch(() => ({ data: null })),
          api.get("/api/admin/users").catch(() => ({ data: [] })),
          api.get("/api/violations").catch(() => ({ data: [] })),
        ]);
        setStats(sRes.data);
        setUsersList(uRes.data || []);
        setAllViolations(
          Array.isArray(vRes.data) ? vRes.data : vRes.data?.violations || []
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
      <Layout title={t.portal_admin}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#003893] rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: lang === 'np' ? 'कुल संकलित जरिवाना' : "Total Paid Fines",
      value: lang === 'np' 
        ? `रु ${(stats?.summary?.totalRevenue ?? 0).toLocaleString()}` 
        : `NPR ${(stats?.summary?.totalRevenue ?? 0).toLocaleString()}`,
      icon: Zap,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      accentBorder: "border-t-emerald-500",
      subtitle: lang === 'np' ? 'राजस्व खातामा दाखिला' : 'Settled to state revenue'
    },
    {
      title: lang === 'np' ? 'कुल उल्लङ्घन सङ्ख्या' : "Total Violations",
      value: stats?.summary?.totalViolations ?? 0,
      icon: Activity,
      colorClass: "text-[#003893] bg-blue-50 border-blue-100",
      accentBorder: "border-t-[#003893]",
      subtitle: lang === 'np' ? 'ग्रिडमा दर्ता भएका घटना' : 'Total system logged incidents'
    },
    {
      title: lang === 'np' ? 'बाँकी जरिवाना दायित्व' : "Outstanding Fines",
      value: lang === 'np'
        ? `रु ${(stats?.summary?.totalLiability ?? 0).toLocaleString()}`
        : `NPR ${(stats?.summary?.totalLiability ?? 0).toLocaleString()}`,
      icon: Clock,
      colorClass: "text-amber-600 bg-amber-50 border-amber-200",
      accentBorder: "border-t-amber-500",
      subtitle: lang === 'np' ? 'फर्स्यौट हुन बाँकी रकम' : 'Pending citizen liabilities'
    },
    {
      title: t.admin_total_vehicles,
      value: stats?.summary?.totalVehicles ?? 0,
      icon: Car,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
      accentBorder: "border-t-purple-600",
      subtitle: lang === 'np' ? 'यातायात कार्यालय अभिलेख' : 'DoTM registered registry'
    },
  ];

  return (
    <Layout title={t.portal_admin}>
      <div className="space-y-8 animate-fade-in pb-20">
        
        {/* --- CENTRAL ADMIN COMMAND BANNER (Homepage Midnight Navy Aesthetic) --- */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-gradient-to-r from-[#071126] via-[#0B1B3D] to-[#12224D] text-white p-7 sm:p-10">
          
          {/* Ambient Lighting */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#DC143C]/25 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#003893]/40 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Watermark Police Crest */}
          <div className="absolute right-6 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <img src={policeLogo} alt="Nepal Police Emblem" className="w-64 h-64 object-contain" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4 max-w-2xl">
              
              {/* Authority Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold">
                <span className="text-amber-300 text-[11px] font-bold">
                  {lang === 'np' ? 'नेपाल सरकार • केन्द्रीय प्रशासक कक्ष' : 'Government of Nepal • Central Administration'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {t.welcome_back},{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                  {user?.name?.split(" ")[0] || (lang === 'np' ? "प्रशासक" : "Admin")}
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                {lang === 'np'
                  ? 'राष्ट्रिय ट्राफिक नियम उल्लङ्घन डिजिटल प्रणालीको केन्द्रीय नियन्त्रण कन्सोल। प्रहरी अधिकारी परिचालन, सवारी साधन दर्ता र क्यामेरा निगरानी यसै कक्षबाट व्यवस्थापन गर्नुहोस्।'
                  : "National Traffic Violation Console. Supervise active enforcement officers, verify detection records, manage vehicle registries, and monitor revenue in real time."}
              </p>
            </div>

            {/* Officer Force Strength Card */}
            <div className="w-full lg:w-auto shrink-0 min-w-[280px]">
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#DC143C] via-amber-400 to-[#003893]"></div>

                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                    {t.admin_total_officers}
                  </span>
                  <div className="text-5xl font-black font-mono tracking-tight text-white mt-1">
                    {usersList.filter((u) => u.role === "TrafficPolice").length}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'np' ? 'कार्यक्षेत्रमा सक्रिय ट्राफिक प्रहरी' : 'verified active field officers'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <Button 
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    onClick={() => navigate("/officers")}
                  >
                    <Users size={17} className="text-[#003893]" />
                    <span>{t.nav_manage_police}</span>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- STATS GRID (Homepage Aesthetic) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all border-t-4 ${s.accentBorder}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.title}</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-2xs ${s.colorClass}`}>
                  <s.icon size={22} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11.5px] text-slate-500 font-medium">
                {s.subtitle}
              </div>
            </div>
          ))}
        </div>

        {/* --- MAIN TABLES AND CONTROLS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Violations Table */}
          <Card className="lg:col-span-2 border-slate-200/90 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 bg-slate-50/50">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-slate-900">
                  {lang === 'np' ? 'हालैका राष्ट्रिय उल्लङ्घनहरू' : 'Recent Violations'}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {lang === 'np' ? 'क्यामेरा ग्रिड तथा म्यानुअल चलानबाट संकलित नवीनतम उल्लङ्घन घटनाहरू।' : 'Latest enforcement events captured across the national grid.'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/violation-mgmt")} className="text-[#003893] font-bold hover:bg-blue-50">
                {t.action_view} <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {allViolations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-b-2xl">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                    <Camera size={30} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {lang === 'np' ? 'कुनै उल्लङ्घन फेला परेन' : 'No Violations Found'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
                    {lang === 'np' ? 'हाल ग्रिड पूर्ण सुरक्षित छ। कुनै नयाँ उल्लङ्घन दर्ता भएको छैन।' : 'The grid is currently clear. No enforcement events have been recorded recently.'}
                  </p>
                </div>
              ) : (
                <DataTable
                  data={allViolations.slice(0, 6)}
                  pagination={false}
                  columns={[
                    {
                      header: lang === 'np' ? 'घटना आईडी' : "Event ID",
                      accessorKey: "_id",
                      cell: (v) => (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#003893] border border-blue-100">
                            <Camera size={14} />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-xs text-slate-900">EVT-{v._id.slice(-6)}</div>
                            <div className="text-[11px] text-slate-500">{v.location}</div>
                          </div>
                        </div>
                      )
                    },
                    {
                      header: lang === 'np' ? 'सवारी नम्बर' : "Vehicle Plate",
                      accessorKey: "vehicleId.vehicleNumber",
                      cell: (v) => (
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 text-xs">
                          {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                        </span>
                      )
                    },
                    {
                      header: lang === 'np' ? 'उल्लङ्घन प्रकार' : "Violation Type",
                      accessorKey: "violationType",
                      cell: (v) => <Badge variant="secondary" className="font-semibold text-xs">{v.violationType}</Badge>
                    },
                    {
                      header: lang === 'np' ? 'समय' : "Time",
                      accessorKey: "violationDateTime",
                      align: "right",
                      className: "text-right",
                      cell: (v) => (
                        <span className="text-slate-500 font-mono text-xs">
                          {new Date(v.violationDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )
                    }
                  ]}
                />
              )}
            </CardContent>
          </Card>

          {/* Side Controls */}
          <div className="space-y-6">
            
            {/* Broadcast Notice Card */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-2">
                <Megaphone size={18} className="text-amber-400" />
                <h4 className="text-base font-bold text-white">
                  {t.nav_officer_alerts}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'np' 
                  ? 'सम्पूर्ण जोडिएका ट्राफिक कार्यान्वयन युनिट तथा चेकपोइन्टहरूलाई तत्काल उच्च प्राथमिकता सतर्कता सन्देश पठाउनुहोस्।' 
                  : 'Broadcast a high-priority alert or operational instruction to all connected enforcement nodes.'}
              </p>
              <Button 
                variant="secondary" 
                className="w-full justify-center font-bold mt-4 rounded-xl text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-sm" 
                onClick={() => navigate("/notifications-mgmt")}
              >
                <Megaphone size={14} className="mr-1.5" /> 
                {lang === 'np' ? 'सतर्कता सन्देश पठाउनुहोस्' : 'Broadcast Alert'}
              </Button>
            </div>

            {/* Central System Status */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Database size={18} className="text-[#003893]" />
                  <span className="font-bold text-slate-900 text-sm">
                    {lang === 'np' ? 'केन्द्रीय सर्भर स्थिति' : 'System Infrastructure'}
                  </span>
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 font-bold text-[10px]">
                  {lang === 'np' ? 'सक्रिय (Online)' : 'Online'}
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium text-slate-700">{lang === 'np' ? 'AI सर्भिस (FastAPI + YOLO)' : 'AI Vision API (YOLOv8)'}</span>
                  </div>
                  <span className="font-mono text-emerald-600 font-bold">200 OK</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium text-slate-700">{lang === 'np' ? 'डेटाबेस (MongoDB Replica)' : 'Database (MongoDB)'}</span>
                  </div>
                  <span className="font-mono text-emerald-600 font-bold">Connected</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium text-slate-700">{lang === 'np' ? 'डिजिटल भुक्तानी गेटवे (eSewa)' : 'Payment Node (eSewa)'}</span>
                  </div>
                  <span className="font-mono text-emerald-600 font-bold">Active</span>
                </div>
              </div>

              <Button 
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => navigate('/camera-calibration')}
              >
                <Sliders size={13} className="mr-1.5" />
                {t.nav_camera_zones}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOverview;
