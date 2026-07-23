import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const AdminSettings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  return (
    <Layout title="Admin Settings">
      <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-8 border-l-8 border-primary-950">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-900 rounded-[24px] flex items-center justify-center text-white font-black text-4xl italic shadow-2xl">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">
                {user?.name}
              </h4>
              <p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">
                Master Admin
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">
                Access Type
              </p>
              <p className="text-sm font-black italic text-primary-950 uppercase">
                Full System Control
              </p>
            </div>
            <button
              onClick={() => addToast("Password update requested.", "info")}
              className="w-full py-5 bg-primary-950 text-white rounded-2xl uppercase font-black text-xs tracking-[0.5em] shadow-2xl hover:bg-black transition-all">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
