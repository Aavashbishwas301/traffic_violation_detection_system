import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Plus, Edit3, X, Save, Trash2 } from "lucide-react";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Button } from "../../components/ui/Button.jsx";

const TrafficRules = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRule, setCurrentRule] = useState(null); // null = add, object = edit
  const [formData, setFormData] = useState({
    violationType: "",
    fineAmount: "",
    description: "",
    isActive: true,
  });

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

  const openAddModal = () => {
    setCurrentRule(null);
    setFormData({ violationType: "", fineAmount: "", description: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setCurrentRule(rule);
    setFormData({
      violationType: rule.violationType,
      fineAmount: rule.fineAmount,
      description: rule.description || "",
      isActive: rule.isActive,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.violationType || !formData.fineAmount) {
      return addToast("Please fill in required fields.", "warning");
    }

    setIsSubmitting(true);
    try {
      if (currentRule) {
        // Edit logic (Assuming your backend API accepts POST to /rules for updating based on name, as seen in original code)
        await api.post("/api/admin/rules", {
          violationType: formData.violationType,
          fineAmount: Number(formData.fineAmount),
          description: formData.description,
          isActive: formData.isActive,
        });
        addToast("Rule updated successfully.", "success");
      } else {
        // Add logic
        await api.post("/api/admin/rules", {
          violationType: formData.violationType,
          fineAmount: Number(formData.fineAmount),
          description: formData.description,
          isActive: formData.isActive,
        });
        addToast("Rule added successfully.", "success");
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (err) {
      addToast(err.response?.data?.message || "Operation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Are you sure you want to delete this rule? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/api/admin/rules/${ruleId}`);
      addToast("Rule deleted successfully.", "success");
      fetchRules();
    } catch (err) {
      addToast("Failed to delete rule.", "error");
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
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20 relative">
        
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
            onClick={openAddModal}
            className="bg-primary-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center space-x-2 shadow-2xl hover:bg-black transition-all hover:scale-105">
            <Plus size={16} /> <span>Add New Rule</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rules.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-neutral-100 rounded-[48px] p-10 shadow-2xl space-y-8 relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div
                className={`absolute top-0 left-0 w-2 h-full ${
                  r.isActive ? "bg-accent-emerald" : "bg-neutral-200"
                }`}></div>
              <div className="flex justify-between items-start">
                <h4 className="text-xl font-black italic uppercase tracking-tighter text-primary-950 underline decoration-accent-crimson/20 underline-offset-8 leading-tight max-w-[70%]">
                  {r.violationType}
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                    r.isActive
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-neutral-50 text-neutral-400 border-neutral-200"
                  }`}>
                  {r.isActive ? "ACTIVE" : "OFF"}
                </span>
              </div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase italic leading-relaxed">
                {r.description || "No description provided."}
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
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDeleteRule(r._id)}
                    className="p-4 bg-rose-50 text-rose-500 rounded-[24px] shadow-sm hover:shadow-xl hover:bg-rose-500 hover:text-white hover:-rotate-12 transition-all">
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-4 bg-primary-950 text-white rounded-[24px] shadow-xl hover:rotate-12 hover:bg-accent-crimson transition-all">
                    <Edit3 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest shadow-sm">
              No rules found.
            </div>
          )}
        </div>

      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-slide-up">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
                {currentRule ? "Update Rule." : "Add New Rule."}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-8 space-y-6">
              
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Violation Type <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Zebra Crossing"
                  value={formData.violationType}
                  onChange={(e) => setFormData({ ...formData, violationType: e.target.value })}
                  disabled={!!currentRule} // Disable editing the name if it acts as the ID key in your API
                  className={currentRule ? "bg-slate-50 text-slate-500 border-slate-200" : ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Fine Amount (NPR) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.fineAmount}
                  onChange={(e) => setFormData({ ...formData, fineAmount: e.target.value })}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Description
                </Label>
                <textarea
                  placeholder="Describe the violation rule..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl font-bold px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-xl font-bold px-8 shadow-lg hover:-translate-y-0.5 transition-transform"
                >
                  {isSubmitting ? "Saving..." : <><Save size={16} className="mr-2" /> Save Rule</>}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default TrafficRules;
