import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import policeLogo from "../../assets/police_logo.jpg";
import { 
  AlertTriangle, 
  ChevronRight, 
  Car, 
  Receipt, 
  CreditCard, 
  ShieldCheck, 
  ArrowUpRight, 
  FileCheck2, 
  Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import VerificationBanner from "../../components/VerificationBanner.jsx";

const OwnerOverview = () => {
  const { user, login } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, vehRes] = await Promise.all([
          api.get("/api/violations/my").catch(() => ({ data: [] })),
          api.get("/api/vehicles/my").catch(() => ({ data: [] }))
        ]);
        setViolations(Array.isArray(vRes.data) ? vRes.data : []);
        setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout title={t.portal_citizen}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#003893] rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const unpaidViolations = violations.filter((v) => v.status !== "Paid");
  const paidViolations = violations.filter((v) => v.status === "Paid");
  const totalFineAmount = unpaidViolations.reduce((acc, v) => acc + (v.appliedFineAmount || 0), 0);

  return (
    <Layout title={t.portal_citizen}>
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

        {/* --- CITIZEN COMMAND BANNER (Homepage Midnight Navy Hero Aesthetic) --- */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-gradient-to-r from-[#071126] via-[#0B1B3D] to-[#12224D] text-white p-7 sm:p-10">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#DC143C]/20 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#003893]/35 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Watermark Police Crest */}
          <div className="absolute right-6 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <img src={policeLogo} alt="Nepal Police Emblem" className="w-64 h-64 object-contain" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4 max-w-2xl">
              
              {/* Department pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs">
                <span className="text-amber-300 font-bold text-[11px]">
                  {lang === 'np' ? 'नागरिक सेवा पोर्टल • नेपाल सरकार' : 'Citizen Portal • Government of Nepal'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {t.welcome_back},{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                  {user?.name?.split(" ")[0]}
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                {lang === 'np' 
                  ? 'आफ्नो सवारी साधनको विवरण, संकलित ई-चलान अभिलेख हेर्नुहोस् र बाँकी जरिवाना सुरक्षित रूपमा ईसेवा मार्फत फर्स्यौट गर्नुहोस्।' 
                  : 'Track your registered vehicles, view violation citations, and settle outstanding fines digitally via official eSewa.'}
              </p>

              {/* Quick info chips */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-700/80 px-3 py-1.5 rounded-lg text-slate-300">
                  <Car size={14} className="text-blue-400" />
                  <span>{vehicles.length} {lang === 'np' ? 'सवारी साधन' : 'Vehicles'}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-700/80 px-3 py-1.5 rounded-lg text-slate-300">
                  <FileCheck2 size={14} className="text-emerald-400" />
                  <span>{paidViolations.length} {lang === 'np' ? 'फर्स्यौट भएको' : 'Settled'}</span>
                </div>
              </div>
            </div>

            {/* Outstanding Fine Card */}
            <div className="w-full lg:w-auto shrink-0 min-w-[280px]">
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#DC143C] via-amber-400 to-[#60bb46]"></div>
                
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                    {t.owner_total_fines}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                    {lang === 'np' ? `रु ${totalFineAmount.toLocaleString()}` : `NPR ${totalFineAmount.toLocaleString()}`}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {unpaidViolations.length} {lang === 'np' ? 'ई-चलान बाँकी' : 'unpaid citations'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <Button 
                    className="w-full bg-[#60bb46] hover:bg-[#50a137] text-white font-bold py-5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    onClick={() => navigate("/violations")}
                    disabled={totalFineAmount === 0}
                  >
                    <CreditCard size={17} />
                    <span>{lang === 'np' ? 'ईसेवाबाट तुरुन्त तिर्नुहोस्' : 'Pay Online (eSewa)'}</span>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- STATS SUMMARY (Homepage Card Style) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'np' ? 'दर्ता भएका सवारी' : 'Registered Vehicles'}
                </p>
                <p className="text-3xl font-black text-slate-900 font-mono mt-1">{vehicles.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center border border-blue-100 shadow-2xs">
                <Car size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{lang === 'np' ? 'ब्लुबुक तथा स्वामित्व' : 'Bluebook & Ownership'}</span>
              <button onClick={() => navigate('/vehicle')} className="font-bold text-[#003893] hover:underline inline-flex items-center">
                {t.action_view} <ArrowUpRight size={13} className="ml-0.5" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'np' ? 'बाँकी ई-चलान' : 'Unpaid Citations'}
                </p>
                <p className="text-3xl font-black text-rose-600 font-mono mt-1">{unpaidViolations.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
                <AlertTriangle size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{lang === 'np' ? 'तत्काल कारबाही आवश्यक' : 'Requires Payment'}</span>
              <button onClick={() => navigate('/violations')} className="font-bold text-rose-600 hover:underline inline-flex items-center">
                {t.action_pay} <ArrowUpRight size={13} className="ml-0.5" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'np' ? 'फर्स्यौट भएका जरिवाना' : 'Settled Records'}
                </p>
                <p className="text-3xl font-black text-emerald-600 font-mono mt-1">{paidViolations.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                <ShieldCheck size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{lang === 'np' ? 'डिजिटल रसिद सुरक्षित' : 'Receipts Archive'}</span>
              <button onClick={() => navigate('/payments')} className="font-bold text-emerald-600 hover:underline inline-flex items-center">
                {t.action_view} <ArrowUpRight size={13} className="ml-0.5" />
              </button>
            </div>
          </div>

        </div>

        {/* --- MAIN CONTENT SPLIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Citations Card */}
          <Card className="h-full flex flex-col border-slate-200/90 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 bg-slate-50/50">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-slate-900">{t.owner_recent_violations}</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {lang === 'np' ? 'तपाईंको सवारी साधनसँग जोडिएका बाँकी ई-चलानहरू।' : 'Recent unpaid fines linked to your vehicles.'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/violations")} className="text-[#003893] shrink-0 font-bold hover:bg-blue-50">
                {t.action_view} <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              <div className="space-y-3.5">
                {unpaidViolations.slice(0, 4).map((v) => (
                  <div key={v._id} className="p-4 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between hover:border-slate-300 hover:shadow-xs transition-all">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 shadow-2xs border border-rose-100 shrink-0">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{v.violationType}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 font-semibold">{v.vehicleId?.vehicleNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {lang === 'np' ? `रु ${v.appliedFineAmount}` : `NPR ${v.appliedFineAmount}`}
                      </span>
                      <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 font-bold text-[11px]">
                        {t.status_unpaid}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {unpaidViolations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 border border-emerald-200 shadow-sm">
                      <Receipt size={30} />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {lang === 'np' ? 'सबै हिसाब चुक्ता!' : 'All Clear!'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
                      {t.owner_no_violations}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <div className="space-y-6">
            <div 
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#003893]/40 transition-all cursor-pointer group flex items-center justify-between"
              onClick={() => navigate("/vehicle")}
            >
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-blue-50 text-[#003893] rounded-2xl flex items-center justify-center group-hover:bg-[#003893] group-hover:text-white transition-colors border border-blue-100 shadow-2xs shrink-0">
                  <Car size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#003893] transition-colors">{t.nav_my_vehicles}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'np' ? 'सवारी दर्ता, ब्लुबुक तथा डिजिटल स्वामित्व विवरण व्यवस्थापन।' : 'Manage registration details, bluebook records, and ownership.'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-[#003893] group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group flex items-center justify-between"
              onClick={() => navigate("/violations")}
            >
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-200 shadow-2xs shrink-0">
                  <Receipt size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{t.nav_payment_history}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'np' ? 'विगतका सम्पूर्ण ई-चलान तथा आधिकारिक कर भुक्तानी रसिदहरू हेर्नुहोस्।' : 'Review past incidents, digital payment tax receipts, and verification history.'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Official Support Card */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                  {lang === 'np' ? 'नागरिक सहायता तथा उजुरी' : 'Citizen Helpdesk & Grievance'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'np' 
                  ? 'गलत चलान भएको शंका लागेमा वा थप जानकारीका लागि सिधै उजुरी दर्ता गर्नुहोस्।'
                  : 'If you believe a citation was issued in error or need dispute review, submit an official grievance directly.'}
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 font-bold rounded-xl text-xs bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => navigate("/complaints")}
              >
                {t.nav_send_complaint}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerOverview;
