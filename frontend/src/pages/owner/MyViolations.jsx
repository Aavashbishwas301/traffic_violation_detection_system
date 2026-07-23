import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { ShieldCheck } from "lucide-react";

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
    if (!path) return addToast("No photo found.", "warning");
    window.open(
      `${api.defaults.baseURL}/${path.replace(/\\/g, "/")}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <Layout title="My Violations">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Violations">
      <div className="space-y-6 animate-fade-in pb-20">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">
          My Violations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {violations.length > 0 ? (
            violations.map((v) => (
              <div
                key={v._id}
                className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-primary-950 uppercase italic underline decoration-accent-crimson/20 underline-offset-4">
                    {v.violationType}
                  </h4>
                  <span
                    className={`text-2xs font-black px-2 py-0.5 rounded-lg uppercase ${v.status === "Paid" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                    {v.status}
                  </span>
                </div>
                <div className="mt-4 space-y-1 text-2xs font-bold text-neutral-400 uppercase italic">
                  <p>Location: {v.location}</p>
                  <p>Vehicle: {v.vehicleId?.vehicleNumber}</p>
                  <p>
                    Date:{" "}
                    {new Date(v.violationDateTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-black text-primary-950 italic text-sm">
                      NPR {v.fine?.amount || v.ruleId?.fineAmount || "0"}
                    </p>
                    <button
                      onClick={() =>
                        viewEvidence(v.imageUrl || v.evidenceUrl)
                      }
                      className="text-[10px] font-black uppercase text-primary-900 hover:underline">
                      See Photo
                    </button>
                  </div>
                  {v.status !== "Paid" && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handlePay(v._id, "esewa", v.fine?._id)
                        }
                        disabled={payLoading[`${v._id}-esewa`]}
                        className="bg-[#60bb46] text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50">
                        {payLoading[`${v._id}-esewa`]
                          ? "Processing..."
                          : "Pay with eSewa"}
                      </button>
                      <button
                        onClick={() =>
                          handlePay(v._id, "khalti", v.fine?._id)
                        }
                        disabled={payLoading[`${v._id}-khalti`]}
                        className="bg-[#5d2e8e] text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50">
                        {payLoading[`${v._id}-khalti`]
                          ? "Processing..."
                          : "Pay with Khalti"}
                      </button>
                      <button
                        onClick={() =>
                          handlePay(v._id, "manual", v.fine?._id)
                        }
                        disabled={payLoading[`${v._id}-manual`]}
                        className="bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase hover:bg-neutral-200 transition-all disabled:opacity-50">
                        {payLoading[`${v._id}-manual`]
                          ? "Processing..."
                          : "Simulate"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-[40px] border border-neutral-100 text-center space-y-4 col-span-full">
              <ShieldCheck
                size={48}
                className="mx-auto text-green-500 opacity-20"
              />
              <p className="text-xs font-black uppercase text-neutral-400 tracking-[0.4em] italic">
                No violations found.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyViolations;
