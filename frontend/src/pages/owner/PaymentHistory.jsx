import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const PaymentHistory = () => {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <Layout title="Make Payments">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const paidViolations = violations.filter((v) => v.status === "Paid");

  return (
    <Layout title="Make Payments">
      <div className="space-y-6 animate-fade-in pb-20">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Payment History
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Review your previously paid traffic violation fines.
          </p>
        </div>
        
        <DataTable 
          data={paidViolations}
          columns={[
            {
              header: "Payment ID",
              accessorKey: "_id",
              sortable: true,
              cell: (v) => <span className="font-mono text-slate-500">#PAY-{v._id.slice(-8).toUpperCase()}</span>
            },
            {
              header: "Type",
              accessorKey: "violationType",
              sortable: true,
              className: "font-medium text-slate-900"
            },
            {
              header: "Amount",
              accessorKey: "appliedFineAmount",
              sortable: true,
              className: "font-medium text-emerald-600",
              cell: (v) => `NPR ${v.appliedFineAmount || "0"}`
            },
            {
              header: "Status",
              accessorKey: "status",
              sortable: true,
              cell: () => <Badge variant="success">PAID</Badge>
            },
            {
              header: "Date",
              accessorKey: "updatedAt",
              sortable: true,
              align: "right",
              className: "text-right text-slate-500",
              cell: (v) => new Date(v.updatedAt || v.violationDateTime).toLocaleDateString()
            }
          ]}
          searchKey={["_id", "violationType"]}
          searchPlaceholder="Search payments..."
        />
      </div>
    </Layout>
  );
};

export default PaymentHistory;
