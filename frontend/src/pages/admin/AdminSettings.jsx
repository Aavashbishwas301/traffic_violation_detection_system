import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Layout from "../../components/Layout.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import api from "../../utils/axios.js";
import { 
  Edit2, Save, X, User, Mail, Phone, Lock, 
  ShieldCheck, CheckCircle2, Calendar, Clock, KeyRound, Loader2 
} from "lucide-react";

const AdminSettings = () => {
  const { user, login } = useAuth();
  const { lang } = useLanguage();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        password: ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        ...(formData.password ? { password: formData.password } : {})
      };

      const { data } = await api.put("/api/users/profile", payload);

      addToast(
        lang === 'np' ? "प्रोफाइल सफलतापूर्वक अद्यावधिक गरियो" : "Profile updated successfully", 
        "success"
      );
      login(data);
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (error) {
      addToast(
        error.response?.data?.message || (lang === 'np' ? "अद्यावधिक गर्न असफल भयो" : "Failed to update profile"), 
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={lang === 'np' ? 'प्रशासक प्रोफाइल व्यवस्थापन' : 'Admin Profile Management'}>
      <div className="max-w-6xl mx-auto space-y-4 animate-fade-in">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#990000] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#DC143C] via-amber-400 to-[#003893]"></div>
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] text-amber-300 font-bold">
              <ShieldCheck size={13} />
              <span>{lang === 'np' ? 'केन्द्रीय प्रणाली नियन्त्रक' : 'Central System Administrator'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {lang === 'np' ? 'प्रशासक खाता तथा सुरक्षा सेटिङ' : 'Administrator Account & Security'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 shadow-sm transition-all"
              >
                <Edit2 size={14} />
                <span>{lang === 'np' ? 'प्रोफाइल सम्पादन' : 'Edit Profile'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
                >
                  {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{isLoading ? (lang === 'np' ? 'सुरक्षित हुँदै...' : 'Saving...') : (lang === 'np' ? 'सुरक्षित गर्नुहोस्' : 'Save Changes')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Admin Identity & System Stats (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Identity Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center space-x-3.5">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-amber-400"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-tr from-slate-900 to-[#990000] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm">
                    {user?.name?.charAt(0) || "A"}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 truncate leading-tight">
                    {user?.name || "Admin"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                    {user?.email || "admin@nepalpolice.gov.np"}
                  </p>
                  <div className="mt-1.5 flex items-center space-x-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10.5px] font-bold text-emerald-700 uppercase tracking-wide">
                      {lang === 'np' ? 'सक्रिय खाता' : 'Active Account'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">{lang === 'np' ? 'प्रणाली भूमिका' : 'System Role'}</span>
                  <span className="font-bold text-slate-800 bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 text-[10.5px]">
                    {lang === 'np' ? 'केन्द्रीय प्रशासक' : 'Master Administrator'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">{lang === 'np' ? 'अधिकार स्तर' : 'Access Level'}</span>
                  <span className="font-semibold text-slate-700">{lang === 'np' ? 'पूर्ण नियन्त्रण' : 'Full Control'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">{lang === 'np' ? 'खाता दर्ता' : 'Joined'}</span>
                  <span className="font-semibold text-slate-700 font-mono text-[11px]">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2024-01-01"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">{lang === 'np' ? 'प्रणाली आईडी' : 'User ID'}</span>
                  <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                    {user?._id || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xs border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
                <KeyRound size={15} />
                <span>{lang === 'np' ? 'सुरक्षा स्थिति' : 'Security Assurance'}</span>
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed font-light">
                {lang === 'np' 
                  ? 'तपाईंको खाता उच्च सुरक्षा तह (JWT + bcrypt) अन्तर्गत सुरक्षित छ। पासवर्ड परिवर्तन गर्दा कम्तिमा ६ अक्षर राख्नुहोस्।'
                  : 'Account protected under high-grade 256-bit hashing. Any password change immediately re-encrypts session.'}
              </p>
            </div>
          </div>

          {/* Right Column: Editable Profile & Security Form (col-span-8) */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'np' ? 'व्यक्तिगत तथा सम्पर्क विवरण' : 'Administrative Details & Contact'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isEditing 
                      ? (lang === 'np' ? 'आवश्यक विवरणहरू परिवर्तन गरी सुरक्षित गर्नुहोस्।' : 'Update the fields below and click save.')
                      : (lang === 'np' ? 'हाल दर्ता भएका आधिकारिक विवरणहरू।' : 'Currently registered official contact credentials.')}
                  </p>
                </div>
                {isEditing && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10.5px]">
                    {lang === 'np' ? 'सम्पादन मोड' : 'Editing Mode'}
                  </span>
                )}
              </div>

              {/* 2x2 Form Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <User size={14} className="text-slate-400" />
                    <span>{lang === 'np' ? 'पूरा नाम' : 'Full Name'}</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent transition-all"
                    />
                  ) : (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800">
                      {user?.name || "N/A"}
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Mail size={14} className="text-slate-400" />
                    <span>{lang === 'np' ? 'इमेल ठेगाना' : 'Email Address'}</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent transition-all"
                    />
                  ) : (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800">
                      {user?.email || "N/A"}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Phone size={14} className="text-slate-400" />
                    <span>{lang === 'np' ? 'फोन नम्बर' : 'Phone Number'}</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="98XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent transition-all"
                    />
                  ) : (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800">
                      {user?.phoneNumber || "N/A"}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Lock size={14} className="text-slate-400" />
                    <span>{lang === 'np' ? 'नयाँ पासवर्ड (ऐच्छिक)' : 'New Password (Optional)'}</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={lang === 'np' ? 'परिवर्तन नगर्न खाली छोड्नुहोस्' : 'Leave blank to keep unchanged'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent transition-all"
                    />
                  ) : (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono font-semibold text-slate-400">
                      ••••••••••••••••
                    </div>
                  )}
                </div>

              </div>

              {/* Status & Compliance Strip */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-500">
                  <span className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>{lang === 'np' ? 'सत्र सुरक्षित' : 'Session Verified'}</span>
                  </span>
                  <span className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                    <ShieldCheck size={13} className="text-[#003893]" />
                    <span>{lang === 'np' ? 'अडिट सुरक्षित' : 'Tamper-Proof Audit'}</span>
                  </span>
                </div>

                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      {lang === 'np' ? 'रद्द' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>{isLoading ? (lang === 'np' ? 'सुरक्षित हुँदै...' : 'Saving...') : (lang === 'np' ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'Save Changes')}</span>
                    </button>
                  </div>
                )}
              </div>

            </form>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default AdminSettings;
