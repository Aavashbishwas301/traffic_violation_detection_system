import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { CheckCircle2, XCircle, Eye, ShieldCheck, Loader2 } from "lucide-react";
import { resolveImageUrl } from "../../utils/helpers.js";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const VerifyDesk = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchViolations = async () => {
    try {
      const { data } = await api.get("/api/violations");
      setViolations(
        Array.isArray(data) ? data : data.violations || [],
      );
    } catch (err) {
      console.error("Violation fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchViolations();
  }, [user]);

  const updateStatus = async (id, status, remarks) => {
    setActionLoading(id);
    try {
      await api.patch(`/api/violations/${id}/status`, { status, remarks });
      addToast(`Violation ${status.toLowerCase()} successfully.`, "success");
      fetchViolations();
    } catch (err) {
      addToast("Failed to update violation status.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const viewEvidence = (path) => {
    if (!path) return addToast("No evidence found.", "warning");
    window.open(resolveImageUrl(path), "_blank");
  };

  if (loading) {
    return (
      <Layout title="Verification Desk">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Verification Desk">
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex flex-col space-y-2 border-b border-slate-200 pb-4">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Verification Desk
          </h3>
          <p className="text-sm text-slate-500">Review and verify AI-detected violations before finalizing the penalty.</p>
        </div>

        <DataTable 
          data={violations}
          columns={[
            {
              header: "Record ID",
              accessorKey: "_id",
              sortable: true,
              cell: (v) => (
                <span className="font-mono text-xs text-slate-500">
                  #{v._id.slice(-6)}
                </span>
              )
            },
            {
              header: "Plate No.",
              accessorKey: "vehicleId.vehicleNumber",
              sortable: true,
              cell: (v) => (
                <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                  {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                </span>
              )
            },
            {
              header: "Violation Type",
              accessorKey: "violationType",
              sortable: true,
              className: "font-medium text-slate-900"
            },
            {
              header: "AI Confidence",
              accessorKey: "aiConfidence",
              sortable: true,
              cell: (v) => (
                <div className="flex items-center space-x-3 w-32">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                    <div
                      className={`h-full ${(v.aiConfidence || 0.8) > 0.85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{
                        width: `${(v.aiConfidence || 0.8) * 100}%`,
                      }}></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-10 text-right">
                    {((v.aiConfidence || 0.8) * 100).toFixed(1)}%
                  </span>
                </div>
              )
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              cell: (v) => (
                <Badge 
                  variant={v.status === 'Verified' ? 'default' : v.status === 'Pending' ? 'secondary' : 'destructive'}
                  className={
                    v.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200' : 
                    v.status === 'Pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' : 
                    'bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200'
                  }
                >
                  {v.status}
                </Badge>
              )
            },
            {
              header: "Actions",
              accessorKey: "actions",
              sortable: false,
              align: "right",
              className: "text-right",
              cell: (v) => (
                <div className="flex items-center justify-end space-x-2">
                  {v.status === "Pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === v._id}
                        onClick={() => updateStatus(v._id, "Verified", "Verified by Officer")}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-white"
                        title="Approve"
                      >
                        {actionLoading === v._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === v._id}
                        onClick={() => updateStatus(v._id, "Rejected", "Manual Rejection")}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 bg-white"
                        title="Reject"
                      >
                        {actionLoading === v._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}
                    className="text-primary-600 hover:bg-primary-50"
                    title="View Evidence"
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              )
            }
          ]}
          searchKey={["_id", "vehicleId.vehicleNumber"]}
          searchPlaceholder="Search by Plate No. or Record ID..."
        />
      </div>
    </Layout>
  );
};

export default VerifyDesk;
