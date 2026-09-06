import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import { User, Mail, Phone, Home, Hash, Calendar, Users, MapPin, Building, Activity, CalendarDays } from "lucide-react";
import VerificationBanner from "../../components/VerificationBanner.jsx";

const PoliceSettings = () => {
  const { user, login } = useAuth();

  return (
    <Layout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20">
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
        <div className="bg-white border border-neutral-100 rounded-[40px] p-8 md:p-12 shadow-2xl space-y-8 border-l-8 border-primary-950">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {user?.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-[24px] object-cover shadow-2xl border-2 border-primary-900" 
                />
              ) : (
                <div className="w-20 h-20 bg-primary-900 rounded-[24px] flex items-center justify-center text-white font-black text-4xl italic shadow-2xl">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">
                  {user?.name}
                </h4>
                <p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">
                  Traffic Police Officer
                </p>
              </div>
            </div>
            {/* Note: Edit functionality intentionally removed. Only Admins can modify police details. */}
          </div>

          <hr className="border-slate-100" />

          {/* Form / Details */}
          <div className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <p className="text-lg font-black text-slate-800 bg-slate-50 border border-transparent px-4 py-3 rounded-xl">{user?.name || "N/A"}</p>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <p className="text-lg font-black text-slate-800 bg-slate-50 border border-transparent px-4 py-3 rounded-xl">{user?.email || "N/A"}</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <p className="text-lg font-black text-slate-800 bg-slate-50 border border-transparent px-4 py-3 rounded-xl">{user?.phoneNumber || "N/A"}</p>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <Home className="w-4 h-4" /> Address
              </label>
              <p className="text-lg font-black text-slate-800 bg-slate-50 border border-transparent px-4 py-3 rounded-xl">{user?.address || "N/A"}</p>
            </div>

            {/* Read-only Database Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Badge Number
                </p>
                <p className="text-sm font-black uppercase text-slate-700">
                  {user?.badgeNumber || "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Rank
                </p>
                <p className="text-sm font-black uppercase text-slate-700">
                  {user?.rank || "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Station
                </p>
                <p className="text-sm font-black uppercase text-slate-700">
                  {user?.station || "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Joining Date
                </p>
                <p className="text-sm font-black text-slate-700">
                  {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Gender
                </p>
                <p className="text-sm font-black uppercase text-slate-700">
                  {user?.gender || "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date of Birth
                </p>
                <p className="text-sm font-black text-slate-700">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                  Account Status
                </p>
                <p className={`text-sm font-black uppercase ${user?.status === 'Active' ? 'text-green-600' : 'text-slate-600'}`}>
                  {user?.status || "Active"}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PoliceSettings;
