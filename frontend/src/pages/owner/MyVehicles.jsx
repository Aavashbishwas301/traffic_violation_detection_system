import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Plus, X, Car, ShieldCheck, FileText, Settings, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Select } from "../../components/ui/Select.jsx";

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
    try {
      await api.post("/api/vehicles", regForm);
      addToast("Vehicle registered successfully!", "success");
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
      addToast(err.response?.data?.message || "Registration failed.", "error");
    } finally {
      setRegLoading(false);
    }
  };

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
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Vehicles
            </h3>
            <p className="text-sm text-slate-500 mt-1">Manage your registered vehicles and compliance status.</p>
          </div>
          <Button onClick={() => setShowRegForm(true)} className="flex items-center">
            <Plus size={16} className="mr-2" /> Add Vehicle
          </Button>
        </div>

        {/* Registration Modal */}
        {showRegForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 animate-slide-up max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Register Vehicle
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Add a new vehicle to your TVDS account
                  </p>
                </div>
                <button
                  onClick={() => setShowRegForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto p-6 flex-1">
                <form onSubmit={handleRegisterVehicle} className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      Vehicle Plate Number <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="BA 1 PA 1234"
                      value={regForm.vehicleNumber}
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          vehicleNumber: e.target.value.toUpperCase(),
                        })
                      }
                      className="uppercase font-mono font-bold text-lg tracking-wider"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>
                        Vehicle Type
                      </Label>
                      <Select
                        value={regForm.vehicleType}
                        onChange={(e) =>
                          setRegForm({ ...regForm, vehicleType: e.target.value })
                        }>
                        <option value="4-Wheeler">4-Wheeler</option>
                        <option value="Car">Car</option>
                        <option value="Van">Van</option>
                        <option value="Bus">Bus</option>
                        <option value="Truck">Truck</option>
                        <option value="Bike">2-Wheeler (Bike/Scooter)</option>
                        <option value="Other">Other</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Color
                      </Label>
                      <Input
                        type="text"
                        placeholder="Red, Blue..."
                        value={regForm.color}
                        onChange={(e) =>
                          setRegForm({ ...regForm, color: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>
                        Brand Make
                      </Label>
                      <Input
                        type="text"
                        placeholder="Toyota, Honda..."
                        value={regForm.brand}
                        onChange={(e) =>
                          setRegForm({ ...regForm, brand: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Model
                      </Label>
                      <Input
                        type="text"
                        placeholder="Corolla, Civic..."
                        value={regForm.model}
                        onChange={(e) =>
                          setRegForm({ ...regForm, model: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>
                        Insurance Status
                      </Label>
                      <Select
                        value={regForm.insuranceStatus}
                        onChange={(e) =>
                          setRegForm({ ...regForm, insuranceStatus: e.target.value })
                        }>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="N/A">N/A</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Tax Status
                      </Label>
                      <Select
                        value={regForm.taxStatus}
                        onChange={(e) =>
                          setRegForm({ ...regForm, taxStatus: e.target.value })
                        }>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="N/A">N/A</option>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                    <Button variant="outline" type="button" onClick={() => setShowRegForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={regLoading}>
                      {regLoading ? (
                        <><Loader2 className="animate-spin mr-2" size={16} /> Registering...</>
                      ) : (
                        "Register Vehicle"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vh) => (
            <Card key={vh._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 w-full bg-primary-600"></div>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">{vh.brand} {vh.model}</CardDescription>
                    <CardTitle className="font-mono text-xl tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                      {vh.vehicleNumber}
                    </CardTitle>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Car size={20} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                   <div className="flex flex-col space-y-1">
                      <span className="text-slate-500 flex items-center text-xs"><Settings size={12} className="mr-1" /> Type</span>
                      <span className="font-medium text-slate-900">{vh.vehicleType}</span>
                   </div>
                   <div className="flex flex-col space-y-1">
                      <span className="text-slate-500 flex items-center text-xs"><Car size={12} className="mr-1" /> Color</span>
                      <span className="font-medium text-slate-900">{vh.color || 'N/A'}</span>
                   </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-500" /> Insurance</span>
                      <Badge variant={vh.insuranceStatus === 'Active' ? 'default' : 'destructive'} className={vh.insuranceStatus === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {vh.insuranceStatus}
                      </Badge>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center"><FileText size={14} className="mr-2 text-emerald-500" /> Annual Tax</span>
                      <Badge variant={vh.taxStatus === 'Paid' ? 'default' : 'destructive'} className={vh.taxStatus === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {vh.taxStatus}
                      </Badge>
                   </div>
                </div>

              </CardContent>
            </Card>
          ))}

          {vehicles.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <Car size={32} />
              </div>
              <h4 className="text-lg font-medium text-slate-900">No Vehicles Found</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                You haven't registered any vehicles yet. Click the "Add Vehicle" button to get started.
              </p>
              <Button onClick={() => setShowRegForm(true)} className="mt-6" variant="outline">
                <Plus size={16} className="mr-2" /> Register First Vehicle
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyVehicles;
