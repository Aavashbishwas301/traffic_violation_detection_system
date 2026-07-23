import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Edit3, CheckCircle2, Trash2 } from "lucide-react";

const ViolationManagement = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      const { data } = await api.get("/api/violations");
      setAllViolations(Array.isArray(data) ? data : data.violations || []);
    } catch (err) {
      console.error("Violations fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchViolations();
  }, [user]);

  const handleVerify = async (id) => {
    try {
      await api.put(`/api/violations/${id}`, {
        status: "Verified",
        remarks: "Verified by Admin",
      });
      addToast("Violation verified.", "success");
      fetchViolations();
    } catch (err) {
      addToast("Verification failed.", "error");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this violation?")) return;
    try {
      await api.delete(`/api/violations/${id}`);
      addToast("Violation deleted.", "success");
      fetchViolations();
    } catch (err) {
      addToast("Failed to delete.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Violation Management">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Violation Management">
      <div className="space-y-10 animate-fade-in pb-20 h-full flex flex-col">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Violation Management.
            </h3>
            <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 tracking-[0.4em] italic">
              Verify, edit, or delete violation records
            </p>
          </div>
          <div className="bg-primary-950 text-white px-4 py-2 rounded-xl font-black text-[10px] italic">
            TOTAL: {allViolations.length}
          </div>
        </div>
        <div className="bg-white rounded-[56px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-10 py-7">ID</th>
                  <th className="px-10 py-7">Plate No.</th>
                  <th className="px-10 py-7">Violation</th>
                  <th className="px-10 py-7">Status</th>
                  <th className="px-10 py-7 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                {allViolations.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-6 text-neutral-300">
                      #EVT-{v._id.slice(-6)}
                    </td>
                    <td className="px-10 py-6">
                      <span className="bg-neutral-100 px-3 py-1 rounded-xl border border-neutral-200 font-mono text-primary-950 text-xs uppercase">
                        {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-primary-950">
                      {v.violationType}
                    </td>
                    <td className="px-10 py-6">
                      <span
                        className={`px-3 py-1 rounded-full border text-[9px] tracking-widest ${
                          v.status === "Paid"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : v.status === "Verified"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-yellow-50 text-yellow-600 border-yellow-100"
                        }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() =>
                            addToast(`Edit mode for violation: ${v._id}`, "info")
                          }
                          className="p-2 text-primary-900 hover:bg-slate-100 rounded-lg"
                          title="Edit">
                          <Edit3 size={16} />
                        </button>
                        {v.status === "Pending" && (
                          <button
                            onClick={() => handleVerify(v._id)}
                            className="p-2 text-accent-emerald hover:bg-accent-emerald/5 rounded-lg"
                            title="Verify">
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteItem(v._id)}
                          className="p-2 text-accent-crimson hover:bg-accent-crimson/5 rounded-lg"
                          title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allViolations.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-10 py-12 text-center text-neutral-300 italic">
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

export default ViolationManagement;
