import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Megaphone } from "lucide-react";

const SystemNotifications = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [broadcast, setBroadcast] = useState({ title: "", message: "" });
  const [sending, setSending] = useState(false);

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) {
      return addToast("Fill all fields.", "warning");
    }

    setSending(true);
    try {
      await api.post("/api/admin/broadcast", broadcast);
      addToast("Broadcast sent to all users.", "success");
      setBroadcast({ title: "", message: "" });
    } catch (err) {
      addToast("Broadcast failed.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="System Notifications">
      <div className="max-w-2xl mx-auto space-y-12 animate-fade-in pb-20 text-center">
        <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none underline decoration-accent-crimson decoration-8 underline-offset-8">
          Send Alerts.
        </h3>
        <p className="text-[10px] font-black text-neutral-300 uppercase mt-8 tracking-[0.4em] italic">
          Send important announcements to everyone in the system
        </p>
        <form
          onSubmit={sendBroadcast}
          className="bg-white rounded-[56px] p-12 shadow-2xl border border-neutral-100 space-y-10 text-left mt-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4 italic">
              Message Title
            </label>
            <input
              type="text"
              placeholder="Example: System Update"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
              value={broadcast.title}
              onChange={(e) =>
                setBroadcast({ ...broadcast, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4 italic">
              Message Content
            </label>
            <textarea
              rows={5}
              placeholder="Type your message here..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 font-black text-xs outline-none focus:border-primary-950 uppercase italic"
              value={broadcast.message}
              onChange={(e) =>
                setBroadcast({ ...broadcast, message: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full py-7 bg-primary-950 text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-[10px] shadow-2xl hover:bg-black transition-all flex items-center justify-center space-x-4">
            <Megaphone size={20} />{" "}
            <span>{sending ? "Sending..." : "Send Announcement"}</span>
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default SystemNotifications;
