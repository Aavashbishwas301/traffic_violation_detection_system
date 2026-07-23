import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { AlertTriangle, ChevronRight } from "lucide-react";

const OwnerOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const { data } = await api.get("/api/violations/my");
        setViolations(data);
      } catch (err) {
        console.error("Violation fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchViolations();
  }, [user]);

  if (loading) {
    return (
      <Layout title="User Portal">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Portal">
      <div className="space-y-12 animate-fade-in pb-20">
        {/* --- CINEMATIC CITIZEN BANNER --- */}
        <div className="bg-primary-950 rounded-[64px] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-b-[16px] border-primary-900 group transition-all duration-1000">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-900/10 to-transparent skew-x-12 transform origin-top-right"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="space-y-10">
              <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_15px_#10b981] animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-white/80">
                  Logged In Successfully
                </span>
              </div>
              <div className="space-y-4">
                <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">
                  {user?.name?.split(" ")[0]} <br />
                  <span className="text-primary-400">Portal.</span>
                </h2>
                <p className="text-white/30 font-bold uppercase text-[11px] tracking-[0.6em] italic border-l-4 border-primary-900 pl-8 max-w-md">
                  Manage your vehicle details and <br />
                  view traffic violations records.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-12 rounded-[64px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-neutral-100 space-y-10 relative group overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="flex items-center justify-between border-b-2 pb-6 border-neutral-50 relative z-10">
              <div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary-950 underline decoration-accent-crimson/20 underline-offset-8 decoration-4">
                  Active Logs.
                </h3>
                <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-6 italic leading-none">
                  List of your unpaid fines
                </p>
              </div>
              <Link
                to="/violations"
                className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-900 hover:text-accent-crimson transition-all flex items-center space-x-3 bg-white px-5 py-2.5 rounded-full border border-neutral-100 shadow-sm">
                <span>View All</span> <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-6 relative z-10">
              {violations.slice(0, 4).map((v) => (
                <div
                  key={v._id}
                  className="p-6 rounded-[32px] flex items-center justify-between shadow-lg group hover:bg-slate-50 transition-all border border-neutral-50 bg-white">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-primary-950 text-white rounded-[22px] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase italic tracking-tighter text-primary-950 leading-none">
                        {v.violationType}
                      </p>
                      <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-[0.2em] mt-1.5 italic">
                        {v.vehicleId?.vehicleNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black px-4 py-1.5 rounded-xl border uppercase italic tracking-tighter ${v.status === "Paid" ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"}`}>
                    {v.status}
                  </span>
                </div>
              ))}
              {violations.length === 0 && (
                <div className="p-6 text-center text-neutral-400 italic text-xs uppercase tracking-widest font-black border border-neutral-100 rounded-3xl">
                  No active logs found.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-12 flex flex-col">
            <div className="bg-primary-900 rounded-[64px] p-12 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 flex-1 flex flex-col justify-between border-b-[16px] border-black">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[150px]"></div>
              <div className="relative z-10 space-y-10">
                <h4 className="text-3xl font-black uppercase italic tracking-tighter underline decoration-white/20 underline-offset-8">
                  Fine <br /> Balance.
                </h4>
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase text-white/40 tracking-[0.5em] italic">
                    Total NPR Amount
                  </p>
                  <p className="text-8xl font-black italic tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700">
                    {violations
                      .filter((v) => v.status !== "Paid")
                      .reduce(
                        (acc, v) =>
                          acc +
                          (v.fine?.amount || v.ruleId?.fineAmount || 0),
                        0,
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/violations")}
                className="relative z-10 w-full py-7 bg-white text-primary-900 rounded-[32px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-neutral-50 transition-all active:scale-95 mt-8">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerOverview;
