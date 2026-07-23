import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";

const CitizenComplaints = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get("/api/admin/complaints");
      setComplaints(data || []);
    } catch (err) {
      console.error("Complaints fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchComplaints();
  }, [user]);

  const updateComplaint = async (id, status, responseText) => {
    try {
      await api.put(`/api/admin/complaints/${id}`, {
        status,
        adminResponse: responseText,
      });
      addToast("Complaint updated.", "success");
      fetchComplaints();
    } catch (err) {
      addToast("Update failed.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Citizen Complaints">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Citizen Complaints">
      <div className="space-y-10 animate-fade-in pb-20 h-full flex flex-col">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Citizen Complaints.
            </h3>
            <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 tracking-[0.4em] italic">
              Review and respond to violation disputes
            </p>
          </div>
          <div className="bg-primary-950 text-white px-4 py-2 rounded-xl font-black text-[10px] italic">
            TOTAL: {complaints.length}
          </div>
        </div>
        <div className="bg-white rounded-[56px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-10 py-7">Owner</th>
                  <th className="px-10 py-7">Vehicle</th>
                  <th className="px-10 py-7">Message</th>
                  <th className="px-10 py-7">Status</th>
                  <th className="px-10 py-7 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6 text-primary-950">
                      {c.ownerId?.fullName}
                    </td>
                    <td className="px-10 py-6 font-mono text-xs">
                      {c.violationId?.vehicleId?.vehicleNumber}
                    </td>
                    <td className="px-10 py-6 text-neutral-400 max-w-xs truncate">
                      {c.complaintMessage}
                    </td>
                    <td className="px-10 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] ${
                          c.status === "Resolved"
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {c.status === "Pending" && (
                        <button
                          onClick={() => {
                            const resp = prompt("Enter resolution message:");
                            if (resp) updateComplaint(c._id, "Resolved", resp);
                          }}
                          className="bg-primary-950 text-white px-4 py-1.5 rounded-lg text-[10px] font-black">
                          RESOLVE
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-10 py-12 text-center text-neutral-300 italic">
                      No complaints found.
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

export default CitizenComplaints;
