import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Eye, Search, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";
import { resolveImageUrl } from "../../utils/helpers.js";
import { Input } from "../../components/ui/Input.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const EvidenceVault = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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
    if (user?.token) fetchViolations();
  }, [user]);

  const viewEvidence = (path) => {
    if (!path) return addToast("No evidence found.", "warning");
    window.open(resolveImageUrl(path), "_blank");
  };

  if (loading) {
    return (
      <Layout title="Evidence Management">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  const photos = violations.filter(
    (v) =>
      (v.imageUrl || v.evidenceUrl) &&
      (v.vehicleId?.vehicleNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        v.violationType.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <Layout title="Evidence Management">
      <div className="space-y-6 animate-fade-in pb-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Evidence Vault
            </h3>
            <p className="text-sm text-slate-500">
              Centralized visual repository of violation proofs and CCTV snapshots.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="text"
              placeholder="Search plate or infraction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {photos.map((v) => (
            <div
              key={v._id}
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all cursor-pointer relative"
              onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}>
              
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative">
                <img
                  src={resolveImageUrl(v.imageUrl || v.evidenceUrl)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Evidence"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="text-white" size={32} />
                </div>
              </div>
              
              <div className="p-3 border-t border-slate-100 flex flex-col space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate" title={v.violationType}>
                    {v.violationType}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    {v.vehicleId?.vehicleNumber || "UNKN"}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {new Date(v.violationDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {photos.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500">
               <ImageIcon size={40} className="mb-3 text-slate-300" />
               <p className="font-medium text-slate-900">No evidence found</p>
               <p className="text-sm">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EvidenceVault;
