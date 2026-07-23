import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";

const ProfileSettings = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/users/profile", { password: newPassword });
      setProfileMsg("Password Updated Successfully.");
      setNewPassword("");
    } catch (err) {
      setProfileMsg("Update Failed.");
    }
  };

  return (
    <Layout title="Profile Management">
      <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-8 border-l-8 border-primary-950">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-900 rounded-[24px] flex items-center justify-center text-white font-black text-4xl italic border-4 border-white shadow-2xl">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">
                {user?.name}
              </h4>
              <p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">
                {user?.role} Profile
              </p>
            </div>
          </div>
          <form onSubmit={updateProfile} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-2xs font-black uppercase tracking-widest text-neutral-400 italic">
                Change Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-sm outline-none focus:ring-8 focus:ring-primary-900/5 transition-all"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-5 rounded-2xl uppercase font-black text-xs tracking-[0.5em] shadow-2xl shadow-primary-900/20">
              Update Profile
            </button>
            {profileMsg && (
              <p className={`text-center text-2xs font-black uppercase italic animate-pulse ${profileMsg.includes('Failed') ? 'text-accent-crimson' : 'text-accent-emerald'}`}>
                {profileMsg}
              </p>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSettings;
