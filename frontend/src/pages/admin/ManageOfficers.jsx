import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { UserPlus, Edit3, Trash2, X, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";

const ManageOfficers = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [officerForm, setOfficerForm] = useState({
    fullName: "",
    email: "",
    password: "",
    badgeNumber: "",
    role: "TrafficPolice",
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/api/admin/users");
      setUsers(data || []);
    } catch (err) {
      console.error("Users fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user]);

  const handleOfficerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/admin/officers/${editingId}`, officerForm);
        addToast("Officer updated.", "success");
      } else {
        await api.post("/api/users", officerForm);
        addToast("Officer registered.", "success");
      }
      setShowModal(false);
      setOfficerForm({
        fullName: "",
        email: "",
        password: "",
        badgeNumber: "",
        role: "TrafficPolice",
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Operation failed.", "error");
    }
  };

  const deleteItem = async (id, role) => {
    if (!window.confirm("Delete this officer?")) return;
    try {
      await api.delete(`/api/admin/users/${id}?role=${role}`);
      addToast("Officer deleted.", "success");
      fetchUsers();
    } catch (err) {
      addToast("Failed to delete.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Manage Police Officers">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const policeOfficers = users.filter((u) => u.role === "TrafficPolice");

  return (
    <Layout title="Manage Police Officers">
      <div className="space-y-6 animate-fade-in pb-20">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              Police Officers
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Add, update, or deactivate officer accounts and manage their grid access.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setOfficerForm({
                fullName: "",
                email: "",
                password: "",
                badgeNumber: "",
                role: "TrafficPolice",
              });
              setShowModal(true);
            }}
          >
            <UserPlus size={16} className="mr-2" /> Add Officer
          </Button>
        </div>

        <DataTable 
          data={policeOfficers}
          columns={[
            {
              header: "Officer Details",
              accessorKey: "fullName",
              sortable: true,
              cell: (u) => (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                    {u.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{u.fullName}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: "Badge Number",
              accessorKey: "badgeNumber",
              sortable: true,
              cell: (u) => (
                <div className="flex items-center space-x-2">
                  <ShieldAlert size={14} className="text-slate-400" />
                  <span className="font-mono text-slate-700">{u.badgeNumber || "PENDING"}</span>
                </div>
              )
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: false,
              cell: () => <Badge variant="success">ACTIVE</Badge>
            },
            {
              header: "Actions",
              accessorKey: "actions",
              sortable: false,
              align: "right",
              className: "text-right space-x-2",
              cell: (u) => (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(u._id);
                      setOfficerForm({
                        fullName: u.fullName,
                        email: u.email,
                        badgeNumber: u.badgeNumber || "",
                        role: "TrafficPolice",
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
                    onClick={() => deleteItem(u._id, u.role)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )
            }
          ]}
          searchKey={["fullName", "email", "badgeNumber"]}
          searchPlaceholder="Search officers by name, email or badge..."
        />

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <CardTitle>{editingId ? "Update Officer" : "Register Officer"}</CardTitle>
                <CardDescription className="mt-1">
                  {editingId ? "Modify officer credentials." : "Initialize security credentials for the grid."}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </div>
            
            <form onSubmit={handleOfficerSubmit}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    required
                    type="text"
                    value={officerForm.fullName}
                    onChange={(e) => setOfficerForm({ ...officerForm, fullName: e.target.value })}
                    placeholder="e.g. Ram Bahadur"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    required
                    type="email"
                    value={officerForm.email}
                    onChange={(e) => setOfficerForm({ ...officerForm, email: e.target.value })}
                    placeholder="e.g. ram@police.gov.np"
                  />
                </div>
                {!editingId && (
                  <div className="space-y-2">
                    <Label>Access Password *</Label>
                    <Input
                      required
                      type="password"
                      value={officerForm.password}
                      onChange={(e) => setOfficerForm({ ...officerForm, password: e.target.value })}
                      placeholder="Enter a secure password"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Badge Number *</Label>
                  <Input
                    required
                    type="text"
                    value={officerForm.badgeNumber}
                    onChange={(e) => setOfficerForm({ ...officerForm, badgeNumber: e.target.value })}
                    placeholder="e.g. TP-9982"
                  />
                </div>
              </CardContent>
              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Save Changes" : "Register Officer"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default ManageOfficers;
