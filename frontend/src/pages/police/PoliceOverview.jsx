import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import policeLogo from "../../assets/police_logo.jpg";
import { 
  Camera, 
  Edit3, 
  Receipt, 
  Bell, 
  Activity, 
  ShieldCheck, 
  Radio, 
  ArrowUpRight, 
  FileText, 
  Eye, 
  CheckCircle2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import VerificationBanner from "../../components/VerificationBanner.jsx";

const PoliceOverview = () => {
  const { user, login } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [policeStats, setPoliceStats] = useState({ todaysCatch: 0, manualEntries: 0, pendingReview: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [violationRes, statsRes] = await Promise.all([
          api.get("/api/violations/police/stats").catch(() => ({ data: { todaysCatch: 0, manualEntries: 0, pendingReview: 0 } })),
          api.get("/api/admin/reports").catch(() => ({ data: null })),
        ]);
        setPoliceStats(violationRes.data);
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
      <Layout title={t.portal_police}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#003893] rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: t.police_todays_catch,
      value: policeStats.todaysCatch,
      icon: Camera,
      colorClass: "text-[#003893] bg-blue-50 border-blue-100",
      accentBorder: "border-t-[#003893]",
      subtitle: lang === 'np' ? 'स्वचालित AI क्यामेरा पत्ता' : 'AI automated detections'
    },
    {
      title: t.police_manual_entries,
      value: policeStats.manualEntries,
      icon: Edit3,
      colorClass: "text-amber-600 bg-amber-50 border-amber-200",
      accentBorder: "border-t-amber-500",
      subtitle: lang === 'np' ? 'क्षेत्रीय अधिकृत दर्ता' : 'Field officer citations'
    },
    {
      title: t.police_fines_issued,
      value: lang === 'np' 
        ? `रु ${(stats?.summary?.totalRevenue || 0).toLocaleString()}` 
        : `NPR ${(stats?.summary?.totalRevenue || 0).toLocaleString()}`,
      icon: Receipt,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      accentBorder: "border-t-emerald-500",
      subtitle: lang === 'np' ? 'सरकारी राजस्व संकलन' : 'Enforcement revenue'
    },
    {
      title: t.nav_officer_alerts,
      value: 0,
      icon: Bell,
      colorClass: "text-rose-600 bg-rose-50 border-rose-100",
      accentBorder: "border-t-[#DC143C]",
      subtitle: lang === 'np' ? 'तत्काल सतर्कता सूचना' : 'High-priority alerts'
    },
  ];

  return (
    <Layout title={t.portal_police}>
      <div className="space-y-8 animate-fade-in pb-20">
        
        {/* Verification Status & Upload Card */}
        <VerificationBanner 
          user={user} 
          onUploadSuccess={(data) => {
            if (user) {
              login({
                ...user,
                verificationStatus: data.verificationStatus,
                verificationDocument: data.verificationDocument,
                verificationRemarks: data.verificationRemarks,
              });
            }
          }} 
        />

        {/* --- COMMAND BANNER (Homepage Midnight Navy Theme) --- */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-gradient-to-r from-[#071126] via-[#091736] to-[#102454] text-white p-7 sm:p-10">
          
          {/* Ambient Lighting */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#DC143C]/25 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#003893]/40 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Watermark Crest */}
          <div className="absolute right-6 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <img src={policeLogo} alt="Nepal Police Crest" className="w-64 h-64 object-contain" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4 max-w-2xl">
              
              {/* Authority Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs">
                <span className="text-amber-300 font-bold text-[11px]">
                  {lang === 'np' ? 'नेपाल प्रहरी • ट्राफिक महाशाखा' : 'Nepal Police • Traffic Directorate'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {lang === 'np' ? 'प्रहरी अधिकारी' : 'Officer'}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                  {user?.name?.split(" ")[0]}
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                {lang === 'np' 
                  ? 'केन्द्रीय कार्यान्वयन केन्द्र। क्यामेराबाट संकलित उल्लङ्घनहरू प्रमाणीकरण गर्नुहोस्, फिल्डबाट चलान प्रविष्टि गर्नुहोस् र ट्राफिक अनुगमन गर्नुहोस्।'
                  : 'Central Enforcement Station. Verify camera violations, issue on-field manual traffic citations, and monitor road safety records.'}
              </p>
            </div>

            {/* Pending Review Action Card */}
            <div className="w-full lg:w-auto shrink-0 min-w-[280px]">
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-[#003893]"></div>

                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                    {t.police_pending_review}
                  </span>
                  <div className="text-5xl font-black font-mono tracking-tight text-white mt-1">
                    {policeStats.pendingReview}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'np' ? 'प्रमाणीकरण हुन बाँकी चलान' : 'citations awaiting police sign-off'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <Button 
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    onClick={() => navigate("/manage")}
                  >
                    <ShieldCheck size={18} className="text-[#003893]" />
                    <span>{t.nav_verify_desk}</span>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- STATS GRID (Homepage Card Aesthetic) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all border-t-4 ${s.accentBorder}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.title}</p>
                  <p className="text-3xl font-black text-slate-900 font-mono mt-1">{s.value}</p>
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

        {/* --- ACTION NODES & DUTY LOG --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {lang === 'np' ? 'शीघ्र कारबाही नोड्स' : 'Enforcement Action Nodes'}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {lang === 'np' ? 'प्रहरी कार्यक्षेत्र कन्सोल' : 'Official Police Console'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* AI Detection Card */}
              <div 
                className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#003893]/50 transition-all cursor-pointer group space-y-4"
                onClick={() => navigate("/detect")}
              >
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003893] group-hover:bg-[#003893] group-hover:text-white transition-colors shadow-2xs">
                    <Camera size={26} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#003893] border border-blue-100">
                    AUTOMATED SCAN
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#003893] transition-colors">
                    {t.nav_ai_scan}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {lang === 'np' 
                      ? 'CCTV फुटेज वा तस्बिर अपलोड गरी YOLOv8 तथा OCR मार्फत स्वचालित रूपमा सवारी नम्बर र उल्लङ्घन पहिचान गर्नुहोस्।' 
                      : 'Upload CCTV footage or images for automated machine-learning vehicle detection and number plate recognition.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-[#003893] group-hover:underline">
                  <span>{lang === 'np' ? 'स्क्यान सुरु गर्नुहोस्' : 'Launch AI Scan'}</span>
                  <ArrowUpRight size={14} className="ml-1" />
                </div>
              </div>

              {/* Manual Entry Card */}
              <div 
                className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group space-y-4"
                onClick={() => navigate("/manual-entry")}
              >
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-2xs">
                    <Edit3 size={26} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    FIELD CITATION
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {t.nav_manual_entry}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {lang === 'np' 
                      ? 'ड्युटी स्थलबाट सिधै सवारी साधनको नम्बर, नियम उल्लङ्घन र फोटो प्रमाण दर्ता गरी तत्काल ई-चलान जारी गर्नुहोस्।' 
                      : 'Create manual citations directly from the field with photo evidence, GPS location, and automatic statutory fine schedule.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-amber-600 group-hover:underline">
                  <span>{lang === 'np' ? 'नयाँ चलान दर्ता गर्नुहोस्' : 'Issue Manual Citation'}</span>
                  <ArrowUpRight size={14} className="ml-1" />
                </div>
              </div>

            </div>
          </div>

          {/* Legal Duty Archive */}
          <div className="h-full">
            <div className="rounded-3xl p-7 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700/60 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10 shadow-inner">
                  <Activity size={24} />
                </div>
                <h4 className="text-xl font-bold tracking-tight text-white">
                  {t.nav_violation_records}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {lang === 'np' 
                    ? 'सम्पूर्ण कार्यहरू सरकारी कानुन (सवारी तथा यातायात व्यवस्था ऐन, २०४९) बमोजिम सुरक्षित डिजिटल अभिलेखमा संकलित हुन्छन्।'
                    : 'All enforcement logs are immutably archived under Motor Vehicles and Transport Management Act, 2049 regulations.'}
                </p>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'np' ? 'अभिलेख स्थिति:' : 'Log Status:'}</span>
                    <span className="font-bold text-emerald-400">{lang === 'np' ? 'सुरक्षित तथा प्रमाणित' : 'Verified & Secure'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'np' ? 'प्रणाली ग्रिड:' : 'Surveillance Grid:'}</span>
                    <span className="font-mono text-amber-300">TVDS-KTM-01</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 relative z-10">
                <Button 
                  variant="outline" 
                  className="w-full bg-white/10 hover:bg-white/15 text-white border-white/20 transition-all rounded-xl py-5 font-bold text-xs"
                  onClick={() => navigate("/records")}
                >
                  <Eye size={15} className="mr-2" />
                  {t.action_view} {t.nav_violation_records}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PoliceOverview;
