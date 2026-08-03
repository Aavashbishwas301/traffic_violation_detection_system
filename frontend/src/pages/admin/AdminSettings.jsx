import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { Edit2, Save, X, User, Mail, Phone, Lock } from "lucide-react";

const AdminSettings = () => {
  const { user, login } = useAuth();
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
        password: "" // password always blank on init
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          ...(formData.password && { password: formData.password })
        })
      });

      const data = await response.json();

      if (response.ok) {
        addToast("Profile updated successfully", "success");
        login(data); // Updates context and local storage
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: "" }));
      } else {
        addToast(data.message || "Failed to update profile", "error");
      }
    } catch (error) {
      addToast("Network error while updating profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Profile Management">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20">
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
                  {user?.name?.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">
                  {user?.name}
                </h4>
                <p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">
                  Master Admin
                </p>
              </div>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(false)}
                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Form / Details */}
          <div className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-lg font-black text-slate-800 bg-slate-50 border border-transparent px-4 py-3 rounded-xl">{user?.name || "N/A"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-lg font-black text-slate-800 bg-slate-50 border border-transparent px-4 py-3 rounded-xl">{user?.email || "N/A"}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-lg font-black text-slate-800 bg-slate-50 border border-transparent px-4 py-3 rounded-xl">{user?.phoneNumber || "N/A"}</p>
              )}
            </div>

            {/* Password (Only in Edit Mode) */}
            {isEditing && (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4" /> New Password (Optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Read-only Database Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                  Account Status
                </p>
                <p className={`text-sm font-black uppercase ${user?.status === 'Active' ? 'text-green-600' : 'text-slate-600'}`}>
                  {user?.status || "Active"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                  Access Type
                </p>
                <p className="text-sm font-black italic text-primary-950 uppercase">
                  Full System Control
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                  Account Created
                </p>
                <p className="text-sm font-black text-slate-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                  Last Login
                </p>
                <p className="text-sm font-black text-slate-700">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "First Login"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                  Profile Last Updated
                </p>
                <p className="text-sm font-black text-slate-700">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                  Database ID
                </p>
                <p className="text-sm font-black text-slate-500 font-mono text-xs">
                  {user?._id || "N/A"}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full py-5 bg-primary-950 text-white rounded-2xl uppercase font-black text-xs tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
