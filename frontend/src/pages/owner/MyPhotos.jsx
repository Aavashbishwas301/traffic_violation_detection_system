import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Eye, Image as ImageIcon } from "lucide-react";

const MyPhotos = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (user?.token) fetchViolations();
  }, [user]);

  const viewEvidence = (path) => {
    if (!path) return addToast("No photo found.", "warning");
    window.open(
      `${api.defaults.baseURL}/${path.replace(/\\/g, "/")}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <Layout title="My Photos">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const photos = violations.filter((v) => v.imageUrl || v.evidenceUrl);

  return (
    <Layout title="My Photos">
      <div className="space-y-6 animate-fade-in pb-20">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">
          My Photos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((v) => (
            <div
              key={v._id}
              className="bg-white border border-neutral-100 rounded-3xl overflow-hidden aspect-square flex flex-col shadow-xl group cursor-pointer relative hover:-translate-y-2 transition-all"
              onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}>
              <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={`${api.defaults.baseURL}/${(v.imageUrl || v.evidenceUrl).replace(/\\/g, "/")}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt="Evidence"
                />
              </div>
              <div className="p-4 bg-white border-t border-neutral-50">
                <p className="text-[9px] font-black uppercase text-primary-950 italic truncate">
                  {v.violationType}
                </p>
                <p className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest mt-0.5">
                  {new Date(v.violationDateTime).toLocaleDateString()}
                </p>
              </div>
              <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="text-white" size={24} />
              </div>
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">
              No photos found.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyPhotos;
