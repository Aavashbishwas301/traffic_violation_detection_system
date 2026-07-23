import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Plus, Edit3 } from "lucide-react";

const TrafficRules = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const { data } = await api.get("/api/admin/rules");
      setRules(data || []);
    } catch (err) {
      console.error("Rules fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchRules();
  }, [user]);

  const handleAddRule = async () => {
    const type = prompt("Enter violation type name:");
    if (!type) return;
    const amount = prompt("Enter fine amount (NPR):");
    if (!amount) return;
    const desc = prompt("Enter description (optional):");

    try {
      await api.post("/api/admin/rules", {
        violationType: type,
        fineAmount: Number(amount),
        description: desc || "",
        isActive: true,
      });
      addToast("Rule added.", "success");
      fetchRules();
    } catch (err) {
      addToast("Failed to add rule.", "error");
    }
  };

  const handleEditRule = async (rule) => {
    const amount = prompt(`Current fine: NPR ${rule.fineAmount}. Enter new amount:`);
    if (!amount) return;

    try {
      await api.post("/api/admin/rules", {
        violationType: rule.violationType,
        fineAmount: Number(amount),
        description: rule.description,
        isActive: rule.isActive,
      });
      addToast("Rule updated.", "success");
      fetchRules();
    } catch (err) {
      addToast("Failed to update rule.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Traffic Rules">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Traffic Rules">
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-6">
          <div>
            <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Traffic Rules.
            </h3>
            <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 italic border-l-4 border-accent-crimson pl-6">
              Add or update violation types and fine amounts.
            </p>
          </div>
          <button
            onClick={handleAddRule}
            className="bg-primary-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center space-x-2 shadow-2xl hover:bg-black transition-all">
            <Plus size={16} /> <span>Add New Rule</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rules.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-neutral-100 rounded-[48px] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
              <div
                className={`absolute top-0 left-0 w-2 h-full ${
                  r.isActive ? "bg-accent-emerald" : "bg-neutral-200"
                }`}></div>
              <div className="flex justify-between items-start">
                <h4 className="text-xl font-black italic uppercase tracking-tighter text-primary-950 underline decoration-accent-crimson/20 underline-offset-8">
                  {r.violationType}
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                    r.isActive
                      ? "bg-green-50 text-green-600"
                      : "bg-neutral-50 text-neutral-400"
                  }`}>
                  {r.isActive ? "ACTIVE" : "OFF"}
                </span>
              </div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase italic leading-relaxed">
                {r.description}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                    Fine Amount
                  </p>
                  <p className="text-3xl font-black italic text-primary-950">
                    NPR {r.fineAmount}
                  </p>
                </div>
                <button
                  onClick={() => handleEditRule(r)}
                  className="p-4 bg-primary-950 text-white rounded-[24px] shadow-xl hover:rotate-12 transition-transform">
                  <Edit3 size={20} />
                </button>
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
              No rules found.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrafficRules;
