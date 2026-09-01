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
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              Citizen Complaints ({complaints.length})
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Review and respond to violation disputes submitted by registered vehicle owners.
            </p>
          </div>
        </div>

        <DataTable 
          data={complaints}
          columns={[
            {
              header: "Owner",
              accessorKey: "ownerId.fullName",
              sortable: true,
              className: "font-medium text-slate-900",
              cell: (c) => (
                <div>
                  <p className="font-semibold text-slate-900">{c.ownerId?.fullName || "Suresh Kumar"}</p>
                  <p className="text-xs text-slate-500">{c.ownerId?.email || ""}</p>
                </div>
              )
            },
            {
              header: "Vehicle & Violation",
              accessorKey: "violationId.vehicleId.vehicleNumber",
              sortable: true,
              cell: (c) => (
                <div className="space-y-1">
                  <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {c.violationId?.vehicleId?.vehicleNumber || "BA 2 PA 1234"}
                  </span>
                  <p className="text-xs text-primary-700 font-medium">
                    {c.violationId?.violationTypeId?.violationName || "Traffic Violation"}
                  </p>
                </div>
              )
            },
            {
              header: "Complaint Details",
              accessorKey: "complaintMessage",
              sortable: true,
              className: "text-slate-700 max-w-sm",
              cell: (c) => (
                <div>
                  <p className="text-sm text-slate-800 line-clamp-2">{c.complaintMessage}</p>
                  {c.adminResponse && (
                    <p className="text-xs text-emerald-600 mt-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      <strong>Admin Response:</strong> {c.adminResponse}
                    </p>
                  )}
                </div>
              )
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              cell: (c) => (
                <Badge variant={c.status === 'Resolved' ? 'success' : 'warning'}>
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
                      const resp = prompt("Enter resolution message for citizen:");
                      if (resp) updateComplaint(c._id, "Resolved", resp);
                    }}
                  >
                    Resolve Dispute
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600">✓ Resolved</span>
                )
              )
            }
          ]}
          searchKey={["ownerId.fullName", "violationId.vehicleId.vehicleNumber", "complaintMessage"]}
          searchPlaceholder="Search by Owner, Vehicle, or message..."
        />
      </div>
    </Layout>
  );
};

export default CitizenComplaints;
