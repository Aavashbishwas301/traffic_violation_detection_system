import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";

const PaymentHistory = () => {
  const { user } = useAuth();
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
      <Layout title="Make Payments">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const paidViolations = violations.filter((v) => v.status === "Paid");

  return (
    <Layout title="Make Payments">
      <div className="space-y-6 animate-fade-in pb-20">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">
          Payment History
        </h3>
        <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-5">Payment ID</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                {paidViolations.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-neutral-300">
                      #PAY-{v._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-primary-950">
                      {v.violationType}
                    </td>
                    <td className="px-6 py-4 text-xs font-black italic text-green-600">
                      NPR {v.appliedFineAmount || "0"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-green-50 text-green-600 border border-green-100 text-[9px]">
                        PAID
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-neutral-400">
                      {new Date(
                        v.updatedAt || v.violationDateTime,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {paidViolations.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-neutral-300 italic">
                      No payments found.
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

export default PaymentHistory;
