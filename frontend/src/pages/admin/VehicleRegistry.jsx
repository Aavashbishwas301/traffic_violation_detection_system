import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Search, Plus, Trash2, X, Edit3, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const filteredVehicles = vehicles.filter((v) =>
    v.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                type="text"
                placeholder="Search by license plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                          <Car size={16} />
                        </div>
                        <span className="font-mono text-slate-900">{v.vehicleNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {v.ownerId ? (
                        <div>
                          <p className="font-medium text-slate-900">{v.ownerId.fullName}</p>
                          <p className="text-xs text-slate-500">{v.ownerId.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-900">{v.brand || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{v.model || "Unknown"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{v.vehicleType || "4-Wheeler"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.registrationStatus === 'Registered' ? 'success' : 'outline'}>
                        {v.registrationStatus || "Unregistered"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
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
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      No vehicles found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
                    <label className="text-sm font-medium text-slate-900">License Plate *</label>
                    <Input
                      required
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                      placeholder="e.g. BA 1 PA 1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Assign Owner</label>
                    <select
                      value={formData.ownerId}
                      onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
                    <label className="text-sm font-medium text-slate-900">Brand</label>
                    <Input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g. Honda"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Model</label>
                    <Input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="e.g. Civic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <option value="2-Wheeler">2-Wheeler</option>
                      <option value="4-Wheeler">4-Wheeler</option>
                      <option value="Heavy">Heavy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Color</label>
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
