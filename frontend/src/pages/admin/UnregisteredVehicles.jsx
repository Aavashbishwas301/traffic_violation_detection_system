import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Search, X, CheckCircle2 } from "lucide-react";

const UnregisteredVehicles = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [unregisteredVehicles, setUnregisteredVehicles] = useState([]);
  const [users, setUsers] = useState([]); // This stores owners fetched from backend
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    try {
      const [uvRes, uRes] = await Promise.all([
        api.get("/api/admin/vehicles/unregistered"),
        api.get("/api/admin/users?role=VehicleOwner"),
      ]);
      setUnregisteredVehicles(uvRes.data || []);
      setUsers(uRes.data || []);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchData();
  }, [user]);

  const openAssignModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOwnerSearch("");
    setSelectedOwnerId(null);
    setIsModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleAssignOwner = async () => {
    if (!selectedOwnerId) {
      return addToast("Please select an owner.", "warning");
    }

    setAssigning(true);
    try {
      await api.put(`/api/admin/vehicles/${selectedVehicle._id}/assign-owner`, {
        ownerId: selectedOwnerId,
      });
      addToast("Owner assigned successfully!", "success");
      fetchData();
      closeAssignModal();
    } catch (err) {
      addToast("Failed to assign owner.", "error");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Unregistered Vehicles">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Filter owners based on search query
  const filteredOwners = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      u.citizenshipNumber?.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  return (
    <Layout title="Unregistered Vehicles">
      <div className="space-y-10 animate-fade-in pb-20 relative">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Unregistered Vehicles.
            </h3>
            <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 italic">
              AI-detected vehicles with no owner. Assign owners here.
            </p>
          </div>
          <div className="bg-accent-crimson text-white px-4 py-2 rounded-xl font-black text-[10px] italic">
            TOTAL: {unregisteredVehicles.length}
          </div>
        </div>
        <div className="bg-white rounded-[56px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-10 py-7">Plate No.</th>
                  <th className="px-10 py-7">Type</th>
                  <th className="px-10 py-7">Brand</th>
                  <th className="px-10 py-7">Detected</th>
                  <th className="px-10 py-7 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                {unregisteredVehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6">
                      <span className="bg-neutral-100 px-3 py-1 rounded-xl border border-neutral-200 font-mono text-primary-950 text-xs uppercase">
                        {v.vehicleNumber}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-neutral-400">
                      {v.vehicleType}
                    </td>
                    <td className="px-10 py-6 text-neutral-400">{v.brand}</td>
                    <td className="px-10 py-6 text-neutral-300">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => openAssignModal(v)}
                        className="bg-primary-950 text-white px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-black transition-all shadow-md hover:shadow-xl">
                        ASSIGN OWNER
                      </button>
                    </td>
                  </tr>
                ))}
                {unregisteredVehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-10 py-12 text-center text-neutral-300 italic">
                      No unregistered vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ASSIGN OWNER MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden border border-neutral-100 flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h4 className="text-xl font-black italic uppercase text-primary-950 tracking-tighter">
                    Assign Owner
                  </h4>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                    Linking Plate: <span className="text-accent-crimson border-b border-accent-crimson">{selectedVehicle?.vehicleNumber}</span>
                  </p>
                </div>
                <button
                  onClick={closeAssignModal}
                  className="p-2 bg-white rounded-full hover:bg-neutral-100 text-neutral-400 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Search */}
              <div className="p-8 flex flex-col flex-1 overflow-hidden">
                <div className="relative mb-6 shrink-0">
                  <input
                    type="text"
                    placeholder="Search by Name, Email, or Citizenship No..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold uppercase outline-none focus:border-primary-900 focus:bg-white transition-all shadow-inner"
                  />
                  <Search className="absolute left-4 top-4 text-neutral-400" size={18} />
                </div>

                {/* Owner List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50 rounded-2xl border border-neutral-100 p-2 space-y-2">
                  {filteredOwners.length > 0 ? (
                    filteredOwners.map((owner) => (
                      <div
                        key={owner._id}
                        onClick={() => setSelectedOwnerId(owner._id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                          selectedOwnerId === owner._id
                            ? "bg-primary-950 text-white border-primary-950 shadow-md"
                            : "bg-white text-primary-950 border-neutral-200 hover:border-primary-500 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          <p className={`text-xs font-black uppercase tracking-wide ${selectedOwnerId === owner._id ? "text-white" : "text-primary-950"}`}>
                            {owner.fullName}
                          </p>
                          <p className={`text-[10px] font-bold mt-1 ${selectedOwnerId === owner._id ? "text-primary-300" : "text-neutral-400"}`}>
                            {owner.email} | CITIZENSHIP: {owner.citizenshipNumber || "N/A"}
                          </p>
                        </div>
                        {selectedOwnerId === owner._id && <CheckCircle2 size={20} className="text-white" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-[10px] font-black uppercase text-neutral-400 italic">
                      No matching vehicle owners found.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-slate-50 border-t border-neutral-100 flex justify-end shrink-0">
                <button
                  onClick={handleAssignOwner}
                  disabled={!selectedOwnerId || assigning}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    !selectedOwnerId || assigning
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-accent-crimson text-white hover:bg-red-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  }`}
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UnregisteredVehicles;
