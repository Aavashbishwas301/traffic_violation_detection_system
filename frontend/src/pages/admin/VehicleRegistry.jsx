import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Search, Plus, Trash2, X, Edit3 } from "lucide-react";

const VehicleRegistry = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    brand: "",
    model: "",
    vehicleType: "4-Wheeler",
    color: "",
    ownerId: "",
  });

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get("/api/admin/vehicles");
      setVehicles(data || []);
    } catch (err) {
      console.error("Vehicles fetch failed");
      showToast("Failed to fetch vehicles", "error");
    }
  };

  const fetchOwners = async () => {
    try {
      const { data } = await api.get("/api/admin/users?role=VehicleOwner");
      setOwners(data || []);
    } catch (err) {
      console.error("Owners fetch failed");
    }
  };

  useEffect(() => {
    if (user?.token) {
      Promise.all([fetchVehicles(), fetchOwners()]).finally(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await api.delete(`/api/admin/vehicles/${id}`);
      showToast("Vehicle deleted successfully", "success");
      fetchVehicles();
    } catch (err) {
      showToast("Failed to delete vehicle", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/admin/vehicles/${editingId}`, formData);
        showToast("Vehicle updated successfully", "success");
      } else {
        await api.post("/api/admin/vehicles", formData);
        showToast("Vehicle created successfully", "success");
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        vehicleNumber: "",
        brand: "",
        model: "",
        vehicleType: "4-Wheeler",
        color: "",
        ownerId: "",
      });
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to process request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Vehicle Registry">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const filteredVehicles = vehicles.filter((v) =>
    v.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="Vehicle Registry">
      <div className="space-y-10 animate-fade-in pb-20">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase">
              Vehicle Registry.
            </h3>
            <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 italic">
              Manage all registered vehicles
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="bg-neutral-50 border-2 border-neutral-100 rounded-xl px-5 py-2 pl-12 text-xs font-black uppercase italic outline-none focus:border-primary-950"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300"
                size={16}
              />
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  vehicleNumber: "",
                  brand: "",
                  model: "",
                  vehicleType: "4-Wheeler",
                  color: "",
                  ownerId: "",
                });
                setShowModal(true);
              }}
              className="bg-primary-950 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest italic hover:bg-accent-crimson transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white border border-neutral-100 rounded-[48px] p-10 shadow-2xl relative group overflow-hidden"
            >
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={() => {
                    setEditingId(v._id);
                    setFormData({
                      vehicleNumber: v.vehicleNumber || "",
                      brand: v.brand || "",
                      model: v.model || "",
                      vehicleType: v.vehicleType || "4-Wheeler",
                      color: v.color || "",
                      ownerId: v.ownerId?._id || "",
                    });
                    setShowModal(true);
                  }}
                  className="bg-blue-50 text-blue-500 p-3 rounded-xl hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <span className="bg-neutral-900 text-white px-5 py-2 rounded-2xl font-black italic text-sm uppercase shadow-lg inline-block">
                  {v.vehicleNumber}
                </span>
                
                <div>
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">
                    Owner Details
                  </p>
                  <p className="text-xl font-black italic text-primary-950 uppercase truncate">
                    {v.ownerId?.fullName || "NO OWNER LINKED"}
                  </p>
                  {v.ownerId && (
                    <div className="mt-1 space-y-1">
                      <p className="text-xs font-bold text-neutral-400">{v.ownerId.email}</p>
                      <p className="text-xs font-bold text-neutral-400">{v.ownerId.phoneNumber}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-neutral-50 pt-4 text-[10px] font-bold uppercase italic text-neutral-400">
                  <div>
                    <p>Brand / Model</p>
                    <p className="text-primary-950 text-xs font-black truncate">
                      {v.brand || "N/A"} / {v.model || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p>Status</p>
                    <p className={`text-xs font-black ${v.registrationStatus === 'Registered' ? 'text-accent-emerald' : 'text-neutral-400'}`}>
                      {v.registrationStatus?.toUpperCase() || "UNREGISTERED"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredVehicles.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
              No vehicles found.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-100">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic text-primary-950 uppercase tracking-tighter">
                  {editingId ? "Update Vehicle." : "Register Vehicle."}
                </h3>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                  {editingId ? "Modify vehicle details" : "Add a new vehicle to system"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-accent-crimson transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Vehicle Number *</label>
                  <input
                    required
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl px-4 py-3 text-sm font-black italic uppercase focus:border-primary-950 outline-none"
                    placeholder="e.g. BA 1 PA 1234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assign Owner</label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary-950 outline-none"
                  >
                    <option value="">-- No Owner (Unregistered) --</option>
                    {owners.map(owner => (
                      <option key={owner._id} value={owner._id}>
                        {owner.fullName} ({owner.citizenshipNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary-950 outline-none"
                    placeholder="e.g. Honda"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary-950 outline-none"
                    placeholder="e.g. Civic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary-950 outline-none"
                  >
                    <option value="2-Wheeler">2-Wheeler</option>
                    <option value="4-Wheeler">4-Wheeler</option>
                    <option value="Heavy">Heavy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary-950 outline-none"
                    placeholder="e.g. Red"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 space-x-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-primary-950 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary-950 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest italic hover:bg-accent-crimson transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VehicleRegistry;
