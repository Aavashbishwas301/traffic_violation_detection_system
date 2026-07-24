import React, { useState } from "react";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Upload, Cpu, Zap, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Button } from "../../components/ui/Button.jsx";

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
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
        
        <Card className="border-t-4 border-t-primary-600 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-bl-full -z-10 opacity-50"></div>
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <Cpu size={24} />
              </div>
              <div>
                <CardTitle className="text-3xl text-slate-900">AI Scanner Node</CardTitle>
                <CardDescription className="text-base mt-1">Upload CCTV footage or images for automated violation detection via the Vision Model.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAIDetect} className="space-y-8">
              
              <div className="relative group">
                <input
                  type="file"
                  onChange={(e) => setDetectFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/jpeg,image/png,video/mp4"
                />
                <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${detectFile ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary-300'}`}>
                  <div className="space-y-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-transform duration-500 ${detectFile ? 'bg-primary-100 text-primary-600 scale-110' : 'bg-white text-slate-400 shadow-sm'}`}>
                      {detectFile ? (
                        detectFile.type.includes('video') ? <Video size={32} /> : <ImageIcon size={32} />
                      ) : (
                        <Upload size={32} className="group-hover:-translate-y-1 transition-transform" />
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${detectFile ? 'text-primary-700' : 'text-slate-700'}`}>
                        {detectFile ? detectFile.name : "Click or drag to upload footage"}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
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
                disabled={uploading || !detectFile}
                className="w-full py-6 text-base shadow-lg"
              >
                {uploading ? (
                  <><Loader2 className="animate-spin mr-3" size={20} /> Processing via AI Engine...</>
                ) : (
                  <><Zap className="mr-2" size={20} /> Initiate Detection Scan</>
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
