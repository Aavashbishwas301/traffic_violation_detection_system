import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { CheckCircle2, XCircle, Eye, ShieldCheck, Loader2, Edit3, Save } from "lucide-react";
import { resolveImageUrl } from "../../utils/helpers.js";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";

const VerifyDesk = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Edit Plate Modal State
  const [editingViolation, setEditingViolation] = useState(null);
  const [editPlateNumber, setEditPlateNumber] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleOpenEditModal = (v) => {
    setEditingViolation(v);
    setEditPlateNumber(v.vehicleId?.vehicleNumber || "");
    setEditRemarks(v.remarks || "");
  };

  const handleSavePlateCorrection = async (e) => {
    e.preventDefault();
    if (!editPlateNumber.trim()) {
      return addToast("Please enter a valid license plate number.", "warning");
    }

    setSavingEdit(true);
    try {
      await api.put(`/api/violations/${editingViolation._id}`, {
        vehicleNumber: editPlateNumber.trim(),
        remarks: editRemarks.trim() || "Plate manually corrected by Officer",
        status: "Verified"
      });

      addToast(`Plate corrected to "${editPlateNumber}" and verified.`, "success");
      setEditingViolation(null);
      fetchViolations();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update plate number.", "error");
    } finally {
      setSavingEdit(false);
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
          <p className="text-sm text-slate-500">Review, verify, and correct AI-detected license plates before penalty finalization.</p>
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
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                    {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(v)}
                    className="text-slate-400 hover:text-primary-600 transition-colors p-1"
                    title="Correct Plate Number"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
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
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                    <div
                      className={`h-full ${
                        (v.aiConfidence || 0.8) >= 0.75 
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                          : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (v.aiConfidence || 0.8) * 100)}%`,
                      }}></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-10 text-right">
                    {((v.aiConfidence || 0.8) * 100).toFixed(1)}%
                  </span>
                </div>
              )
            },
            {
              header: "Remarks / Status",
              accessorKey: "remarks",
              sortable: false,
              cell: (v) => (
                <span className={`text-xs ${v.remarks?.includes("Review Required") ? "text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200" : "text-slate-500"}`}>
                  {v.remarks || "Standard Detection"}
                </span>
              )
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              cell: (v) => (
                <Badge 
                  variant={v.status === 'Verified' ? 'default' : v.status === 'Unverified' || v.status === 'Pending' ? 'secondary' : 'destructive'}
                  className={
                    v.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200' : 
                    v.status === 'Unverified' || v.status === 'Pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' : 
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
                  {(v.status === "Unverified" || v.status === "Pending") && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === v._id}
                        onClick={() => updateStatus(v._id, "Verified", "Verified by Officer")}
                        className="text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Approve Violation"
                      >
                        {actionLoading === v._id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === v._id}
                        onClick={() => updateStatus(v._id, "Rejected", "Manual Rejection by Officer")}
                        className="text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Reject Violation"
                      >
                        {actionLoading === v._id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
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
          searchKey={["_id", "vehicleId.vehicleNumber", "remarks"]}
          searchPlaceholder="Search by Plate No. or Record ID..."
        />

        {/* --- CORRECTION MODAL --- */}
        {editingViolation && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
                  <Edit3 className="text-primary-600" size={20} />
                  <span>Correct License Plate</span>
                </div>
                <button
                  onClick={() => setEditingViolation(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePlateCorrection} className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-500 font-semibold uppercase">Current Record ID</Label>
                  <p className="font-mono text-sm text-slate-700 font-medium mt-1">#{editingViolation._id}</p>
                </div>

                <div>
                  <Label className="text-xs text-slate-700 font-semibold">Corrected License Plate Number *</Label>
                  <Input
                    value={editPlateNumber}
                    onChange={(e) => setEditPlateNumber(e.target.value)}
                    placeholder="e.g. BA 21 CHA 1234 or बा २१ च १२३४"
                    className="font-mono font-bold mt-1 text-base tracking-wide"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Supports Nepali Devanagari and Embossed Latin formats.</p>
                </div>

                <div>
                  <Label className="text-xs text-slate-700 font-semibold">Officer Audit Remarks</Label>
                  <Input
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="e.g. Corrected character from camera zoom"
                    className="mt-1 text-sm"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingViolation(null)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingEdit}
                    className="bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2"
                  >
                    {savingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>Save & Verify</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifyDesk;
