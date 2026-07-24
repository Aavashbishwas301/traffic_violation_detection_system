import React, { useState } from "react";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Search, ArrowRight, ShieldCheck, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const VehicleSearch = () => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/vehicles/${searchQuery}`);
      setSearchResult(data);
    } catch (err) {
      addToast("Vehicle not found.", "error");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Vehicle & License Check">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
        
        <Card className="bg-slate-900 text-white overflow-hidden border-none shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <CardContent className="p-10 md:p-14 relative z-10">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-4xl font-bold tracking-tight">
                  Verify Registry
                </h3>
                <p className="text-slate-400 text-lg">
                  Query the national database to verify vehicle registration, ownership, and pending infractions.
                </p>
              </div>
              
              <form onSubmit={handleSearch} className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="ENTER PLATE NUMBER"
                  className="w-full bg-white/10 border border-white/20 rounded-full py-5 pl-14 pr-16 font-mono font-bold text-xl outline-none focus:ring-4 focus:ring-primary-500/30 focus:border-primary-500 transition-all uppercase placeholder:text-slate-500 text-white"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-white text-slate-900 hover:bg-slate-200"
                >
                  <ArrowRight size={20} />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {searchResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            <Card className="lg:col-span-2 border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-mono tracking-widest">{searchResult.vehicle.vehicleNumber}</CardTitle>
                    <CardDescription className="text-sm font-medium mt-1 uppercase tracking-wider text-slate-500">
                      {searchResult.vehicle.brand} {searchResult.vehicle.model} • {searchResult.vehicle.vehicleType}
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 py-1 px-3">
                    <CheckCircle2 size={14} className="mr-1.5" /> Active Registry
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner Details</h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-semibold text-slate-900 text-lg">{searchResult.vehicle.ownerId?.fullName || "UNKNOWN"}</p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center">
                        Contact: <span className="font-mono ml-2 text-slate-700">{searchResult.vehicle.ownerId?.phoneNumber || "HIDDEN"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Specs</h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-xs text-slate-500">Color</p>
                         <p className="font-medium text-slate-900">{searchResult.vehicle.color || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-xs text-slate-500">Class</p>
                         <p className="font-medium text-slate-900">{searchResult.vehicle.vehicleType}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-slate-50 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-600 flex items-center"><ShieldCheck size={16} className="mr-2 text-slate-400" /> Insurance</span>
                    <Badge variant={searchResult.vehicle.insuranceStatus === 'Active' ? 'default' : 'destructive'} className={searchResult.vehicle.insuranceStatus === 'Active' ? 'bg-emerald-500' : ''}>
                      {searchResult.vehicle.insuranceStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-600 flex items-center"><FileText size={16} className="mr-2 text-slate-400" /> Bluebook Tax</span>
                    <Badge variant={searchResult.vehicle.taxStatus === 'Paid' ? 'default' : 'destructive'} className={searchResult.vehicle.taxStatus === 'Paid' ? 'bg-emerald-500' : ''}>
                      {searchResult.vehicle.taxStatus}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-sm">
                  <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-3 flex items-center">
                    <AlertTriangle size={14} className="mr-1.5" /> Infraction Summary
                  </h4>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{searchResult.history?.length || 0}</p>
                      <p className="text-xs text-slate-500">Total Events</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-rose-600">
                        NPR{" "}
                        {searchResult.history
                          ?.filter((v) => v.status !== "Paid")
                          .reduce(
                            (acc, v) => acc + (v.appliedFineAmount || 0),
                            0
                          ) || 0}
                      </p>
                      <p className="text-xs text-slate-500">Unpaid Fines</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default VehicleSearch;
