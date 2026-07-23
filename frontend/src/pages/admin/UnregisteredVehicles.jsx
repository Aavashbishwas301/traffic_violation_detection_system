import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";

const UnregisteredVehicles = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [unregisteredVehicles, setUnregisteredVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [uvRes, uRes] = await Promise.all([
        api.get("/api/admin/vehicles/unregistered"),
        api.get("/api/admin/users"),
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

  const handleAssignOwner = async (vehicleId) => {
    const ownerEmail = prompt("Enter owner email to assign:");
    if (!ownerEmail) return;

    const owner = users.find(
      (u) =>
        u.email?.toLowerCase() === ownerEmail.toLowerCase() &&
        u.role === "VehicleOwner"
    );

    if (!owner) {
      return addToast("Owner not found. Make sure they are registered.", "error");
    }

    try {
      await api.put(`/api/admin/vehicles/${vehicleId}/assign-owner`, {
        ownerId: owner._id,
      });
      addToast("Owner assigned!", "success");
      fetchData();
    } catch (err) {
      addToast("Failed to assign.", "error");
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

  return (
    <Layout title="Unregistered Vehicles">
      <div className="space-y-10 animate-fade-in pb-20">
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
                        onClick={() => handleAssignOwner(v._id)}
                        className="bg-primary-950 text-white px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-black transition-all">
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
      </div>
    </Layout>
  );
};

export default UnregisteredVehicles;
