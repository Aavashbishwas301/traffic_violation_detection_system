import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { BarChart3, Receipt, Database } from "lucide-react";

const GlobalReports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [sRes, vRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/violations"),
        ]);
        setStats(sRes.data);
        setAllViolations(Array.isArray(vRes.data) ? vRes.data : vRes.data.violations || []);
      } catch (err) {
        console.error("Data fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchGlobalData();
  }, [user]);

  const downloadTrends = () => {
    const content =
      "Violation Trends Report\n\n" +
      (stats?.violationsByType?.map((t) => `${t._id}: ${t.count}`).join("\n") ||
        "No data");
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `violation_trends_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
  };

  const downloadFines = () => {
    const content = `Fine Collection Report\n\nTotal Revenue: NPR ${
      stats?.summary?.totalRevenue?.toLocaleString() || 0
    }\nOutstanding: NPR ${
      stats?.summary?.totalLiability?.toLocaleString() || 0
    }\nPaid Fines Count: ${allViolations.filter((v) => v.status === "Paid").length}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fine_collection_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
  };

  if (loading) {
    return (
      <Layout title="Reports & Analytics">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Reports & Analytics">
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
        <div className="border-b-4 border-primary-950 pb-6">
          <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
            Reports & Stats.
          </h3>
          <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 italic border-l-4 border-accent-crimson pl-6">
            Fine collection reports and violation trends
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-12 rounded-[56px] shadow-2xl border border-neutral-100 space-y-8 text-center group">
            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto text-primary-900 shadow-inner">
              <BarChart3 size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase italic text-primary-950">
                Violation Trends
              </h4>
              <p className="text-[10px] font-bold text-neutral-300 uppercase mt-2 italic">
                Monthly statistics
              </p>
            </div>
            <button
              onClick={downloadTrends}
              className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
              Download Report
            </button>
          </div>
          <div className="bg-white p-12 rounded-[56px] shadow-2xl border border-neutral-100 space-y-8 text-center group">
            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto text-green-600 shadow-inner">
              <Receipt size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase italic text-primary-950">
                Fine Collection
              </h4>
              <p className="text-[10px] font-bold text-neutral-300 uppercase mt-2 italic">
                Money collected summary
              </p>
            </div>
            <button
              onClick={downloadFines}
              className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
              Download Report
            </button>
          </div>
          <div className="bg-primary-900 p-12 rounded-[56px] shadow-2xl text-white space-y-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]"></div>
            <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mx-auto shadow-inner relative z-10">
              <Database size={32} />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-black uppercase italic">
                Monthly Accuracy
              </h4>
              <p className="text-5xl font-black italic tracking-tighter mt-4 leading-none">
                94.2%
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GlobalReports;
