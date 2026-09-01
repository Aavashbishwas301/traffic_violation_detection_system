import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Car, ShieldCheck, FileText, Settings, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const MyVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get("/api/vehicles/my");
      setVehicles(data || []);
    } catch (err) {
      console.error("Vehicle fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchVehicles();
  }, [user]);

  if (loading) {
    return (
      <Layout title="My Vehicles">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Vehicles">
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-4 gap-2">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Registered Vehicles ({vehicles.length})
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Vehicles officially linked to your citizen profile by the Department of Transport Management (DoTM).
            </p>
          </div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            <Info size={14} className="text-primary-600 shrink-0" />
            <span>Managed by Traffic Authority</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vh) => (
            <Card key={vh._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 w-full bg-primary-600"></div>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">
                      {vh.brand || "Standard"} {vh.model || ""}
                    </CardDescription>
                    <CardTitle className="font-mono text-xl tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block font-bold text-slate-900">
                      {vh.vehicleNumber}
                    </CardTitle>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100">
                    <Car size={20} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                   <div className="flex flex-col space-y-1">
                      <span className="text-slate-500 flex items-center text-xs">
                        <Settings size={12} className="mr-1" /> Type
                      </span>
                      <span className="font-semibold text-slate-900">{vh.vehicleType || "Vehicle"}</span>
                   </div>
                   <div className="flex flex-col space-y-1">
                      <span className="text-slate-500 flex items-center text-xs">
                        <Car size={12} className="mr-1" /> Color
                      </span>
                      <span className="font-semibold text-slate-900">{vh.color || 'N/A'}</span>
                   </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center">
                        <ShieldCheck size={14} className="mr-2 text-emerald-500" /> Insurance
                      </span>
                      <Badge variant={vh.insuranceStatus === 'Active' ? 'default' : 'destructive'} className={vh.insuranceStatus === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {vh.insuranceStatus || "Active"}
                      </Badge>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center">
                        <FileText size={14} className="mr-2 text-emerald-500" /> Annual Tax
                      </span>
                      <Badge variant={vh.taxStatus === 'Paid' ? 'default' : 'destructive'} className={vh.taxStatus === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {vh.taxStatus || "Paid"}
                      </Badge>
                   </div>
                </div>

              </CardContent>
            </Card>
          ))}

          {vehicles.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl p-6">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <Car size={32} />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">No Vehicles Linked</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-md text-center leading-relaxed">
                There are currently no vehicles linked to your citizen account. Official vehicle records and registrations are managed by the Department of Transport Management (DoTM).
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyVehicles;
