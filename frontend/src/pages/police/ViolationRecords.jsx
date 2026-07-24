import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Download, Filter, FileSpreadsheet, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

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
    addToast("Exporting CSV file...", "success");
  };

  if (loading) {
    return (
      <Layout title="Violation Records">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Violation Records">
      <div className="space-y-6 animate-fade-in pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Master Records Log
            </h3>
            <p className="text-sm text-slate-500">
              Historical database of all traffic offenses recorded system-wide.
            </p>
          </div>
          <div className="flex space-x-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={handleFilterByDate}
              className="flex-1 md:flex-none bg-white text-slate-700 hover:bg-slate-50"
            >
              <Filter size={16} className="mr-2" /> Today
            </Button>
            <Button
              onClick={handleExportCSV}
              className="flex-1 md:flex-none shadow-md hover:-translate-y-0.5 transition-transform"
            >
              <Download size={16} className="mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <DataTable 
          data={violations}
          columns={[
            {
              header: "Date/Time",
              accessorKey: "violationDateTime",
              sortable: true,
              cell: (v) => (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">{new Date(v.violationDateTime).toLocaleDateString()}</span>
                  <span className="text-xs">{new Date(v.violationDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )
            },
            {
              header: "Vehicle",
              accessorKey: "vehicleId.vehicleNumber",
              sortable: true,
              cell: (v) => (
                <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                  {v.vehicleId?.vehicleNumber || "UNKNOWN"}
                </span>
              )
            },
            {
              header: "Offense Type",
              accessorKey: "violationType",
              sortable: true,
              className: "font-medium text-slate-900"
            },
            {
              header: "Fine Amount",
              accessorKey: "appliedFineAmount",
              sortable: true,
              align: "right",
              className: "text-right font-medium text-slate-700",
              cell: (v) => `NPR ${v.appliedFineAmount || "0"}`
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              align: "center",
              className: "text-center",
              cell: (v) => (
                <Badge 
                  variant={
                    v.status === 'Paid' ? 'default' : 
                    v.status === 'Pending' ? 'secondary' : 
                    v.status === 'Rejected' ? 'destructive' : 'outline'
                  }
                  className={
                    v.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 
                    v.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100' : 
                    v.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100' :
                    'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }
                >
                  {v.status}
                </Badge>
              )
            }
          ]}
          searchKey={["vehicleId.vehicleNumber", "violationType"]}
          searchPlaceholder="Search by plate or offense..."
        />
      </div>
    </Layout>
  );
};

export default ViolationRecords;
