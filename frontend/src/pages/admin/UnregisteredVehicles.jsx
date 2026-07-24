import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Search, X, CheckCircle2, AlertCircle } from "lucide-react";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card.jsx";

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
      <div className="space-y-6 animate-fade-in pb-20 relative">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Unregistered Vehicles
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            AI-detected vehicles with no owner. Assign owners here.
          </p>
        </div>

        <DataTable 
          data={unregisteredVehicles}
          columns={[
            {
              header: "Plate No.",
              accessorKey: "vehicleNumber",
              sortable: true,
              cell: (v) => <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">{v.vehicleNumber}</span>
            },
            {
              header: "Type",
              accessorKey: "vehicleType",
              sortable: true,
              className: "font-medium text-slate-900"
            },
            {
              header: "Brand",
              accessorKey: "brand",
              sortable: true,
              className: "text-slate-500"
            },
            {
              header: "Detected",
              accessorKey: "createdAt",
              sortable: true,
              className: "text-slate-500",
              cell: (v) => new Date(v.createdAt).toLocaleDateString()
            },
            {
              header: "Action",
              accessorKey: "actions",
              sortable: false,
              align: "right",
              className: "text-right",
              cell: (v) => (
                <Button size="sm" onClick={() => openAssignModal(v)}>
                  Assign Owner
                </Button>
              )
            }
          ]}
          searchKey={["vehicleNumber", "brand", "vehicleType"]}
          searchPlaceholder="Search by Plate No, Brand..."
        />

        {/* ASSIGN OWNER MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-xl max-h-[85vh] flex flex-col border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50 rounded-t-xl shrink-0 py-4">
                <div>
                  <CardTitle>Assign Owner</CardTitle>
                  <CardDescription>
                    Linking Plate: <span className="font-mono font-medium text-rose-600">{selectedVehicle?.vehicleNumber}</span>
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={closeAssignModal} className="h-8 w-8">
                  <X size={18} />
                </Button>
              </CardHeader>
              <CardContent className="p-6 flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="relative mb-6 shrink-0">
                  <Input
                    type="text"
                    placeholder="Search by Name, Email, or Citizenship No..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>

                {/* Owner List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                  {filteredOwners.length > 0 ? (
                    filteredOwners.map((owner) => (
                      <div
                        key={owner._id}
                        onClick={() => setSelectedOwnerId(owner._id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                          selectedOwnerId === owner._id
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${selectedOwnerId === owner._id ? "text-white" : "text-slate-900"}`}>
                            {owner.fullName}
                          </p>
                          <p className={`text-xs mt-0.5 ${selectedOwnerId === owner._id ? "text-slate-300" : "text-slate-500"}`}>
                            {owner.email} &bull; Citizenship: {owner.citizenshipNumber || "N/A"}
                          </p>
                        </div>
                        {selectedOwnerId === owner._id && <CheckCircle2 size={20} className="text-white" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500">
                      <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-sm font-medium">No matching owners found</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-slate-50 border-t flex justify-end shrink-0 rounded-b-xl">
                <Button
                  onClick={handleAssignOwner}
                  disabled={!selectedOwnerId || assigning}
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UnregisteredVehicles;
