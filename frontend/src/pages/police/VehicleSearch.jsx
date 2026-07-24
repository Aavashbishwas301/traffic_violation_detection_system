import React, { useState } from "react";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Search, ArrowRight, BadgeCheck, Eye } from "lucide-react";

const VehicleSearch = () => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const { data } = await api.get(`/api/vehicles/${searchQuery}`);
      setSearchResult(data);
    } catch (err) {
      addToast("Vehicle not found.", "error");
      setSearchResult(null);
    }
  };

  return (
    <Layout title="Vehicle & License Check">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        <div className="bg-primary-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-crimson/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10 space-y-8">
            <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none underline decoration-accent-crimson underline-offset-8">
              Vehicle <br /> Verification.
            </h3>
            <form onSubmit={handleSearch} className="relative group max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="PLATE NUMBER..."
                className="w-full bg-white/10 border-2 border-white/10 rounded-[28px] py-6 pl-14 pr-8 font-black text-xl italic outline-none focus:ring-8 focus:ring-white/5 focus:border-white/30 transition-all uppercase placeholder:text-white/20"
              />
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40"
                size={24}
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-primary-950 p-3 rounded-2xl hover:scale-105 transition-all active:scale-95">
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>

        {searchResult && (
          <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-neutral-100 grid grid-cols-1 lg:grid-cols-2 gap-16 animate-slide-up">
            <div className="space-y-10">
              <div>
                <h4 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                  {searchResult.vehicle.vehicleNumber}
                </h4>
                <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 tracking-widest italic border-l-4 border-green-500 pl-6">
                  Active Registration Registry
                </p>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">
                    Legal Owner
                  </p>
                  <p className="text-xl font-black italic text-primary-950 uppercase">
                    {searchResult.vehicle.ownerId?.fullName}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">
                    Phone Contact
                  </p>
                  <p className="text-xl font-black italic text-primary-950 uppercase">
                    {searchResult.vehicle.ownerId?.phoneNumber || "HIDDEN"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-10">
              <div className="bg-primary-950 text-white p-10 rounded-[40px] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[60px]"></div>
                <h4 className="text-xs font-black uppercase tracking-[0.4em] border-b border-white/10 pb-4 italic">
                  Registry Status
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-[10px] font-bold uppercase italic">
                  <div>
                    <p className="text-white/40 mb-1">Insurance</p>
                    <p className="text-green-400 font-black">VALID</p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Bluebook Tax</p>
                    <p className="text-green-400 font-black">PAID</p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Violation Hist.</p>
                    <p className="text-yellow-400 font-black">
                      {searchResult.history?.length || 0} EVENTS
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Unpaid Fines</p>
                    <p className="text-accent-crimson font-black">
                      NPR{" "}
                      {searchResult.history
                        ?.filter((v) => v.status !== "Paid")
                        .reduce(
                          (acc, v) => acc + (v.appliedFineAmount || 0),
                          0
                        ) || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 border-4 border-dashed border-neutral-100 rounded-[40px] flex items-center justify-between group hover:border-primary-950/10 transition-all cursor-pointer">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary-900 group-hover:bg-primary-900 group-hover:text-white transition-colors">
                    <BadgeCheck size={32} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                      Operator Permit
                    </p>
                    <p className="text-sm font-black italic text-primary-950 uppercase">
                      Driving License Linked
                    </p>
                  </div>
                </div>
                <Eye
                  className="text-neutral-200 group-hover:text-primary-950"
                  size={20}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VehicleSearch;
