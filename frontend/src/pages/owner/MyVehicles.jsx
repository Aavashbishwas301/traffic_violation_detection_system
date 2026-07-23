import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Plus, X } from "lucide-react";

const MyVehicles = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vehicle Registration State
  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState({
    vehicleNumber: "",
    vehicleType: "4-Wheeler",
    brand: "",
    model: "",
    color: "",
    insuranceStatus: "Active",
    taxStatus: "Paid",
  });
  const [regMsg, setRegMsg] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get("/api/vehicles/my");
      setVehicles(data);
    } catch (err) {
      console.error("Vehicle fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchVehicles();
  }, [user]);

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    if (!regForm.vehicleNumber) return addToast("Vehicle number is required.", "warning");
    
    setRegLoading(true);
    setRegMsg("");
    try {
      await api.post("/api/vehicles", regForm);
      addToast("Vehicle registered successfully!", "success");
      setRegMsg("Vehicle registered successfully!");
      setRegForm({
        vehicleNumber: "",
        vehicleType: "4-Wheeler",
        brand: "",
        model: "",
        color: "",
        insuranceStatus: "Active",
        taxStatus: "Paid",
      });
      setShowRegForm(false);
      fetchVehicles();
    } catch (err) {
      setRegMsg(err.response?.data?.message || "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="My Vehicles">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Vehicles">
      <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-2">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">
            My Vehicles
          </h3>
          <button
            onClick={() => setShowRegForm(true)}
            className="bg-primary-950 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase flex items-center space-x-2 shadow-2xl hover:bg-black transition-all">
            <Plus size={16} /> <span>Add Vehicle</span>
          </button>
        </div>

        {/* Registration Modal */}
        {showRegForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-primary-950/20">
            <div className="bg-white rounded-[48px] p-12 shadow-2xl max-w-xl w-full border border-neutral-100 space-y-8 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
                    Register Vehicle.
                  </h3>
                  <p className="text-[10px] font-black text-neutral-300 uppercase mt-2 italic">
                    Add your vehicle to the TVDS registry
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRegForm(false);
                    setRegMsg("");
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleRegisterVehicle} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    placeholder="BA 1 PA 1234"
                    value={regForm.vehicleNumber}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        vehicleNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                      Type
                    </label>
                    <select
                      value={regForm.vehicleType}
                      onChange={(e) =>
                        setRegForm({ ...regForm, vehicleType: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic">
                      <option value="4-Wheeler">4-Wheeler</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Bus">Bus</option>
                      <option value="Truck">Truck</option>
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                      Color
                    </label>
                    <input
                      type="text"
                      placeholder="Red, Blue..."
                      value={regForm.color}
                      onChange={(e) =>
                        setRegForm({ ...regForm, color: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="Toyota, Honda..."
                      value={regForm.brand}
                      onChange={(e) =>
                        setRegForm({ ...regForm, brand: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                      Model
                    </label>
                    <input
                      type="text"
                      placeholder="Corolla, Civic..."
                      value={regForm.model}
                      onChange={(e) =>
                        setRegForm({ ...regForm, model: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                      Insurance
                    </label>
                    <select
                      value={regForm.insuranceStatus}
                      onChange={(e) =>
                        setRegForm({ ...regForm, insuranceStatus: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic">
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                      Tax Status
                    </label>
                    <select
                      value={regForm.taxStatus}
                      onChange={(e) =>
                        setRegForm({ ...regForm, taxStatus: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:border-primary-950 uppercase italic">
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-6 bg-primary-950 text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-black transition-all disabled:opacity-50">
                  {regLoading ? "Registering..." : "Register Vehicle"}
                </button>
                {regMsg && (
                  <p
                    className={`text-center text-[10px] font-black uppercase italic ${regMsg.includes("success") ? "text-green-600" : "text-accent-crimson"}`}>
                    {regMsg}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vehicles.map((vh) => (
            <div
              key={vh._id}
              className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-950/5 rounded-bl-[100px]"></div>
              <h3 className="text-4xl font-black text-primary-950 italic tracking-tighter underline decoration-accent-crimson underline-offset-8 uppercase">
                {vh.vehicleNumber}
              </h3>
              <div className="grid grid-cols-2 gap-4 pt-6 uppercase font-black tracking-widest text-[10px] text-left">
                <div>
                  <p className="text-neutral-300">Type</p>
                  <p className="text-primary-950 italic">{vh.vehicleType}</p>
                </div>
                <div>
                  <p className="text-neutral-300">Brand</p>
                  <p className="text-primary-950 italic">
                    {vh.brand} {vh.model}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-300">Insurance</p>
                  <p className="text-accent-emerald italic">
                    {vh.insuranceStatus}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-300">Tax</p>
                  <p className="text-accent-emerald italic">{vh.taxStatus}</p>
                </div>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <div className="md:col-span-2 bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
              No vehicles found.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyVehicles;
