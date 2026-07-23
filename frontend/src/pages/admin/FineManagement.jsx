import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";

const FineManagement = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [allViolations, setAllViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [vRes, sRes] = await Promise.all([
        api.get("/api/violations"),
        api.get("/api/admin/stats"),
      ]);
      setAllViolations(Array.isArray(vRes.data) ? vRes.data : vRes.data.violations || []);
      setStats(sRes.data);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchData();
  }, [user]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
    try {
      await api.put(`/api/violations/${id}`, {
        status: newStatus,
        remarks: `Status changed to ${newStatus} by Admin`,
      });
      addToast(`Status updated to ${newStatus}`, "success");
      fetchData();
    } catch (err) {
      addToast("Status update failed.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Fine Management">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Fine Management">
      <div className="space-y-10 animate-fade-in pb-20 h-full flex flex-col">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Fine Management.
            </h3>
            <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 tracking-[0.4em] italic">
              Monitor payments and update fine status
            </p>
          </div>
          <div className="bg-accent-crimson text-white px-4 py-2 rounded-xl font-black text-[10px] italic">
            OUTSTANDING: NPR {stats?.summary?.totalLiability?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-white rounded-[56px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-10 py-7">ID</th>
                  <th className="px-10 py-7">Vehicle</th>
                  <th className="px-10 py-7">Amount</th>
                  <th className="px-10 py-7">Status</th>
                  <th className="px-10 py-7 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                {allViolations.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6 text-neutral-300">
                      #PAY-{v._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-10 py-6 text-primary-950">
                      {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                    </td>
                    <td className="px-10 py-6 font-black text-primary-950 text-sm">
                      NPR {v.fine?.amount || v.ruleId?.fineAmount}
                    </td>
                    <td className="px-10 py-6">
                      <span
                        className={`px-3 py-1 rounded-full border text-[9px] ${
                          v.status === "Paid"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                        {v.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => toggleStatus(v._id, v.status)}
                        className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-black transition-all">
                        CHANGE STATUS
                      </button>
                    </td>
                  </tr>
                ))}
                {allViolations.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-10 py-12 text-center text-neutral-300 italic">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FineManagement;
