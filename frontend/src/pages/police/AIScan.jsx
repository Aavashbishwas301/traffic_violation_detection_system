import React, { useState } from "react";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Upload, Cpu, Zap } from "lucide-react";

const AIScan = () => {
  const { addToast } = useToast();
  const [detectFile, setDetectFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detectMeta, setDetectMeta] = useState({
    location: "Koteshwor Intersection",
  });

  const handleAIDetect = async (e) => {
    e.preventDefault();
    if (!detectFile) return addToast("Please select a file.", "warning");

    const formData = new FormData();
    formData.append("evidence", detectFile);
    formData.append("location", detectMeta.location);
    formData.append("date", new Date().toISOString());

    setUploading(true);
    addToast("Uploading to AI Engine...", "info");

    try {
      const { data } = await api.post("/api/violations/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast(data.message || "Detection task queued.", "success");
      setDetectFile(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Detection failed. Try again.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="AI Detection Console">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
        <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-neutral-100 space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-950/5 rounded-bl-[100px]"></div>
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              AI Scan.
            </h3>
            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.4em] mt-2 italic border-l-4 border-accent-crimson pl-6">
              Upload CCTV footage or images for automated violation
              detection.
            </p>
          </div>

          <form onSubmit={handleAIDetect} className="space-y-8">
            <div className="border-4 border-dashed border-neutral-100 rounded-[40px] p-12 text-center hover:border-primary-900/20 transition-all group cursor-pointer relative">
              <input
                type="file"
                onChange={(e) => setDetectFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="space-y-4">
                <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="text-primary-900" size={32} />
                </div>
                <div>
                  <p className="text-sm font-black italic text-primary-950 uppercase">
                    {detectFile
                      ? detectFile.name
                      : "Click to Upload CCTV/Photo"}
                  </p>
                  <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest mt-1 italic">
                    JPG, PNG, MP4 • MAX 100MB
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">
                Detection Location
              </label>
              <input
                type="text"
                value={detectMeta.location}
                onChange={(e) =>
                  setDetectMeta({ ...detectMeta, location: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-6 bg-primary-950 text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-black transition-all flex items-center justify-center space-x-4">
              {uploading ? (
                <Cpu className="animate-spin" size={24} />
              ) : (
                <>
                  <Zap size={18} /> <span>Initiate AI Engine</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AIScan;
