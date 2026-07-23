import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Search } from "lucide-react";

const VehicleRegistry = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data } = await api.get("/api/admin/vehicles");
        setVehicles(data || []);
      } catch (err) {
        console.error("Vehicles fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchVehicles();
  }, [user]);

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
              Search and view all registered vehicles
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
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((v) => (
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
                  <p className="text-xl font-black italic text-primary-950 uppercase truncate">
                    {v.ownerId?.fullName || "UNKNOWN"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-neutral-50 pt-4 text-[10px] font-bold uppercase italic text-neutral-400">
                  <div>
                    <p>Brand</p>
                    <p className="text-primary-950 text-xs font-black truncate">
                      {v.brand || "N/A"}
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
          {filteredVehicles.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
              No vehicles found.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VehicleRegistry;
