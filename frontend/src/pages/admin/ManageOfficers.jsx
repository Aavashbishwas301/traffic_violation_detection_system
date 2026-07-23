import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { UserPlus, Edit3, Trash2 } from "lucide-react";

const ManageOfficers = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [officerForm, setOfficerForm] = useState({
    fullName: "",
    email: "",
    password: "",
    badgeNumber: "",
    role: "TrafficPolice",
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/api/admin/users");
      setUsers(data || []);
    } catch (err) {
      console.error("Users fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user]);

  const handleOfficerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/admin/officers/${editingId}`, officerForm);
        addToast("Officer updated.", "success");
      } else {
        await api.post("/api/users", officerForm);
        addToast("Officer registered.", "success");
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
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Operation failed.", "error");
    }
  };

  const deleteItem = async (id, role) => {
    if (!window.confirm("Delete this officer?")) return;
    try {
      await api.delete(`/api/admin/users/${id}?role=${role}`);
      addToast("Officer deleted.", "success");
      fetchUsers();
    } catch (err) {
      addToast("Failed to delete.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Manage Police Officers">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Police Officers">
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
                            onClick={() => deleteItem(u._id, u.role)}
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
    </Layout>
  );
};

export default ManageOfficers;
