import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Loader2, PenTool, UploadCloud, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Button } from "../../components/ui/Button.jsx";

const ManualEntry = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    vehicleNumber: "",
    violationType: "",
    location: "",
    remarks: "",
  });
  const [manualFile, setManualFile] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data } = await api.get("/api/admin/rules");
        setRules(data || []);
      } catch (err) {
        console.error("Rules fetch failed");
      }
    };
    if (user?.token) fetchRules();
  }, [user]);

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!manualFile) return addToast("Proof image is required.", "warning");

    const formData = new FormData();
    formData.append("evidence", manualFile);
    formData.append("vehicleNumber", manualEntry.vehicleNumber);
    formData.append("violationType", manualEntry.violationType);
    formData.append("location", manualEntry.location);
    formData.append("remarks", manualEntry.remarks);
    formData.append("date", new Date().toISOString());

    setUploading(true);
    addToast("Registering violation...", "info");

    try {
      await api.post("/api/violations/manual", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("Violation registered successfully.", "success");
      setManualEntry({
        vehicleNumber: "",
        violationType: "",
        location: "",
        remarks: "",
      });
      setManualFile(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Registration failed.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="Manual Violation Entry">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
        
        <Card className="card-enterprise border-t-0 border-l-[6px] border-l-amber-500 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-[80px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
          
          <CardHeader className="pb-8 pt-10 px-10">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-amber-600 rounded-2xl flex items-center justify-center border border-slate-100">
                <PenTool size={32} />
              </div>
              <div>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Manual Entry</CardTitle>
                <CardDescription className="text-base mt-2 text-slate-500/90 leading-relaxed max-w-lg">Record a traffic violation manually by uploading photographic evidence and details.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-10 pb-10">
            <form
              onSubmit={handleManualEntry}
              className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">
                    Vehicle Plate Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="BA 1 PA 1234"
                    value={manualEntry.vehicleNumber}
                    onChange={(e) =>
                      setManualEntry({
                        ...manualEntry,
                        vehicleNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="uppercase font-mono text-xl tracking-wider font-bold bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20 py-6"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">
                    Violation Type <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={manualEntry.violationType}
                    onChange={(e) =>
                      setManualEntry({
                        ...manualEntry,
                        violationType: e.target.value,
                      })
                    }
                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20 py-3"
                    required>
                    <option value="">Select Infraction Type</option>
                    {rules.map((r) => (
                      <option key={r._id} value={r.violationType}>
                        {r.violationType}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">
                    Location <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g., Kalanki Checkpost"
                    value={manualEntry.location}
                    onChange={(e) =>
                      setManualEntry({
                        ...manualEntry,
                        location: e.target.value,
                      })
                    }
                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20 py-6"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">
                    Officer Remarks
                  </Label>
                  <Textarea
                    rows={4}
                    value={manualEntry.remarks}
                    onChange={(e) =>
                      setManualEntry({
                        ...manualEntry,
                        remarks: e.target.value,
                      })
                    }
                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-amber-400/20"
                    placeholder="Add contextual details about the incident..."
                  />
                </div>
                
                <div className="space-y-3 flex-1 flex flex-col">
                  <Label className="text-slate-700 font-semibold uppercase tracking-wider text-xs">
                    Photographic Proof <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative flex-1 group">
                    <input
                      type="file"
                      onChange={(e) => setManualFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*"
                      required
                    />
                    <div className={`h-full min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-300 ${manualFile ? 'border-amber-500 bg-amber-50/50 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)]' : 'border-slate-300/60 bg-slate-50/50 hover:bg-slate-50 hover:border-amber-400 hover:shadow-md'}`}>
                      {manualFile ? (
                        <>
                          <ImageIcon size={32} className="text-amber-500 mb-3" />
                          <p className="text-base font-bold text-amber-700 max-w-[200px] truncate">{manualFile.name}</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-3 group-hover:text-amber-500 group-hover:-translate-y-1 transition-all">
                            <UploadCloud size={24} className={manualFile ? "text-amber-500" : "text-slate-400"} />
                          </div>
                          <p className="text-sm font-medium text-slate-600">Click or drag image to upload</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-8 mt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={uploading || !manualFile || !manualEntry.vehicleNumber || !manualEntry.violationType}
                  className="w-full py-7 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {uploading ? (
                    <><Loader2 className="animate-spin mr-3" size={24} /> Registering Violation...</>
                  ) : (
                    "Submit Violation Record"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManualEntry;
