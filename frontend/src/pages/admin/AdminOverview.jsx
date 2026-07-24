import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import {
  Car,
  Clock,
  Activity,
  Zap,
  Camera,
  ChevronRight,
  Database,
  Users,
  Megaphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";

const AdminOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes, vRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/users"),
          api.get("/api/violations"),
        ]);
        setStats(sRes.data);
        setUsersList(uRes.data || []);
        setAllViolations(
          Array.isArray(vRes.data) ? vRes.data : vRes.data.violations || []
        );
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: "Total Paid Fines",
      value: `NPR ${stats?.summary?.totalRevenue?.toLocaleString() ?? 0}`,
      icon: Zap,
      colorClass: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Total Violations",
      value: stats?.summary?.totalViolations ?? 0,
      icon: Activity,
      colorClass: "text-primary-600 bg-primary-50"
    },
    {
      title: "Outstanding Fines",
      value: `NPR ${stats?.summary?.totalLiability?.toLocaleString() ?? 0}`,
      icon: Clock,
      colorClass: "text-amber-600 bg-amber-50"
    },
    {
      title: "Total Vehicles",
      value: stats?.summary?.totalVehicles ?? 0,
      icon: Car,
      colorClass: "text-indigo-600 bg-indigo-50"
    },
  ];

  return (
    <Layout title="Dashboard Overview">
      <div className="space-y-8 animate-fade-in pb-20">
        
        {/* --- WELCOME BANNER --- */}
        <div className="bg-primary-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-primary-800">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <Badge variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-md mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div>
                Command Session Active
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}
              </h2>
              <p className="text-primary-100 max-w-md">
                Here's a summary of the traffic violation grid. You can manage officers, vehicles, and violation records from this unified console.
              </p>
            </div>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-lg min-w-[240px]">
              <CardHeader className="pb-2">
                <CardDescription className="text-primary-100 uppercase tracking-wider text-xs">Active Officers</CardDescription>
                <CardTitle className="text-5xl font-bold text-white">
                  {usersList.filter((u) => u.role === "TrafficPolice").length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center space-x-2 text-emerald-300 text-xs font-medium bg-emerald-950/30 px-2.5 py-1 rounded-md border border-emerald-800/50">
                  <Activity size={12} /> <span>Status: Optimal</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{s.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.colorClass}`}>
                  <s.icon size={24} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- RECENT HISTORY TABLE --- */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <CardTitle>Recent Violations</CardTitle>
                <CardDescription>Latest enforcement events captured by the grid.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/violation-mgmt")} className="text-primary-600">
                View All <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Vehicle Plate</TableHead>
                    <TableHead>Violation Type</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allViolations.slice(0, 6).map((v) => (
                    <TableRow key={v._id}>
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                            <Camera size={14} />
                          </div>
                          <div>
                            <div>EVT-{v._id.slice(-6)}</div>
                            <div className="text-xs text-slate-500">{v.location}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{v.vehicleId?.vehicleNumber || "UNKNOWN"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{v.violationType}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {new Date(v.violationDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* --- SIDE ACTIONS --- */}
          <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Message</CardTitle>
                <CardDescription className="text-slate-400">Broadcast a high-priority alert to all connected enforcement nodes.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full justify-center" onClick={() => navigate("/notifications-mgmt")}>
                  <Megaphone size={16} className="mr-2" /> Broadcast Alert
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2">
                  <Database size={18} className="text-primary-600" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">All data centers and neural nodes are operating at optimal capacity.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">Uptime</span>
                    <span className="text-emerald-600">99.9%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[99.9%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOverview;
