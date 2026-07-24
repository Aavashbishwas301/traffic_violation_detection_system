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
        
        <Card className="shadow-lg border-t-4 border-t-amber-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>
          
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <PenTool size={24} />
              </div>
              <div>
                <CardTitle className="text-3xl text-slate-900">Manual Entry</CardTitle>
                <CardDescription className="text-base mt-1">Record a traffic violation manually by uploading photographic evidence and details.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleManualEntry}
              className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-900">
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
                    className="uppercase font-mono text-lg tracking-wider font-bold"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-900">
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
                    required>
                    <option value="">Select Infraction Type</option>
                    {rules.map((r) => (
                      <option key={r._id} value={r.violationType}>
                        {r.violationType}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-900">
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
                    required
                  />
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="space-y-2">
                  <Label className="text-slate-900">
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
                    placeholder="Add contextual details about the incident..."
                  />
                </div>
                
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label className="text-slate-900">
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
                    <div className={`h-full min-h-[120px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 ${manualFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}>
                      {manualFile ? (
                        <>
                          <ImageIcon size={28} className="text-emerald-600 mb-2" />
                          <p className="text-sm font-bold text-emerald-700 max-w-[200px] truncate">{manualFile.name}</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={28} className="text-slate-400 mb-2 group-hover:-translate-y-1 transition-transform" />
                          <p className="text-sm font-medium text-slate-600">Upload Image</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-6 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={uploading || !manualFile || !manualEntry.vehicleNumber || !manualEntry.violationType}
                  className="w-full py-6 text-base shadow-lg"
                >
                  {uploading ? (
                    <><Loader2 className="animate-spin mr-3" size={20} /> Registering Violation...</>
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
