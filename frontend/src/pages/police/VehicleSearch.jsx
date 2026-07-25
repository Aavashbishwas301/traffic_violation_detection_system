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
        
        <Card className="bg-slate-900 text-white overflow-hidden border border-slate-700/50 shadow-2xl rounded-3xl relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <CardContent className="p-10 md:p-16 relative z-10">
            <div className="max-w-2xl mx-auto space-y-8 text-center">
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Verify Registry
                </h3>
                <p className="text-slate-400 text-lg font-light">
                  Query the national database to verify vehicle registration, ownership, and pending infractions.
                </p>
              </div>
              
              <form onSubmit={handleSearch} className="relative group max-w-xl mx-auto mt-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50" size={28} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="ENTER PLATE NUMBER"
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-6 pl-16 pr-20 font-mono font-black text-2xl tracking-widest outline-none focus:ring-4 focus:ring-primary-500/40 focus:border-primary-400 transition-all uppercase placeholder:text-white/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <ArrowRight size={24} />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {searchResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            <Card className="lg:col-span-2 card-enterprise border-0 ring-1 ring-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5 pt-6 px-8">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-4xl font-black font-mono tracking-widest text-slate-900">{searchResult.vehicle.vehicleNumber}</CardTitle>
                    <CardDescription className="text-sm font-bold mt-2 uppercase tracking-widest text-slate-500">
                      {searchResult.vehicle.brand} {searchResult.vehicle.model} • {searchResult.vehicle.vehicleType}
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 py-1.5 px-4 shadow-sm text-sm">
                    <CheckCircle2 size={16} className="mr-2" /> Active Registry
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Owner Details</h4>
                    <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="font-bold text-slate-900 text-xl">{searchResult.vehicle.ownerId?.fullName || "UNKNOWN"}</p>
                      <p className="text-sm text-slate-500 mt-2 flex items-center font-medium">
                        Contact: <span className="font-mono ml-2 text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{searchResult.vehicle.ownerId?.phoneNumber || "HIDDEN"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vehicle Specs</h4>
                    <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 shadow-sm">
                       <div>
                         <p className="text-xs text-slate-500 font-medium">Color</p>
                         <p className="font-bold text-slate-900 text-lg">{searchResult.vehicle.color || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-xs text-slate-500 font-medium">Class</p>
                         <p className="font-bold text-slate-900 text-lg">{searchResult.vehicle.vehicleType}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enterprise border-0 ring-1 ring-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white flex flex-col justify-between">
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
