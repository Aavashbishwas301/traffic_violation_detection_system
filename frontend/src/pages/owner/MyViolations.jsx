import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { ShieldCheck, Receipt, Calendar, MapPin, Car, Image as ImageIcon, CreditCard, Loader2 } from "lucide-react";
import { resolveImageUrl } from "../../utils/helpers.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const MyViolations = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState({});

  const fetchViolations = async () => {
    try {
      const { data } = await api.get("/api/violations/my");
      setViolations(data);
    } catch (err) {
      console.error("Violation fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchViolations();
  }, [user]);

  const handlePay = async (id, method, fineId) => {
    const payKey = `${id}-${method}`;
    setPayLoading((prev) => ({ ...prev, [payKey]: true }));
    try {
      const targetId = fineId || id;

      if (method === "khalti") {
        const { data } = await api.post("/api/payments/khalti/initiate", {
          fineId: targetId,
        });
        window.location.href = data.url;
      } else if (method === "esewa") {
        const { data } = await api.post("/api/payments/esewa/initiate", {
          fineId: targetId,
        });

        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", data.url);

        for (const key in data.formData) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", data.formData[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        await api.post(`/api/payments/${targetId}/pay`, {});
        addToast("Payment Successful", "success");
        fetchViolations();
      }
    } catch (err) {
      console.error(err);
      addToast("Payment failed. Please try again.", "error");
    } finally {
      setPayLoading((prev) => ({ ...prev, [payKey]: false }));
    }
  };

  const viewEvidence = (path) => {
    if (!path) return addToast("No evidence found.", "warning");
    window.open(resolveImageUrl(path), "_blank");
  };

  if (loading) {
    return (
      <Layout title="My Violations">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Violations">
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex flex-col space-y-2 border-b border-slate-200 pb-4">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Violations
          </h3>
          <p className="text-sm text-slate-500">Track your traffic incidents and settle pending fines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {violations.length > 0 ? (
            violations.map((v) => (
              <Card key={v._id} className={`overflow-hidden transition-all border-l-4 ${v.status === 'Paid' ? 'border-l-emerald-500' : 'border-l-rose-500 hover:shadow-md'}`}>
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{v.violationType}</CardTitle>
                      <CardDescription className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 w-fit">
                        {v.vehicleId?.vehicleNumber}
                      </CardDescription>
                    </div>
                    <Badge variant={v.status === "Paid" ? "default" : "destructive"} className={v.status === "Paid" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"}>
                      {v.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-start space-x-2">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{v.location}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Calendar size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{new Date(v.violationDateTime).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Fine Amount</p>
                      <p className="font-bold text-lg text-slate-900">NPR {v.appliedFineAmount || "0"}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-slate-600 border-slate-200"
                      onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}
                    >
                      <ImageIcon size={14} className="mr-2" /> Evidence
                    </Button>
                  </div>

                  {v.status !== "Paid" && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Settle Fine</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePay(v._id, "esewa", v.fine?._id)}
                          disabled={payLoading[`${v._id}-esewa`]}
                          className="bg-[#60bb46]/10 text-[#60bb46] border-[#60bb46]/30 hover:bg-[#60bb46]/20 h-9"
                        >
                          {payLoading[`${v._id}-esewa`] ? <Loader2 size={14} className="animate-spin" /> : "eSewa"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePay(v._id, "khalti", v.fine?._id)}
                          disabled={payLoading[`${v._id}-khalti`]}
                          className="bg-[#5d2e8e]/10 text-[#5d2e8e] border-[#5d2e8e]/30 hover:bg-[#5d2e8e]/20 h-9"
                        >
                          {payLoading[`${v._id}-khalti`] ? <Loader2 size={14} className="animate-spin" /> : "Khalti"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handlePay(v._id, "manual", v.fine?._id)}
                          disabled={payLoading[`${v._id}-manual`]}
                          className="h-9"
                        >
                          {payLoading[`${v._id}-manual`] ? <Loader2 size={14} className="animate-spin" /> : "Simulate"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="md:col-span-2 flex flex-col items-center justify-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-lg font-medium text-slate-900">Excellent Record!</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                We couldn't find any traffic violations associated with your account or registered vehicles.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyViolations;
