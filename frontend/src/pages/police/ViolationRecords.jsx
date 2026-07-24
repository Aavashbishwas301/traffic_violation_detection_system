import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";

const ViolationRecords = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const { data } = await api.get("/api/violations");
        setViolations(
          Array.isArray(data) ? data : data.violations || [],
        );
      } catch (err) {
        console.error("Violation fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchViolations();
  }, [user]);

  const handleFilterByDate = () => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = violations.filter(
      (v) =>
        new Date(v.violationDateTime).toISOString().split("T")[0] === today
    );
    addToast(
      `Records for today: ${filtered.length} violations found.`,
      "info"
    );
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Vehicle,Offense,Fine,Status\n" +
      violations
        .map(
          (v) =>
            `${new Date(v.violationDateTime).toLocaleDateString()},${
              v.vehicleId?.vehicleNumber || "UNKNOWN"
            },${v.violationType},NPR ${
              v.appliedFineAmount || "0"
            },${v.status}`
        )
        .join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute(
      "download",
      `violations_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Layout title="Violation Records">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Violation Records">
      <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">
              Violation Records.
            </h3>
            <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">
              Historical database of all traffic offenses recorded.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleFilterByDate}
              className="px-5 py-2.5 bg-neutral-100 rounded-xl text-[9px] font-black uppercase hover:bg-neutral-200 transition-all">
              Filter by Date
            </button>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 bg-primary-950 text-white rounded-xl text-[9px] font-black uppercase hover:bg-black transition-all shadow-lg shadow-primary-950/20">
              Export CSV
            </button>
          </div>
        </div>
        <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Vehicle</th>
                  <th className="px-6 py-5">Offense</th>
                  <th className="px-6 py-5">Fine</th>
                  <th className="px-6 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                {violations.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-neutral-400">
                      {new Date(v.violationDateTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-primary-950 font-black tracking-tighter">
                      {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {v.violationType}
                    </td>
                    <td className="px-6 py-4 text-xs font-black italic text-green-600">
                      NPR {v.appliedFineAmount || "0"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[9px] ${
                          v.status === "Paid"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : v.status === "Pending"
                            ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                            : v.status === "Rejected"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {violations.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-neutral-300 italic">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViolationRecords;
