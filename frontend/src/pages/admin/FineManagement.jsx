import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const FineManagement = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [allViolations, setAllViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [vRes, sRes] = await Promise.all([
        api.get("/api/violations"),
        api.get("/api/admin/stats"),
      ]);
      setAllViolations(Array.isArray(vRes.data) ? vRes.data : vRes.data.violations || []);
      setStats(sRes.data);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchData();
  }, [user]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Paid" ? "Verified" : "Paid";
    try {
      await api.put(`/api/violations/${id}`, {
        status: newStatus,
        remarks: `Status changed to ${newStatus} by Admin`,
      });
      addToast(`Status updated to ${newStatus}`, "success");
      fetchData();
    } catch (err) {
      addToast("Status update failed.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Fine Management">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Fine Management">
      <div className="space-y-6 animate-fade-in pb-20 h-full flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              Fine Management
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Monitor payments and update fine status across the system.
            </p>
          </div>
          <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg font-semibold text-sm border border-rose-100 shadow-sm">
            Outstanding: NPR {stats?.summary?.totalLiability?.toLocaleString() || 0}
          </div>
        </div>

        <DataTable 
          data={allViolations}
          columns={[
            {
              header: "Payment ID",
              accessorKey: "_id",
              sortable: true,
              cell: (v) => <span className="font-mono text-slate-500">#PAY-{v._id.slice(-6).toUpperCase()}</span>
            },
            {
              header: "Vehicle",
              accessorKey: "vehicleId.vehicleNumber",
              sortable: true,
              cell: (v) => <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">{v.vehicleId?.vehicleNumber || "UNKNOWN"}</span>
            },
            {
              header: "Amount",
              accessorKey: "appliedFineAmount",
              sortable: true,
              className: "font-semibold text-slate-900",
              cell: (v) => `NPR ${v.appliedFineAmount || "0"}`
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              cell: (v) => (
                <Badge variant={v.status === 'Paid' ? 'success' : 'destructive'}>
                  {v.status?.toUpperCase()}
                </Badge>
              )
            },
            {
              header: "Update",
              accessorKey: "actions",
              sortable: false,
              align: "right",
              className: "text-right",
              cell: (v) => (
                <Button 
                  size="sm" 
                  variant={v.status === 'Paid' ? 'outline' : 'default'}
                  onClick={() => toggleStatus(v._id, v.status)}
                >
                  Change Status
                </Button>
              )
            }
          ]}
          searchKey={["_id", "vehicleId.vehicleNumber"]}
          searchPlaceholder="Search by Payment ID or Vehicle..."
        />
      </div>
    </Layout>
  );
};

export default FineManagement;
