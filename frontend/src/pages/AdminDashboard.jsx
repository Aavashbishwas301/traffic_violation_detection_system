import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import {
  Users,
  Car,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Trash2,
  Edit3,
  BarChart3,
  Database,
  History,
  Activity,
  Bell,
  Settings,
  ChevronRight,
  Eye,
  MoreHorizontal,
  ArrowRight,
  Download,
  Receipt,
  Zap,
  Image as ImageIcon,
  MapPin,
  Globe,
  CreditCard,
  UserPlus,
  Info,
  Terminal,
  Cpu,
  Camera,
  ShieldCheck,
  FileText,
  Megaphone,
  Lock,
  Activity as ActivityIcon,
  RefreshCw,
  Clock,
  User,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [rules, setRules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [unregisteredVehicles, setUnregisteredVehicles] = useState([]);
  const [broadcast, setBroadcast] = useState({ title: "", message: "" });
  const [officerForm, setOfficerForm] = useState({
    fullName: "",
    email: "",
    password: "",
    badgeNumber: "",
    role: "TrafficPolice",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleOfficerSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/admin/officers/${editingId}`,
          officerForm,
          config,
        );
        alert("Officer updated.");
      } else {
        await axios.post(
          "http://localhost:5000/api/users",
          officerForm,
          config,
        );
        alert("Officer registered.");
      }
      setShowModal(false);
      setOfficerForm({
        fullName: "",
        email: "",
        password: "",
        badgeNumber: "",
        role: "TrafficPolice",
      });
      setEditingId(null);
      fetchGlobalData();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
    }
  };

  const fetchGlobalData = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [sRes, uRes, vRes, vhRes, rRes, nRes, repRes, cRes] =
        await Promise.all([
          axios.get("http://localhost:5000/api/admin/stats", config),
          axios.get("http://localhost:5000/api/admin/users", config),
          axios.get("http://localhost:5000/api/violations", config),
          axios.get("http://localhost:5000/api/admin/vehicles", config),
          axios.get("http://localhost:5000/api/admin/rules", config),
          axios.get("http://localhost:5000/api/admin/notifications", config),
          axios.get("http://localhost:5000/api/admin/report", config),
          axios.get("http://localhost:5000/api/admin/complaints", config),
        ]);
      setStats(sRes.data);
      setUsers(uRes.data || []);
      setAllViolations(vRes.data || []);
      setVehicles(vhRes.data || []);
      setRules(rRes.data || []);
      setNotifications(nRes.data || []);
      setReport(repRes.data);
      setComplaints(cRes.data || []);
      setError("");
    } catch (err) {
      setError("Connection Failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [user, location.pathname]);

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message)
      return alert("Fill all fields.");
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(
        "http://localhost:5000/api/admin/broadcast",
        broadcast,
        config,
      );
      alert("Broadcast sent to all users.");
      setBroadcast({ title: "", message: "" });
    } catch (err) {
      alert("Broadcast failed.");
    }
  };

  const updateComplaint = async (id, status, responseText) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(
        `http://localhost:5000/api/admin/complaints/${id}`,
        { status, adminResponse: responseText },
        config,
      );
      alert("Complaint updated.");
      fetchGlobalData();
    } catch (err) {
      alert("Update failed.");
    }
  };

  const deleteItem = async (type, id, extra = "") => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      let url = `http://localhost:5000/api/admin/${type}s/${id}`;
      if (type === "user") url += `?role=${extra}`;
      if (type === "violation")
        url = `http://localhost:5000/api/violations/${id}`;
      await axios.delete(url, config);
      fetchGlobalData();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (loading)
    return (
      <Layout title="Loading Dashboard">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Cpu className="text-primary-950 animate-spin" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
            Connecting...
          </p>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout title="System Error">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
          <AlertTriangle
            className="text-accent-crimson animate-bounce"
            size={64}
          />
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase italic text-primary-950">
              Connection Failure
            </h3>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest max-w-md">
              {error}
            </p>
          </div>
          <button
            onClick={fetchGlobalData}
            className="px-10 py-4 bg-primary-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-black transition-all">
            Retry Handshake
          </button>
        </div>
      </Layout>
    );

  const getPageTitle = () => {
    const titles = {
      "/dashboard": "System Overview",
      "/officers": "Manage Police Officers",
      "/vehicle-mgmt": "Vehicle Registry",
      "/violation-mgmt": "Violation Management",
      "/fines-mgmt": "Fine Management",
      "/financial-rules": "Traffic Rules",
      "/complaints-mgmt": "Citizen Complaints",
      "/global-reports": "Reports & Analytics",
      "/notifications-mgmt": "System Notifications",
      "/settings": "Profile Management",
    };
    return titles[location.pathname] || "Admin Dashboard";
  };

  const renderContent = () => {
    switch (location.pathname) {
      case "/officers":
        return (
          <div className="space-y-10 animate-fade-in pb-20 h-full flex flex-col relative">
            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-primary-950/20">
                <div className="bg-white rounded-[48px] p-12 shadow-2xl max-w-xl w-full border border-neutral-100 space-y-10 animate-slide-up">
                  <div>
                    <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                      {editingId ? "Update" : "Register"} Officer.
                    </h3>
                    <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 italic border-l-4 border-accent-crimson pl-6">
                      Initialize security credentials for the grid.
                    </p>
                  </div>
                  <form onSubmit={handleOfficerSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
                        value={officerForm.fullName}
                        onChange={(e) =>
                          setOfficerForm({
                            ...officerForm,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 italic lowercase"
                        value={officerForm.email}
                        onChange={(e) =>
                          setOfficerForm({
                            ...officerForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      {!editingId && (
                        <input
                          type="password"
                          placeholder="Access Password"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 italic uppercase"
                          value={officerForm.password}
                          onChange={(e) =>
                            setOfficerForm({
                              ...officerForm,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Badge Number"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 italic uppercase"
                        value={officerForm.badgeNumber}
                        onChange={(e) =>
                          setOfficerForm({
                            ...officerForm,
                            badgeNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-neutral-400 hover:bg-slate-50 transition-all">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] py-5 bg-primary-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all">
                        Save Identity
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
              <div>
                <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                  Police Officers.
                </h3>
                <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 italic">
                  Add, update, or deactivate officer accounts
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingId(null);
                  setOfficerForm({
                    fullName: "",
                    email: "",
                    password: "",
                    badgeNumber: "",
                    role: "TrafficPolice",
                  });
                  setShowModal(true);
                }}
                className="bg-primary-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center space-x-2 shadow-2xl hover:bg-black transition-all">
                <UserPlus size={16} /> <span>Add Officer</span>
              </button>
            </div>
            <div className="bg-white rounded-[56px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50/50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-10 py-7">Name</th>
                      <th className="px-10 py-7">Badge No.</th>
                      <th className="px-10 py-7">Email</th>
                      <th className="px-10 py-7">Status</th>
                      <th className="px-10 py-7 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-xs font-black uppercase italic">
                    {users
                      .filter((u) => u.role === "TrafficPolice")
                      .map((u) => (
                        <tr
                          key={u._id}
                          className="hover:bg-slate-50 transition-all">
                          <td className="px-10 py-6 font-black text-primary-950">
                            {u.fullName}
                          </td>
                          <td className="px-10 py-6 text-neutral-400">
                            {u.badgeNumber || "PENDING"}
                          </td>
                          <td className="px-10 py-6 text-neutral-400 lowercase italic">
                            {u.email}
                          </td>
                          <td className="px-10 py-6">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black border bg-green-50 text-green-600 border-green-100">
                              ACTIVE
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingId(u._id);
                                  setOfficerForm({
                                    fullName: u.fullName,
                                    email: u.email,
                                    badgeNumber: u.badgeNumber || "",
                                    role: "TrafficPolice",
                                  });
                                  setShowModal(true);
                                }}
                                className="p-2 text-primary-900 hover:bg-slate-100 rounded-lg">
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  deleteItem("user", u._id, u.role)
                                }
                                className="p-2 text-accent-crimson hover:bg-accent-crimson/5 rounded-lg">
                                <Trash2 size={16} />
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

      case "/vehicle-mgmt":
        return (
          <div className="space-y-10 animate-fade-in pb-20">
            <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
              <div>
                <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase">
                  Vehicle Registry.
                </h3>
                <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 italic">
                  Search and view all registered vehicles
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Plate..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value.toUpperCase())
                    }
                    className="bg-neutral-50 border-2 border-neutral-100 rounded-xl px-5 py-2 pl-12 text-xs font-black uppercase italic outline-none focus:border-primary-950"
                  />
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300"
                    size={16}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="bg-white border border-neutral-100 rounded-[48px] p-10 shadow-2xl relative group">
                  <div className="space-y-6">
                    <span className="bg-neutral-900 text-white px-5 py-2 rounded-2xl font-black italic text-sm uppercase shadow-lg inline-block">
                      {v.vehicleNumber}
                    </span>
                    <div>
                      <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">
                        Owner
                      </p>
                      <p className="text-xl font-black italic text-primary-950 uppercase">
                        {v.ownerId?.fullName || "UNKNOWN"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-50 pt-4 text-[10px] font-bold uppercase italic text-neutral-400">
                      <div>
                        <p>Brand</p>
                        <p className="text-primary-950 text-xs font-black">
                          {v.brand}
                        </p>
                      </div>
                      <div>
                        <p>Status</p>
                        <p className="text-accent-emerald text-xs font-black">
                          VERIFIED
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "/violation-mgmt":
        return (
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
                            className={`px-3 py-1 rounded-full border text-[9px] tracking-widest ${v.status === "Paid" ? "bg-green-50 text-green-600 border-green-100" : "bg-yellow-50 text-yellow-600 border-yellow-100"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => alert(`Edit violation: ${v._id}`)}
                              className="p-2 text-primary-900 hover:bg-slate-100 rounded-lg"
                              title="Edit">
                              <Edit3 size={16} />
                            </button>
                            {v.status === "Pending" && (
                              <button
                                onClick={() => {
                                  const config = {
                                    headers: {
                                      Authorization: `Bearer ${user?.token}`,
                                    },
                                  };
                                  axios
                                    .put(
                                      `http://localhost:5000/api/violations/${v._id}`,
                                      {
                                        status: "Verified",
                                        remarks: "Verified by Admin",
                                      },
                                      config,
                                    )
                                    .then(() => {
                                      alert("Violation verified.");
                                      fetchGlobalData();
                                    })
                                    .catch(() => alert("Verification failed."));
                                }}
                                className="p-2 text-accent-emerald hover:bg-accent-emerald/5 rounded-lg"
                                title="Verify">
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteItem("violation", v._id)}
                              className="p-2 text-accent-crimson hover:bg-accent-crimson/5 rounded-lg"
                              title="Delete">
                              <Trash2 size={16} />
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

      case "/fines-mgmt":
        return (
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
                OUTSTANDING: NPR{" "}
                {stats?.summary?.totalLiability?.toLocaleString() || 0}
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
                          {v.vehicleId?.vehicleNumber}
                        </td>
                        <td className="px-10 py-6 font-black text-primary-950 text-sm">
                          NPR {v.fine?.amount || v.ruleId?.fineAmount}
                        </td>
                        <td className="px-10 py-6">
                          <span
                            className={`px-3 py-1 rounded-full border text-[9px] ${v.status === "Paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                            {v.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button
                            onClick={() => {
                              const newStatus =
                                v.status === "Paid" ? "Pending" : "Paid";
                              const config = {
                                headers: {
                                  Authorization: `Bearer ${user?.token}`,
                                },
                              };
                              axios
                                .put(
                                  `http://localhost:5000/api/violations/${v._id}`,
                                  {
                                    status: newStatus,
                                    remarks: `Status changed to ${newStatus} by Admin`,
                                  },
                                  config,
                                )
                                .then(() => {
                                  alert(`Status updated to ${newStatus}`);
                                  fetchGlobalData();
                                })
                                .catch(() => alert("Status update failed."));
                            }}
                            className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-black transition-all">
                            CHANGE STATUS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "/financial-rules":
        return (
          <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="flex justify-between items-end border-b-4 border-primary-950 pb-6">
              <div>
                <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                  Traffic Rules.
                </h3>
                <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 italic border-l-4 border-accent-crimson pl-6">
                  Add or update violation types and fine amounts.
                </p>
              </div>
              <button
                onClick={() => {
                  const type = prompt("Enter violation type name:");
                  if (!type) return;
                  const amount = prompt("Enter fine amount (NPR):");
                  if (!amount) return;
                  const desc = prompt("Enter description (optional):");
                  const config = {
                    headers: { Authorization: `Bearer ${user?.token}` },
                  };
                  axios
                    .post(
                      "http://localhost:5000/api/admin/rules",
                      {
                        violationType: type,
                        fineAmount: Number(amount),
                        description: desc || "",
                        isActive: true,
                      },
                      config,
                    )
                    .then(() => {
                      alert("Rule added.");
                      fetchGlobalData();
                    })
                    .catch(() => alert("Failed to add rule."));
                }}
                className="bg-primary-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center space-x-2 shadow-2xl hover:bg-black transition-all">
                <Plus size={16} /> <span>Add New Rule</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rules.map((r) => (
                <div
                  key={r._id}
                  className="bg-white border border-neutral-100 rounded-[48px] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
                  <div
                    className={`absolute top-0 left-0 w-2 h-full ${r.isActive ? "bg-accent-emerald" : "bg-neutral-200"}`}></div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-primary-950 underline decoration-accent-crimson/20 underline-offset-8">
                      {r.violationType}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black border ${r.isActive ? "bg-green-50 text-green-600" : "bg-neutral-50 text-neutral-400"}`}>
                      {r.isActive ? "ACTIVE" : "OFF"}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase italic leading-relaxed">
                    {r.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                        Fine Amount
                      </p>
                      <p className="text-3xl font-black italic text-primary-950">
                        NPR {r.fineAmount}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const amount = prompt(
                          `Current fine: NPR ${r.fineAmount}. Enter new amount:`,
                        );
                        if (!amount) return;
                        const config = {
                          headers: { Authorization: `Bearer ${user?.token}` },
                        };
                        axios
                          .post(
                            "http://localhost:5000/api/admin/rules",
                            {
                              violationType: r.violationType,
                              fineAmount: Number(amount),
                              description: r.description,
                              isActive: r.isActive,
                            },
                            config,
                          )
                          .then(() => {
                            alert("Rule updated.");
                            fetchGlobalData();
                          })
                          .catch(() => alert("Failed to update rule."));
                      }}
                      className="p-4 bg-primary-950 text-white rounded-[24px] shadow-xl hover:rotate-12 transition-transform">
                      <Edit3 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "/complaints-mgmt":
        return (
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
                      <tr
                        key={c._id}
                        className="hover:bg-slate-50 transition-colors">
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
                            className={`px-3 py-1 rounded-full text-[9px] ${c.status === "Resolved" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button
                            onClick={() => {
                              const resp = prompt("Enter resolution message:");
                              if (resp)
                                updateComplaint(c._id, "Resolved", resp);
                            }}
                            className="bg-primary-950 text-white px-4 py-1.5 rounded-lg text-[10px] font-black">
                            RESOLVE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "/global-reports":
        return (
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
                  onClick={() => {
                    const content =
                      "Violation Trends Report\n\n" +
                      (stats?.violationsByType
                        ?.map((t) => `${t._id}: ${t.count}`)
                        .join("\n") || "No data");
                    const blob = new Blob([content], { type: "text/plain" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `violation_trends_${new Date().toISOString().split("T")[0]}.txt`;
                    link.click();
                  }}
                  className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                  Download PDF
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
                  onClick={() => {
                    const content = `Fine Collection Report\n\nTotal Revenue: NPR ${stats?.summary?.totalRevenue?.toLocaleString() || 0}\nOutstanding: NPR ${stats?.summary?.totalLiability?.toLocaleString() || 0}\nPaid Fines Count: ${allViolations.filter((v) => v.status === "Paid").length}`;
                    const blob = new Blob([content], { type: "text/plain" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `fine_collection_${new Date().toISOString().split("T")[0]}.txt`;
                    link.click();
                  }}
                  className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                  Download PDF
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
        );

      case "/notifications-mgmt":
        return (
          <div className="max-w-2xl mx-auto space-y-12 animate-fade-in pb-20 text-center">
            <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none underline decoration-accent-crimson decoration-8 underline-offset-8">
              Send Alerts.
            </h3>
            <p className="text-[10px] font-black text-neutral-300 uppercase mt-8 tracking-[0.4em] italic">
              Send important announcements to everyone in the system
            </p>
            <form
              onSubmit={sendBroadcast}
              className="bg-white rounded-[56px] p-12 shadow-2xl border border-neutral-100 space-y-10 text-left mt-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4 italic">
                  Message Title
                </label>
                <input
                  type="text"
                  placeholder="Example: System Update"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
                  value={broadcast.title}
                  onChange={(e) =>
                    setBroadcast({ ...broadcast, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4 italic">
                  Message Content
                </label>
                <textarea
                  rows={5}
                  placeholder="Type your message here..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
                  value={broadcast.message}
                  onChange={(e) =>
                    setBroadcast({ ...broadcast, message: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-7 bg-primary-950 text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-[10px] shadow-2xl hover:bg-black transition-all flex items-center justify-center space-x-4">
                <Megaphone size={20} /> <span>Send Announcement</span>
              </button>
            </form>
          </div>
        );

      case "/settings":
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-8 border-l-8 border-primary-950">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary-900 rounded-[24px] flex items-center justify-center text-white font-black text-4xl italic shadow-2xl">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">
                    {user?.name}
                  </h4>
                  <p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">
                    Master Admin
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">
                    Access Type
                  </p>
                  <p className="text-sm font-black italic text-primary-950 uppercase">
                    Full System Control
                  </p>
                </div>
                <button
                  onClick={() => alert("Password update requested.")}
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
            {/* --- WELCOME BANNER --- */}
            <div className="bg-primary-950 rounded-[64px] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-b-[16px] border-accent-crimson group transition-all duration-1000">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                <div className="space-y-10 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_15px_#10b981] animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-white/80">
                      Authorized Command Session
                    </span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">
                      {user?.name?.split(" ")[0] || "Admin"} <br />
                      <span className="text-accent-crimson">Dashboard.</span>
                    </h2>
                    <p className="text-white/30 font-bold uppercase text-[11px] tracking-[0.6em] italic border-l-4 border-accent-crimson pl-8 max-w-md">
                      Manage officers, vehicles, and violation records easily.
                    </p>
                  </div>
                </div>

                <div className="relative group/stats cursor-crosshair">
                  <div className="bg-white/5 backdrop-blur-3xl p-14 rounded-[56px] border border-white/10 flex flex-col items-center justify-center space-y-4 min-w-[300px] shadow-inner">
                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic">
                      Active Officers
                    </p>
                    <p className="text-8xl font-black italic tracking-tighter text-white leading-none group-hover/stats:scale-110 transition-transform duration-700">
                      {users.filter((u) => u.role === "TrafficPolice").length}
                    </p>
                    <div className="flex items-center space-x-3 text-accent-emerald font-black text-[10px] uppercase tracking-widest bg-accent-emerald/10 px-4 py-1.5 rounded-xl border border-accent-emerald/20">
                      <ActivityIcon size={14} /> <span>Status: Normal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  label: "Total Paid Fines",
                  value: `NPR ${stats?.summary?.totalRevenue?.toLocaleString() ?? 0}`,
                  icon: Zap,
                  color: "text-green-600",
                  bg: "bg-green-500/5",
                  border: "border-green-500/20",
                },
                {
                  label: "Total Violations",
                  value: stats?.summary?.totalViolations ?? 0,
                  icon: Activity,
                  color: "text-primary-950",
                  bg: "bg-primary-900/5",
                  border: "border-primary-900/10",
                },
                {
                  label: "Outstanding Fines",
                  value: stats?.summary?.totalLiability?.toLocaleString() ?? 0,
                  icon: Clock,
                  color: "text-yellow-600",
                  bg: "bg-yellow-500/5",
                  border: "border-yellow-500/20",
                },
                {
                  label: "Total Vehicles",
                  value: stats?.summary?.totalVehicles ?? 0,
                  icon: Car,
                  color: "text-blue-600",
                  bg: "bg-blue-500/5",
                  border: "border-blue-500/20",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`bg-white p-12 rounded-[56px] shadow-xl border-2 ${s.border} flex flex-col items-center text-center space-y-6 hover:-translate-y-4 transition-all duration-700 relative overflow-hidden group`}>
                  <div
                    className={`w-20 h-20 ${s.bg} rounded-[28px] flex items-center justify-center ${s.color} shadow-inner group-hover:rotate-12 transition-transform duration-700`}>
                    <s.icon size={36} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase text-neutral-300 tracking-[0.3em] italic">
                      {s.label}
                    </p>
                    <p
                      className={`text-4xl font-black italic tracking-tighter ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* --- RECENT ACTIVITY --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <div className="flex items-center justify-between border-b-2 border-neutral-50 pb-6">
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary-950 underline decoration-accent-crimson decoration-4 underline-offset-8">
                      Recent History.
                    </h3>
                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-6 italic leading-none">
                      Last few events caught by traffic cameras
                    </p>
                  </div>
                  <Link
                    to="/violation-mgmt"
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-900 hover:text-accent-crimson transition-all flex items-center space-x-3 bg-white px-5 py-2.5 rounded-full border border-neutral-100 shadow-sm">
                    <span>View All</span> <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="bg-white rounded-[64px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-neutral-100 overflow-hidden flex flex-col max-h-[500px]">
                  <div className="overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-neutral-50 text-xs font-black uppercase italic">
                        {allViolations.slice(0, 7).map((v) => (
                          <tr
                            key={v._id}
                            className="group hover:bg-slate-50 transition-all">
                            <td className="py-8 pr-6 pl-10">
                              <div className="flex items-center space-x-6">
                                <div className="w-14 h-14 bg-primary-950 text-white rounded-[22px] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                                  <Camera size={24} />
                                </div>
                                <div>
                                  <p className="text-xl text-primary-950 tracking-tighter">
                                    #EVT-{v._id.slice(-6)}
                                  </p>
                                  <p className="text-[10px] text-neutral-300 tracking-[0.3em] uppercase font-bold mt-1">
                                    {v.location}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-8 px-6 font-mono text-primary-950">
                              {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                            </td>
                            <td className="py-8 px-6 text-neutral-400 font-black underline decoration-accent-crimson/10 underline-offset-8 decoration-4">
                              {v.violationType}
                            </td>
                            <td className="py-8 pl-10 pr-10 text-right font-black italic text-primary-950 text-lg">
                              {new Date(v.violationDateTime).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="bg-primary-900 rounded-[64px] p-12 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[150px]"></div>
                  <div className="relative z-10 space-y-8">
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-tight underline decoration-white/20 underline-offset-8">
                      Quick <br /> Message.
                    </h4>
                    <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">
                      Send an important notice to everyone in the system
                      immediately.
                    </p>
                    <button
                      onClick={() => navigate("/notifications-mgmt")}
                      className="w-full py-6 bg-white text-primary-900 rounded-[28px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-neutral-50 transition-all active:scale-95">
                      Write Message
                    </button>
                  </div>
                </div>

                <div className="bg-white p-12 rounded-[64px] shadow-2xl border border-neutral-100 space-y-10 text-center relative overflow-hidden group">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto relative z-10 shadow-inner group-hover:rotate-[360deg] transition-transform duration-1000">
                    <Database className="text-primary-900" size={32} />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter text-primary-950 leading-none">
                      System Status.
                    </h4>
                    <div className="space-y-3 pt-2">
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-accent-emerald h-full w-[99.9%] shadow-[0_0_15px_#10b981] animate-pulse"></div>
                      </div>
                      <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest italic">
                        All systems running at 99.9%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return <Layout title={getPageTitle()}>{renderContent()}</Layout>;
};

export default AdminDashboard;
