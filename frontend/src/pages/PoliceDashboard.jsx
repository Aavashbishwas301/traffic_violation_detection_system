import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import api from "../utils/axios.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  Camera,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Upload,
  Activity,
  History,
  Settings,
  Info,
  ChevronRight,
  ArrowRight,
  Eye,
  Trash2,
  MapPin,
  Cpu,
  Database,
  Zap,
  BarChart3,
  Image,
  BadgeCheck,
  Edit3,
  Receipt,
  Bell,
  Megaphone,
  XCircle,
  ShieldCheck,
} from "lucide-react";

const PoliceDashboard = () => {
  const [violations, setViolations] = useState([]);
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Manual Entry State
  const [manualEntry, setManualEntry] = useState({
    vehicleNumber: "",
    violationType: "",
    location: "",
    remarks: "",
  });
  const [manualFile, setManualFile] = useState(null);

  // Detection State
  const [detectFile, setDetectFile] = useState(null);
  const [detectMeta, setDetectMeta] = useState({ location: "Central Point" });

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [vRes, sRes, rRes, pRes] = await Promise.all([
        api.get("/api/violations"),
        api.get("/api/admin/stats"),
        api.get("/api/admin/rules"),
        api.get("/api/users/profile"),
      ]);
      // Handle both old array format and new paginated format
      setViolations(
        Array.isArray(vRes.data) ? vRes.data : vRes.data.violations || [],
      );
      setStats(sRes.data);
      setRules(rRes.data || []);
      setProfile(pRes.data);
    } catch (err) {
      console.error("Data sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchData();
  }, [user, location.pathname]);

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

  const handleAIDetect = async (e) => {
    e.preventDefault();
    if (!detectFile) return addToast("Please select a photo/video.", "warning");
    setUploading(true);
    const formData = new FormData();
    formData.append("evidence", detectFile);
    formData.append("location", detectMeta.location);

    try {
      await api.post("/api/violations/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("AI Scan complete. Results added to records.", "success");
      setDetectFile(null);
      fetchData();
    } catch (err) {
      addToast("Scan failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!manualFile)
      return addToast(
        "Evidence image is required for manual entry.",
        "warning",
      );
    setUploading(true);
    const formData = new FormData();
    formData.append("evidence", manualFile);
    formData.append("vehicleNumber", manualEntry.vehicleNumber);
    formData.append("violationType", manualEntry.violationType);
    formData.append("location", manualEntry.location);
    formData.append("remarks", manualEntry.remarks);

    try {
      await api.post("/api/violations/manual", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("Violation recorded manually.", "success");
      setManualEntry({
        vehicleNumber: "",
        violationType: "",
        location: "",
        remarks: "",
      });
      setManualFile(null);
      fetchData();
    } catch (err) {
      addToast("Manual entry failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (id, status, remarks) => {
    try {
      await api.put(`/api/violations/${id}`, { status, remarks });
      fetchData();
    } catch (err) {
      addToast("Status update failed.", "error");
    }
  };

  const deleteViolation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await api.delete(`/api/violations/${id}`);
      fetchData();
    } catch (err) {
      addToast("Deletion failed.", "error");
    }
  };

  const viewEvidence = (path) => {
    if (!path) return addToast("No evidence found.", "warning");
    window.open(
      `${api.defaults.baseURL}/${path.replace(/\\/g, "/")}`,
      "_blank",
    );
  };

  if (loading)
    return (
      <Layout title="Loading Profile">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Cpu className="text-primary-950 animate-spin" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
            Synchronizing Data...
          </p>
        </div>
      </Layout>
    );

  const renderView = () => {
    switch (location.pathname) {
      case "/detect":
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-neutral-100 space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-950/5 rounded-bl-[100px]"></div>
              <div>
                <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                  AI Scan.
                </h3>
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.4em] mt-2 italic border-l-4 border-accent-crimson pl-6">
                  Upload CCTV footage or images for automated violation
                  detection.
                </p>
              </div>

              <form onSubmit={handleAIDetect} className="space-y-8">
                <div className="border-4 border-dashed border-neutral-100 rounded-[40px] p-12 text-center hover:border-primary-900/20 transition-all group cursor-pointer relative">
                  <input
                    type="file"
                    onChange={(e) => setDetectFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="text-primary-900" size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-black italic text-primary-950 uppercase">
                        {detectFile
                          ? detectFile.name
                          : "Click to Upload CCTV/Photo"}
                      </p>
                      <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest mt-1 italic">
                        JPG, PNG, MP4 • MAX 100MB
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                    Detection Location
                  </label>
                  <input
                    type="text"
                    value={detectMeta.location}
                    onChange={(e) =>
                      setDetectMeta({ ...detectMeta, location: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-6 bg-primary-950 text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-black transition-all flex items-center justify-center space-x-4">
                  {uploading ? (
                    <Cpu className="animate-spin" />
                  ) : (
                    <>
                      <Zap size={18} /> <span>Initiate AI Engine</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        );

      case "/manual-entry":
        return (
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
                          vehicleNumber: e.target.value,
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
        );

      case "/manage":
        return (
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
                            className={`px-2 py-0.5 rounded-lg border text-[9px] ${v.status === "Verified" ? "bg-green-50 text-green-600 border-green-100" : "bg-yellow-50 text-yellow-600 border-yellow-100"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {v.status === "Pending" && (
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
                            )}
                            {v.status === "Pending" && (
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "/search":
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            <div className="bg-primary-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-crimson/10 rounded-full blur-[80px]"></div>
              <div className="relative z-10 space-y-8">
                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none underline decoration-accent-crimson underline-offset-8">
                  Vehicle <br /> Verification.
                </h3>
                <form
                  onSubmit={handleSearch}
                  className="relative group max-w-xl">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value.toUpperCase())
                    }
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
                        {searchResult.vehicle.ownerId?.phone || "HIDDEN"}
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
                          {searchResult.violations?.length || 0} EVENTS
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 mb-1">Unpaid Fines</p>
                        <p className="text-accent-crimson font-black">NPR 0</p>
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
        );

      case "/records":
        return (
          <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                  Violation Records.
                </h3>
                <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">
                  Historical database of all traffic offenses recorded.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    const filtered = violations.filter(
                      (v) =>
                        new Date(v.violationDateTime)
                          .toISOString()
                          .split("T")[0] === today,
                    );
                    addToast(
                      `Records for today: ${filtered.length} violations found.`,
                      "info",
                    );
                  }}
                  className="px-5 py-2.5 bg-neutral-100 rounded-xl text-[9px] font-black uppercase hover:bg-neutral-200 transition-all">
                  Filter by Date
                </button>
                <button
                  onClick={() => {
                    const csvContent =
                      "data:text/csv;charset=utf-8," +
                      "Date,Vehicle,Offense,Fine,Status\n" +
                      violations
                        .map(
                          (v) =>
                            `${new Date(v.violationDateTime).toLocaleDateString()},${v.vehicleId?.vehicleNumber || "UNKNOWN"},${v.violationType},NPR ${v.fine?.amount || v.ruleId?.fineAmount},${v.status}`,
                        )
                        .join("\n");
                    const encoded = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encoded);
                    link.setAttribute(
                      "download",
                      `violations_${new Date().toISOString().split("T")[0]}.csv`,
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-5 py-2.5 bg-primary-950 text-white rounded-xl text-[9px] font-black uppercase hover:bg-black transition-all shadow-lg shadow-primary-950/20">
                  Export CSV
                </button>
              </div>
            </div>
            <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Vehicle</th>
                      <th className="px-6 py-5">Offense</th>
                      <th className="px-6 py-5">Fine</th>
                      <th className="px-6 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                    {violations.map((v) => (
                      <tr
                        key={v._id}
                        className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-neutral-400">
                          {new Date(v.violationDateTime).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-primary-950 font-black tracking-tighter">
                          {v.vehicleId?.vehicleNumber}
                        </td>
                        <td className="px-6 py-4 text-neutral-400">
                          {v.violationType}
                        </td>
                        <td className="px-6 py-4 font-black italic text-primary-950">
                          NPR {v.fine?.amount || v.ruleId?.fineAmount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[8px] ${v.status === "Verified" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                            {v.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "/evidence":
        return (
          <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                  Evidence Vault.
                </h3>
                <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">
                  Legal proof repository for all recorded incidents.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {violations.map((v) => (
                <div
                  key={v._id}
                  className="bg-white border border-neutral-100 rounded-3xl overflow-hidden aspect-square flex flex-col shadow-xl group cursor-pointer relative hover:-translate-y-2 transition-all"
                  onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}>
                  <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
                    {v.imageUrl || v.evidenceUrl ? (
                      <img
                        src={`${api.defaults.baseURL}/${(v.imageUrl || v.evidenceUrl).replace(/\\/g, "/")}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    ) : (
                      <Image size={40} className="text-neutral-200" />
                    )}
                  </div>
                  <div className="p-4 bg-white border-t border-neutral-50 text-left">
                    <p className="text-[9px] font-black uppercase text-primary-950 italic truncate">
                      ID-{v._id.slice(-8)}
                    </p>
                    <p className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest mt-0.5">
                      {v.violationType}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="text-white" size={24} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "/fines":
        return (
          <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                  Fine Records.
                </h3>
                <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">
                  Financial oversight of all penalties issued.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-5">Record</th>
                      <th className="px-6 py-5">Amount</th>
                      <th className="px-6 py-5">Due Date</th>
                      <th className="px-6 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                    {violations.map((v) => (
                      <tr
                        key={v._id}
                        className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-neutral-400">
                          #PAY-{v._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-black italic text-primary-950">
                          NPR {v.fine?.amount || v.ruleId?.fineAmount}
                        </td>
                        <td className="px-6 py-4 text-neutral-400">
                          {v.fine?.dueDate
                            ? new Date(v.fine.dueDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[8px] ${v.status === "Paid" ? "bg-green-50 text-green-600 border-green-100" : "bg-yellow-50 text-yellow-600 border-yellow-100"}`}>
                            {v.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "/reports":
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="border-b-4 border-primary-950 pb-6">
              <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                Traffic Stats.
              </h3>
              <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 italic border-l-4 border-accent-crimson pl-6">
                Simple charts and numbers about traffic violations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-neutral-100 space-y-6">
                <h4 className="text-xl font-black italic uppercase text-primary-950">
                  Violation Types
                </h4>
                <div className="space-y-4">
                  {stats?.violationsByType?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-neutral-50 pb-3">
                      <span className="text-neutral-400">{item._id}</span>
                      <span className="text-primary-950">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-primary-900 text-white p-10 rounded-[48px] shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]"></div>
                <h4 className="text-xl font-black italic uppercase">
                  Money Collected
                </h4>
                <div className="space-y-2 text-left">
                  <p className="text-5xl font-black italic tracking-tighter leading-none text-white">
                    NPR {stats?.summary?.totalRevenue?.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Total value of all paid fines
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "/notifications":
        const policeNotifications =
          notifications && notifications.length > 0 ? notifications : [];
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="border-b-4 border-primary-950 pb-6">
              <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                Officer Alerts.
              </h3>
              <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 italic border-l-4 border-accent-crimson pl-6">
                System-wide notifications and grid status updates
              </p>
            </div>
            <div className="space-y-6">
              {policeNotifications.length > 0 ? (
                policeNotifications.map((n) => (
                  <div
                    key={n._id}
                    className="p-10 bg-white rounded-[48px] shadow-2xl border border-neutral-100 flex items-start space-x-8 group hover:bg-slate-50 transition-all">
                    <div className="w-16 h-16 bg-accent-crimson text-white rounded-3xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                      <Megaphone size={28} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black italic uppercase text-primary-950">
                        {n.title}
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest italic">
                        {new Date(n.createdAt).toLocaleDateString()} at{" "}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm font-black italic text-neutral-400 uppercase leading-relaxed max-w-xl">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-12 rounded-[48px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
                  No notifications found.
                </div>
              )}
            </div>
          </div>
        );

      case "/settings":
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-8 border-l-8 border-primary-950">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary-900 rounded-[24px] flex items-center justify-center text-white font-black text-4xl italic border-4 border-white shadow-2xl">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">
                    {user?.name}
                  </h4>
                  <p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">
                    {profile?.badgeNumber || "OFFICER"} —{" "}
                    {profile?.rank || "ACTIVE"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">
                    Station
                  </p>
                  <p className="text-sm font-black italic text-primary-950 uppercase">
                    {profile?.station || "Metropolitan Traffic Police Division"}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">
                    Designation
                  </p>
                  <p className="text-sm font-black italic text-primary-950 uppercase">
                    {profile?.designation || "Field Officer"}
                  </p>
                </div>
                <button
                  onClick={() => addToast("Password update requested.", "info")}
                  className="w-full py-5 bg-primary-950 text-white rounded-2xl uppercase font-black text-xs tracking-[0.5em] shadow-2xl">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        );

      case "/dashboard":
      default:
        return (
          <div className="space-y-12 animate-fade-in pb-20">
            {/* --- COMMAND BANNER --- */}
            <div className="bg-primary-950 rounded-[64px] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-b-[16px] border-accent-crimson group transition-all duration-1000">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                <div className="space-y-10">
                  <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-crimson shadow-[0_0_15px_#dc143c] animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-white/80">
                      Duty Station: Grid North
                    </span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">
                      {user?.name.split(" ")[0]} <br />
                      <span className="text-accent-crimson font-black tracking-[-0.1em]">
                        Officer.
                      </span>
                    </h2>
                    <p className="text-white/30 font-bold uppercase text-[11px] tracking-[0.6em] italic border-l-4 border-accent-crimson pl-8 max-w-md">
                      Central Enforcement Hub. <br />
                      Record incidents and scan grid footage.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl p-14 rounded-[56px] border border-white/10 flex flex-col items-center justify-center space-y-4 min-w-[280px] shadow-inner group-hover:bg-white/10 transition-all duration-700 cursor-crosshair">
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic">
                    Pending Review
                  </p>
                  <p className="text-9xl font-black italic tracking-tighter text-white leading-none group-hover:scale-110 transition-transform duration-700">
                    {violations.filter((v) => v.status === "Pending").length}
                  </p>
                  <button
                    onClick={() => navigate("/manage")}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    Go to Desk
                  </button>
                </div>
              </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  label: "Today Catch",
                  value: violations.filter(
                    (v) =>
                      new Date(v.createdAt).toDateString() ===
                      new Date().toDateString(),
                  ).length,
                  icon: Camera,
                  color: "text-primary-950",
                  bg: "bg-primary-950/5",
                  border: "border-primary-950/10",
                },
                {
                  label: "Manual Entry",
                  value: violations.filter((v) => !v.aiDetected).length,
                  icon: Edit3,
                  color: "text-yellow-600",
                  bg: "bg-yellow-500/5",
                  border: "border-yellow-500/20",
                },
                {
                  label: "Fines Issued",
                  value: `NPR ${stats?.summary?.totalRevenue?.toLocaleString() || 0}`,
                  icon: Receipt,
                  color: "text-green-600",
                  bg: "bg-green-500/5",
                  border: "border-green-500/20",
                },
                {
                  label: "Active Alerts",
                  value: 2,
                  icon: Bell,
                  color: "text-accent-crimson",
                  bg: "bg-accent-crimson/5",
                  border: "border-accent-crimson/10",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`bg-white p-10 rounded-[56px] shadow-xl border-2 ${s.border} flex flex-col items-center text-center space-y-5 hover:-translate-y-3 transition-all duration-500 relative overflow-hidden group`}>
                  <div
                    className={`w-16 h-16 ${s.bg} rounded-[24px] flex items-center justify-center ${s.color} shadow-inner group-hover:rotate-12 transition-transform`}>
                    <s.icon size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-neutral-300 tracking-[0.2em] italic">
                      {s.label}
                    </p>
                    <p
                      className={`text-3xl font-black italic tracking-tighter ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* --- ACTION NODES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between border-b-2 border-neutral-50 pb-6">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary-950 underline decoration-accent-crimson decoration-4 underline-offset-8">
                    Quick Actions.
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div
                    onClick={() => navigate("/detect")}
                    className="p-10 bg-white border border-neutral-100 rounded-[48px] shadow-2xl space-y-6 group cursor-pointer hover:bg-primary-950 transition-all duration-500">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-900 group-hover:bg-white/10 group-hover:text-white transition-all">
                      <Camera size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic uppercase text-primary-950 group-hover:text-white">
                        AI Detection.
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-300 group-hover:text-white/40 uppercase tracking-widest mt-2 italic leading-relaxed">
                        Scan footage for auto-detecting rules.
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => navigate("/manual-entry")}
                    className="p-10 bg-white border border-neutral-100 rounded-[48px] shadow-2xl space-y-6 group cursor-pointer hover:bg-accent-crimson transition-all duration-500">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-900 group-hover:bg-white/10 group-hover:text-white transition-all">
                      <Edit3 size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic uppercase text-primary-950 group-hover:text-white">
                        Manual Entry.
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-300 group-hover:text-white/40 uppercase tracking-widest mt-2 italic leading-relaxed">
                        Input violation details manually.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900 p-12 rounded-[64px] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]"></div>
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner">
                    <Activity size={28} />
                  </div>
                  <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-tight underline decoration-white/20 underline-offset-8">
                    Duty <br /> Log.
                  </h4>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">
                    All actions are recorded for legal verification. Ensure
                    evidence is linked.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/records")}
                  className="w-full py-6 bg-white text-primary-900 rounded-[28px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-neutral-50 transition-all mt-10">
                  Historical Data
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles = {
      "/dashboard": "Duty Station",
      "/detect": "AI Detection Console",
      "/manual-entry": "Manual Violation Entry",
      "/manage": "Verification Desk",
      "/search": "Vehicle & License Check",
      "/evidence": "Evidence Management",
      "/records": "Violation Records",
      "/fines": "Fine Management",
      "/reports": "Traffic Stats",
      "/notifications": "Officer Alerts",
      "/settings": "My Profile",
    };
    return titles[location.pathname] || "Officer Hub";
  };

  return <Layout title={getPageTitle()}>{renderView()}</Layout>;
};

export default PoliceDashboard;
