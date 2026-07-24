import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { CheckCircle2, XCircle, Eye, ShieldCheck, Loader2 } from "lucide-react";
import { resolveImageUrl } from "../../utils/helpers.js";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table.jsx";
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

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-600 w-[100px]">Record ID</TableHead>
                    <TableHead className="font-semibold text-slate-600">Plate No.</TableHead>
                    <TableHead className="font-semibold text-slate-600">Violation Type</TableHead>
                    <TableHead className="font-semibold text-slate-600">AI Confidence</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((v) => (
                    <TableRow key={v._id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500">
                        #{v._id.slice(-6)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                          {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {v.violationType}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3 w-32">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                            <div
                              className={`h-full ${(v.aiConfidence || 0.8) > 0.85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{
                                width: `${(v.aiConfidence || 0.8) * 100}%`,
                              }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-10 text-right">
                            {(v.aiConfidence * 100 || 80).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                  {violations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                           <ShieldCheck size={32} className="mb-2 text-slate-300" />
                           <p>No records pending verification.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VerifyDesk;
