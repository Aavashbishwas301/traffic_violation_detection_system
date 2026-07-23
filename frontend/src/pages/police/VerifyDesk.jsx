import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { CheckCircle2, XCircle, Eye } from "lucide-react";

const VerifyDesk = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      const { data } = await api.get("/api/violations");
      setViolations(
        Array.isArray(data) ? data : data.violations || [],
      );
    } catch (err) {
      console.error("Violation fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchViolations();
  }, [user]);

  const updateStatus = async (id, status, remarks) => {
    try {
      await api.patch(`/api/violations/${id}/status`, { status, remarks });
      addToast(`Violation ${status.toLowerCase()} successfully.`, "success");
      fetchViolations();
    } catch (err) {
      addToast("Failed to update violation status.", "error");
    }
  };

  const viewEvidence = (path) => {
    if (!path) return addToast("No evidence found.", "warning");
    window.open(
      `${api.defaults.baseURL}/${path.replace(/\\/g, "/")}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <Layout title="Verification Desk">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Verification Desk">
      <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Verification Desk.
            </h3>
            <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">
              Review AI-detected violations before finalizing fines.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-5">Record</th>
                  <th className="px-6 py-5">Plate No.</th>
                  <th className="px-6 py-5">Violation</th>
                  <th className="px-6 py-5">AI Confidence</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                {violations.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-neutral-300">
                      #{v._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-neutral-100 rounded-lg text-2xs font-black border border-neutral-200">
                        {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-primary-950">
                      {v.violationType}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-accent-crimson`}
                            style={{
                              width: `${(v.aiConfidence || 0.8) * 100}%`,
                            }}></div>
                        </div>
                        <span className="text-[9px] text-neutral-400">
                          {(v.aiConfidence * 100 || 80).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[9px] ${
                          v.status === "Verified"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : v.status === "Pending"
                            ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                            : v.status === "Rejected"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {v.status === "Pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateStatus(
                                  v._id,
                                  "Verified",
                                  "Verified by Officer",
                                )
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve">
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(
                                  v._id,
                                  "Rejected",
                                  "Manual Rejection",
                                )
                              }
                              className="p-2 text-accent-crimson hover:bg-red-50 rounded-lg"
                              title="Reject">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            viewEvidence(v.imageUrl || v.evidenceUrl)
                          }
                          className="p-2 text-primary-900 hover:bg-primary-50 rounded-lg"
                          title="See Proof">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {violations.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-neutral-300 italic">
                      No violations found.
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

export default VerifyDesk;
