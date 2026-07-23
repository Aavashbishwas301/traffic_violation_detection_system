import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Cpu } from "lucide-react";

const ManualEntry = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    vehicleNumber: "",
    violationType: "",
    location: "",
    remarks: "",
  });
  const [manualFile, setManualFile] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data } = await api.get("/api/admin/rules");
        setRules(data || []);
      } catch (err) {
        console.error("Rules fetch failed");
      }
    };
    if (user?.token) fetchRules();
  }, [user]);

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!manualFile) return addToast("Proof image is required.", "warning");

    const formData = new FormData();
    formData.append("evidence", manualFile);
    formData.append("vehicleNumber", manualEntry.vehicleNumber);
    formData.append("violationType", manualEntry.violationType);
    formData.append("location", manualEntry.location);
    formData.append("remarks", manualEntry.remarks);
    formData.append("date", new Date().toISOString());

    setUploading(true);
    addToast("Registering violation...", "info");

    try {
      await api.post("/api/violations/manual", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("Violation registered successfully.", "success");
      setManualEntry({
        vehicleNumber: "",
        violationType: "",
        location: "",
        remarks: "",
      });
      setManualFile(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Registration failed.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="Manual Violation Entry">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
        <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-neutral-100 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-crimson/5 rounded-bl-[100px]"></div>
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Manual Entry.
            </h3>
            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.4em] mt-2 italic border-l-4 border-accent-crimson pl-6">
              Record a traffic violation manually with evidence.
            </p>
          </div>
          <form
            onSubmit={handleManualEntry}
            className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                  Vehicle Plate
                </label>
                <input
                  type="text"
                  placeholder="BA 1 PA 1234"
                  value={manualEntry.vehicleNumber}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      vehicleNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                  Violation Type
                </label>
                <select
                  value={manualEntry.violationType}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      violationType: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
                  required>
                  <option value="">Select Type</option>
                  {rules.map((r) => (
                    <option key={r._id} value={r.violationType}>
                      {r.violationType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                  Location
                </label>
                <input
                  type="text"
                  value={manualEntry.location}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      location: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
                  required
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                  Remarks
                </label>
                <textarea
                  rows={4}
                  value={manualEntry.remarks}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      remarks: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
                  placeholder="Incident details..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                  Upload Proof
                </label>
                <input
                  type="file"
                  onChange={(e) => setManualFile(e.target.files[0])}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none file:bg-primary-950 file:text-white file:border-none file:rounded-lg file:px-4 file:py-2 file:mr-4 file:cursor-pointer"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="md:col-span-2 py-6 bg-primary-950 text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-black transition-all">
              {uploading ? (
                <Cpu className="animate-spin" />
              ) : (
                "Register Violation"
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ManualEntry;
