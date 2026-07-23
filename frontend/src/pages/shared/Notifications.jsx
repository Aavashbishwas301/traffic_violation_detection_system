import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { Bell, Cpu } from "lucide-react";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/api/admin/notifications");
        setNotifications(data);
      } catch (err) {
        console.error("Notification fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchNotifications();
  }, [user]);

  if (loading) {
    return (
      <Layout title="Notifications">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Cpu className="text-primary-950 animate-spin" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
            Fetching Messages...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Notifications">
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in pb-20">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">
          Notifications
        </h3>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className="bg-white border border-neutral-100 rounded-2xl p-6 flex items-center space-x-4 hover:border-primary-900/20 transition-all group shadow-sm hover:shadow-md">
              <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-primary-900/5 transition-colors">
                <Bell size={18} className="text-primary-900" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent-crimson">
                    {n.title}
                  </span>
                  <span className="text-[9px] font-bold text-neutral-300 uppercase">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase italic text-neutral-500 tracking-tight leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
            No notifications found.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
