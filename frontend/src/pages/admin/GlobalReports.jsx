import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { 
  BarChart3, Receipt, Database, PieChart as PieChartIcon, Activity, TrendingUp, Download 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];
const STATUS_COLORS = { Paid: '#10b981', Pending: '#f59e0b', Unverified: '#64748b', Verified: '#3b82f6', Rejected: '#f43f5e' };

const GlobalReports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [allViolations, setAllViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [sRes, vRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/violations"),
        ]);
        setStats(sRes.data);
        setAllViolations(Array.isArray(vRes.data) ? vRes.data : vRes.data.violations || []);
      } catch (err) {
        console.error("Data fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchGlobalData();
  }, [user]);

  // Process data for charts
  const processTypeData = () => {
    const counts = {};
    allViolations.forEach(v => {
      const type = v.violationType || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] })).sort((a, b) => b.count - a.count);
  };

  const processStatusData = () => {
    const counts = {};
    allViolations.forEach(v => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  const processTrendData = () => {
    const counts = {};
    allViolations.forEach(v => {
      const date = new Date(v.violationDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.keys(counts).reverse().slice(0, 7).map(date => ({ date, violations: counts[date] }));
  };

  if (loading) {
    return (
      <Layout title="Global Analytics">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-900 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const typeData = processTypeData();
  const statusData = processStatusData();
  const trendData = processTrendData();

  return (
    <Layout title="Global Analytics & Reports">
      <div className="space-y-8 animate-fade-in pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">System Analytics</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Real-time overview of grid metrics and revenue.</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary-950 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-transform"
          >
            <Download className="w-4 h-4" /> Export Dashboard
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Database size={120} />
            </div>
            <CardContent className="p-8 relative z-10">
              <p className="text-slate-300 text-xs font-black uppercase tracking-widest mb-2">Total Violations</p>
              <p className="text-5xl font-black">{stats?.summary?.totalViolations || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md bg-white border border-slate-100 relative overflow-hidden group">
             <div className="absolute right-0 top-0 opacity-5 transform translate-x-1/4 -translate-y-1/4 text-emerald-600 group-hover:scale-110 transition-transform duration-500">
              <Receipt size={120} />
            </div>
            <CardContent className="p-8 relative z-10">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Collected Revenue</p>
              <p className="text-4xl font-black text-emerald-600">
                <span className="text-lg mr-1 text-emerald-400">NPR</span>
                {stats?.summary?.totalRevenue?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white border border-slate-100 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-5 transform translate-x-1/4 -translate-y-1/4 text-rose-600 group-hover:scale-110 transition-transform duration-500">
              <Activity size={120} />
            </div>
            <CardContent className="p-8 relative z-10">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Outstanding Liability</p>
              <p className="text-4xl font-black text-rose-600">
                <span className="text-lg mr-1 text-rose-400">NPR</span>
                {stats?.summary?.totalLiability?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Trend Line Chart */}
          <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden col-span-1 lg:col-span-2">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                7-Day Detection Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Line type="monotone" dataKey="violations" stroke="#0f172a" strokeWidth={4} dot={{ r: 6, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, fill: '#3b82f6', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Type Bar Chart */}
          <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                Offenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} width={100} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Pie Chart */}
          <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary-600" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default GlobalReports;
