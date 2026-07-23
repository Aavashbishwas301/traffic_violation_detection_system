import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Eye, Search } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";
import { resolveImageUrl } from "../../utils/helpers.js";

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
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
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
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Evidence Vault.
            </h3>
            <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">
              Centralized repository of violation proofs.
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by plate or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-neutral-100 rounded-xl text-xs font-bold uppercase outline-none focus:border-primary-900"
            />
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((v) => (
            <div
              key={v._id}
              className="bg-white border border-neutral-100 rounded-3xl overflow-hidden aspect-square flex flex-col shadow-xl group cursor-pointer relative hover:-translate-y-2 transition-all"
              onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}>
              <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={resolveImageUrl(v.imageUrl || v.evidenceUrl)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt="Evidence"
                />
              </div>
              <div className="p-4 bg-white border-t border-neutral-50 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black uppercase text-primary-950 italic truncate max-w-[120px]">
                    {v.violationType}
                  </p>
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                    {new Date(v.violationDateTime).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[9px] font-black text-accent-crimson border border-accent-crimson/20 px-1.5 py-0.5 rounded-md">
                  {v.vehicleId?.vehicleNumber || "UNKN"}
                </span>
              </div>
              <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="text-white" size={24} />
              </div>
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
              No evidence photos found.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EvidenceVault;
