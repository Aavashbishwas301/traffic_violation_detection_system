import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Edit3, CheckCircle2, Trash2, Camera } from "lucide-react";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const ViolationManagement = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      const { data } = await api.get("/api/violations");
      setAllViolations(Array.isArray(data) ? data : data.violations || []);
    } catch (err) {
      console.error("Violations fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchViolations();
  }, [user]);

  const handleVerify = async (id) => {
    try {
      await api.put(`/api/violations/${id}`, {
        status: "Verified",
        remarks: "Verified by Admin",
      });
      addToast("Violation verified.", "success");
      fetchViolations();
    } catch (err) {
      addToast("Verification failed.", "error");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this violation?")) return;
    try {
      await api.delete(`/api/violations/${id}`);
      addToast("Violation deleted.", "success");
      fetchViolations();
    } catch (err) {
      addToast("Failed to delete.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Violation Management">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Violation Management">
      <div className="space-y-6 animate-fade-in pb-20">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Violation Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Verify, edit, or delete violation records across the system.
          </p>
        </div>

        <DataTable 
          data={allViolations}
          columns={[
            {
              header: "Event ID",
              accessorKey: "_id",
              sortable: true,
              cell: (v) => (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <Camera size={14} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">EVT-{v._id.slice(-6)}</div>
                    <div className="text-xs text-slate-500">{new Date(v.violationDateTime).toLocaleDateString()}</div>
                  </div>
                </div>
              )
            },
            {
              header: "Plate No.",
              accessorKey: "vehicleId.vehicleNumber",
              sortable: true,
              cell: (v) => <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">{v.vehicleId?.vehicleNumber || "UNKNOWN"}</span>
            },
            {
              header: "Violation",
              accessorKey: "violationType",
              sortable: true,
              cell: (v) => <span className="font-medium text-slate-900">{v.violationType}</span>
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              cell: (v) => (
                <Badge variant={v.status === 'Paid' ? 'success' : v.status === 'Verified' ? 'default' : v.status === 'Pending' ? 'secondary' : 'destructive'}>
                  {v.status}
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
                    onClick={() => addToast(`Edit mode for violation: ${v._id}`, "info")}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </Button>
                  {v.status === "Pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleVerify(v._id)}
                      title="Verify"
                    >
                      <CheckCircle2 size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => deleteItem(v._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )
            }
          ]}
          searchKey={["_id", "vehicleId.vehicleNumber", "violationType"]}
          searchPlaceholder="Search by Event ID, Plate No. or Violation..."
        />
      </div>
    </Layout>
  );
};

export default ViolationManagement;
