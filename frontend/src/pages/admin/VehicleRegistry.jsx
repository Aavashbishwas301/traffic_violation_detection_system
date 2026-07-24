import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Search, Plus, Trash2, X, Edit3, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Select } from "../../components/ui/Select.jsx";

const VehicleRegistry = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }



  return (
    <Layout title="Vehicle Registry">
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              Vehicle Registry
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Manage and track all registered vehicles in the system.
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">

            <Button
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
              className="shrink-0"
            >
              <Plus size={16} className="mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        <DataTable 
          data={vehicles}
          columns={[
            {
              header: "License Plate",
              accessorKey: "vehicleNumber",
              sortable: true,
              cell: (v) => (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <Car size={16} />
                  </div>
                  <span className="font-mono text-slate-900 font-medium">{v.vehicleNumber}</span>
                </div>
              )
            },
            {
              header: "Owner",
              accessorKey: "ownerId.fullName",
              sortable: true,
              cell: (v) => (
                v.ownerId ? (
                  <div>
                    <p className="font-medium text-slate-900">{v.ownerId.fullName}</p>
                    <p className="text-xs text-slate-500">{v.ownerId.email}</p>
                  </div>
                ) : (
                  <span className="text-slate-400 text-sm">Unassigned</span>
                )
              )
            },
            {
              header: "Brand & Model",
              accessorKey: "brand",
              sortable: true,
              cell: (v) => (
                <>
                  <p className="font-medium text-slate-900">{v.brand || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{v.model || "Unknown"}</p>
                </>
              )
            },
            {
              header: "Type",
              accessorKey: "vehicleType",
              sortable: true,
              cell: (v) => (
                <Badge variant="secondary" className="font-normal">{v.vehicleType || "4-Wheeler"}</Badge>
              )
            },
            {
              header: "Status",
              accessorKey: "registrationStatus",
              sortable: true,
              cell: (v) => (
                <Badge variant={v.registrationStatus === 'Registered' ? 'success' : 'outline'}>
                  {v.registrationStatus || "Unregistered"}
                </Badge>
              )
            },
            {
              header: "Actions",
              accessorKey: "actions",
              sortable: false,
              align: "right",
              className: "text-right space-x-2",
              cell: (v) => (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
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
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => handleDelete(v._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )
            }
          ]}
          searchKey={["vehicleNumber", "ownerId.fullName"]}
          searchPlaceholder="Search by license plate or owner..."
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl shadow-xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <CardTitle>{editingId ? "Update Vehicle" : "Register Vehicle"}</CardTitle>
                <CardDescription className="mt-1">
                  {editingId ? "Modify vehicle details in the registry." : "Add a new vehicle to the registry."}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>License Plate *</Label>
                    <Input
                      required
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                      placeholder="e.g. BA 1 PA 1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Owner</Label>
                    <Select
                      value={formData.ownerId}
                      onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                    >
                      <option value="">-- No Owner (Unregistered) --</option>
                      {owners.map(owner => (
                        <option key={owner._id} value={owner._id}>
                          {owner.fullName} ({owner.citizenshipNumber})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g. Honda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="e.g. Civic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    >
                      <option value="2-Wheeler">2-Wheeler</option>
                      <option value="4-Wheeler">4-Wheeler</option>
                      <option value="Heavy">Heavy</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="e.g. Red"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Vehicle"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default VehicleRegistry;
