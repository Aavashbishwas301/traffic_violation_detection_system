import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
      <Layout title="Payment History">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const paidViolations = violations.filter((v) => v.status === "Paid");

  const generatePDF = (violation) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("TVDS", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Traffic Violation Detection System", 14, 28);
    doc.text("Official Payment Receipt", 14, 34);

    // Separator line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, 40, 196, 40);

    // Payment Details
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Receipt Details", 14, 52);

    doc.autoTable({
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], lineColor: [226, 232, 240] },
      bodyStyles: { textColor: [71, 85, 105], lineColor: [226, 232, 240] },
      body: [
        ["Payment ID", `#PAY-${violation._id.slice(-8).toUpperCase()}`],
        ["Date Paid", new Date(violation.updatedAt || violation.violationDateTime).toLocaleDateString()],
        ["Vehicle Number", violation.vehicleId?.vehicleNumber || "N/A"],
        ["Violation Type", violation.violationType],
        ["Fine Amount", `NPR ${violation.appliedFineAmount || 0}`],
        ["Payment Status", "COMPLETED"]
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY || 120;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for your payment. This is a computer-generated receipt.", 14, finalY + 20);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY + 28);

    doc.save(`TVDS_Receipt_${violation._id.slice(-6)}.pdf`);
  };

  return (
    <Layout title="Payment History">
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
            },
            {
              header: "Action",
              id: "actions",
              align: "right",
              cell: (v) => (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generatePDF(v)}
                    className="flex items-center gap-1.5 text-primary-600 border-primary-200 hover:bg-primary-50"
                  >
                    <Download size={14} />
                    Receipt
                  </Button>
                </div>
              )
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
