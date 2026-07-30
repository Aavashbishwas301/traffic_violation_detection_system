import React, { useState } from "react";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Upload, Cpu, Zap, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Button } from "../../components/ui/Button.jsx";

import { useSocket } from "../../context/SocketContext.jsx";

const AIScan = () => {
  const { addToast } = useToast();
  const { socket } = useSocket();
  const [detectFile, setDetectFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detectMeta, setDetectMeta] = useState({
    location: "Koteshwor Intersection",
  });

  React.useEffect(() => {
    if (!socket) return;

    const handleProcessed = (data) => {
      if (data.status === "completed") {
        addToast(
          `Detection Complete! Found ${data.resultsCount} violations for vehicle ${data.vehicleNumber}.`,
          "success"
        );
      } else {
        addToast(`AI Detection Failed: ${data.error}`, "error");
      }
      setUploading(false);
    };

    socket.on("violation_processed", handleProcessed);

    return () => {
      socket.off("violation_processed", handleProcessed);
    };
  }, [socket, addToast]);

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
      const { data } = await api.post("/api/violations/upload", formData, {
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
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
        
        <Card className="card-enterprise border-t-0 border-l-[6px] border-l-primary-600 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-100/40 rounded-full blur-[80px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <CardHeader className="pb-8 pt-10 px-10">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-primary-600 rounded-2xl flex items-center justify-center border border-slate-100">
                <Cpu size={32} />
              </div>
              <div>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">AI Scanner Node</CardTitle>
                <CardDescription className="text-base mt-2 text-slate-500/90 leading-relaxed max-w-lg">Upload CCTV footage or field images. The Vision Model will automatically detect traffic violations and index license plates.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAIDetect} className="space-y-8">
              
              <div className="relative group">
                <input
                  type="file"
                  onChange={(e) => setDetectFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                  accept="image/jpeg,image/png,video/mp4"
                />
                <div className={`relative overflow-hidden border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-500 ${detectFile ? 'border-primary-500 bg-primary-50/30 shadow-[inset_0_0_50px_rgba(59,130,246,0.05)]' : 'border-slate-300/60 bg-slate-50/50 hover:bg-slate-50 hover:border-primary-400 hover:shadow-lg'}`}>
                  
                  {uploading && (
                    <div className="absolute inset-0 border-4 border-primary-500 rounded-3xl animate-pulse pointer-events-none"></div>
                  )}

                  <div className="space-y-6 relative z-10">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-700 ${detectFile ? 'bg-primary-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110' : 'bg-white text-slate-400 shadow-sm border border-slate-100 group-hover:text-primary-500 group-hover:scale-105'}`}>
                      {detectFile ? (
                        detectFile.type.includes('video') ? <Video size={36} /> : <ImageIcon size={36} />
                      ) : (
                        <Upload size={36} className="group-hover:-translate-y-1 transition-transform duration-300" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xl font-bold tracking-tight ${detectFile ? 'text-primary-900' : 'text-slate-700'}`}>
                        {detectFile ? detectFile.name : "Click or drag to upload footage"}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-3">
                        JPG, PNG, MP4 • MAX 100MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-900">
                  Detection Location <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={detectMeta.location}
                  onChange={(e) =>
                    setDetectMeta({ ...detectMeta, location: e.target.value })
                  }
                  placeholder="e.g., Koteshwor Intersection"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full py-7 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                {uploading ? (
                  <><Loader2 className="animate-spin mr-3" size={24} /> Analyzing via AI Engine...</>
                ) : (
                  <><Zap className="mr-3" size={24} /> Initiate Detection Scan</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
};

export default AIScan;
