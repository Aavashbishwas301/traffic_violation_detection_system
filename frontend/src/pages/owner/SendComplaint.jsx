import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";

const SendComplaint = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaintForm, setComplaintForm] = useState({
    violationId: "",
    message: "",
  });

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

  const handleAppeal = async (e) => {
    e.preventDefault();
    if (!complaintForm.violationId || !complaintForm.message) {
      return addToast("Select violation and enter details.", "warning");
    }
    try {
      await api.post("/api/admin/complaints", {
        violationId: complaintForm.violationId,
        complaintMessage: complaintForm.message,
      });
      addToast("Complaint sent successfully.", "success");
      setComplaintForm({ violationId: "", message: "" });
    } catch (err) {
      addToast("Submission failed. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Send Complaint">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Send Complaint">
      <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
            Send Complaint.
          </h3>
          <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.4em] italic">
            Complain about a violation record if you think it is wrong
          </p>
        </div>
        <form
          onSubmit={handleAppeal}
          className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-2xs font-black uppercase tracking-widest text-neutral-400 italic">
              Select Violation
            </label>
            <select
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
              value={complaintForm.violationId}
              onChange={(e) =>
                setComplaintForm({
                  ...complaintForm,
                  violationId: e.target.value,
                })
              }>
              <option value="">Choose from list</option>
              {violations.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.violationType} - {v.vehicleId?.vehicleNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-2xs font-black uppercase tracking-widest text-neutral-400 italic">
              Complaint Details
            </label>
            <textarea
              required
              rows={5}
              placeholder="Type your message here..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
              value={complaintForm.message}
              onChange={(e) =>
                setComplaintForm({
                  ...complaintForm,
                  message: e.target.value,
                })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full py-6 bg-primary-950 text-white rounded-[28px] font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-black transition-all">
            Send Complaint
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default SendComplaint;
