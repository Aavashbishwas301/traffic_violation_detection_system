import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const CitizenComplaints = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get("/api/admin/complaints");
      setComplaints(data || []);
    } catch (err) {
      console.error("Complaints fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchComplaints();
  }, [user]);

  const updateComplaint = async (id, status, responseText) => {
    try {
      await api.put(`/api/admin/complaints/${id}`, {
        status,
        adminResponse: responseText,
      });
      addToast("Complaint updated.", "success");
      fetchComplaints();
    } catch (err) {
      addToast("Update failed.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Citizen Complaints">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Citizen Complaints">
      <div className="space-y-6 animate-fade-in pb-20 h-full flex flex-col">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Citizen Complaints
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Review and respond to violation disputes submitted by citizens.
          </p>
        </div>

        <DataTable 
          data={complaints}
          columns={[
            {
              header: "Owner",
              accessorKey: "ownerId.fullName",
              sortable: true,
              className: "font-medium text-slate-900",
              cell: (c) => c.ownerId?.fullName || "Unknown"
            },
            {
              header: "Vehicle",
              accessorKey: "violationId.vehicleId.vehicleNumber",
              sortable: true,
              cell: (c) => <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">{c.violationId?.vehicleId?.vehicleNumber || "UNKNOWN"}</span>
            },
            {
              header: "Message",
              accessorKey: "complaintMessage",
              sortable: true,
              className: "text-slate-500 max-w-xs truncate"
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              cell: (c) => (
                <Badge variant={c.status === 'Resolved' ? 'success' : 'secondary'}>
                  {c.status}
                </Badge>
              )
            },
            {
              header: "Action",
              accessorKey: "actions",
              sortable: false,
              align: "right",
              className: "text-right",
              cell: (c) => (
                c.status === "Pending" ? (
                  <Button 
                    size="sm"
                    onClick={() => {
                      const resp = prompt("Enter resolution message:");
                      if (resp) updateComplaint(c._id, "Resolved", resp);
                    }}
                  >
                    Resolve
                  </Button>
                ) : (
                  <span className="text-sm text-slate-400">Resolved</span>
                )
              )
            }
          ]}
          searchKey={["ownerId.fullName", "violationId.vehicleId.vehicleNumber"]}
          searchPlaceholder="Search by Owner or Vehicle..."
        />
      </div>
    </Layout>
  );
};

export default CitizenComplaints;
