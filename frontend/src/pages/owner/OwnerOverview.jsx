import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { AlertTriangle, ChevronRight, Car, Receipt, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const OwnerOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      <Layout title="Citizen Portal">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const unpaidViolations = violations.filter((v) => v.status !== "Paid");
  const totalFineAmount = unpaidViolations.reduce((acc, v) => acc + (v.appliedFineAmount || 0), 0);

  return (
    <Layout title="Citizen Portal">
      <div className="space-y-8 animate-fade-in pb-20">
        
        {/* --- CITIZEN BANNER --- */}
        <div className="bg-primary-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden border border-primary-800">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600 rounded-full blur-[100px] opacity-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <Badge variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-md mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div>
                Citizen Node Active
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(" ")[0]}
              </h2>
              <p className="text-primary-100 max-w-md">
                Manage your vehicle details, view traffic violation records, and pay any outstanding fines securely.
              </p>
            </div>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-lg min-w-[240px]">
              <CardHeader className="pb-2">
                <CardDescription className="text-primary-100 uppercase tracking-wider text-xs">Unpaid Fines</CardDescription>
                <CardTitle className="text-4xl font-bold text-white">
                  NPR {totalFineAmount.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary" 
                  className="w-full mt-2"
                  onClick={() => navigate("/violations")}
                  disabled={totalFineAmount === 0}
                >
                  <CreditCard size={16} className="mr-2" /> Pay Fines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- ACTIVE LOGS --- */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <CardTitle>Active Violations</CardTitle>
                <CardDescription>Recent unpaid fines linked to your vehicles.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/violations")} className="text-primary-600 shrink-0">
                View All <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              <div className="space-y-4">
                {unpaidViolations.slice(0, 4).map((v) => (
                  <div key={v._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:border-slate-200 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm border border-slate-100">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{v.violationType}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{v.vehicleId?.vehicleNumber}</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50">
                      Unpaid
                    </Badge>
                  </div>
                ))}
                
                {unpaidViolations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <Receipt size={32} />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900">All Clear!</h4>
                    <p className="text-sm text-slate-500 mt-1 max-w-[250px]">You have no active violations or unpaid fines on your account.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* --- QUICK ACTIONS --- */}
          <div className="space-y-6">
            <Card className="hover:border-primary-500 transition-all cursor-pointer group" onClick={() => navigate("/vehicles")}>
              <CardContent className="p-8 flex items-center space-x-6">
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <Car size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">My Vehicles</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage registration details and ownership.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Violation History</CardTitle>
                <CardDescription className="text-slate-400">Review all past incidents and payment receipts.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" onClick={() => navigate("/violations")}>
                  Access Records Archive
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerOverview;
