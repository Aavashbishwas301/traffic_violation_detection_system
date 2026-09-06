import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Bell, ShieldAlert, Car, Megaphone, Loader2, Calendar, CheckCircle } from "lucide-react";

const Notifications = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/api/admin/notifications");
        setNotifications(data);
      } catch (err) {
        console.error("Notification fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchNotifications();
  }, [user]);

  const getPageHeader = () => {
    if (user?.role === 'TrafficPolice') {
      return {
        title: lang === 'np' ? 'अधिकारी सतर्कता तथा परिचालन सूचना' : 'Officer Alerts & Operational Notices',
        subtitle: lang === 'np' 
          ? 'कार्यक्षेत्र परिचालन, एआई क्यामेरा प्रमाणीकरण अलर्ट तथा विभागका आदेशहरू' 
          : 'Duty assignments, AI camera verification alerts, and departmental directives.',
        icon: Megaphone,
        badge: lang === 'np' ? 'ट्राफिक प्रहरी महाशाखा' : 'Traffic Directorate',
      };
    }
    if (user?.role === 'VehicleOwner') {
      return {
        title: lang === 'np' ? 'नागरिक सूचना तथा ई-चलान सन्देश' : 'Citizen Notifications & Citations',
        subtitle: lang === 'np'
          ? 'सवारी उल्लङ्घन ई-चलान, जरिवाना स्थिति तथा आधिकारिक भुक्तानी सूचनाहरू'
          : 'Vehicle citations, payment confirmation receipts, and official compliance updates.',
        icon: Car,
        badge: lang === 'np' ? 'नागरिक ई-सेवा' : 'Citizen E-Portal',
      };
    }
    return {
      title: lang === 'np' ? 'प्रणाली सूचना तथा अलर्टहरू' : 'System Notifications & Broadcasts',
      subtitle: lang === 'np'
        ? 'प्रणाली अपडेट, अधिकारी परिचालन तथा केन्द्रीय प्रशासनिक सूचनाहरू'
        : 'System updates, officer dispatch records, and administrative broadcasts.',
      icon: Bell,
      badge: lang === 'np' ? 'केन्द्रीय प्रशासन' : 'Central Admin',
    };
  };

  const header = getPageHeader();
  const HeaderIcon = header.icon;

  if (loading) {
    return (
      <Layout title={header.title}>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="text-[#003893] animate-spin" size={40} />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'np' ? 'सूचनाहरू लोड हुँदैछ...' : 'Fetching Notifications...'}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={header.title}>
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#003893] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#DC143C] via-amber-400 to-[#003893]"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-bold">
                <HeaderIcon size={14} />
                <span>{header.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{header.title}</h1>
              <p className="text-slate-300 text-xs sm:text-sm font-light max-w-xl">{header.subtitle}</p>
            </div>
            <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-center">
              <span className="block text-2xl font-black text-white">{notifications.length}</span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {lang === 'np' ? 'कुल सूचना' : 'Total Alerts'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 hover:border-[#003893]/40 transition-all shadow-2xs hover:shadow-md group">
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[#003893] group-hover:bg-[#003893] group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <Bell size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#003893] transition-colors">
                      {n.title}
                    </h2>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                      <Calendar size={13} />
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle size={24} />
            </div>
            <p className="text-sm font-bold text-slate-600">
              {lang === 'np' ? 'कुनै नयाँ सूचना छैन।' : 'No notifications found.'}
            </p>
            <p className="text-xs text-slate-400">
              {lang === 'np' 
                ? 'तपाईंको खाता पूर्ण रूपमा अद्यावधिक छ।' 
                : 'You are all caught up.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
