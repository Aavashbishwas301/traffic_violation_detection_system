import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { 
  Camera, Shield, AlertTriangle, CheckCircle2, Clock, 
  Search, Upload, Activity, History, Settings, Info,
  ChevronRight, ArrowRight, Eye, Trash2, MapPin, Cpu,
  Database, Zap, BarChart3, Image, BadgeCheck
} from 'lucide-react';

const PoliceDashboard = () => {
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Photo Upload State
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({ location: 'Central Point', remarks: 'Manual Entry' });

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const [vRes, sRes] = await Promise.all([
        axios.get('http://localhost:5000/api/violations', config),
        axios.get('http://localhost:5000/api/admin/stats', config)
      ]);
      setViolations(vRes.data);
      setStats(sRes.data);
    } catch (err) { console.error('Data sync failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.token) fetchData(); }, [user, location.pathname]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/vehicles/${searchQuery}`, config);
      setSearchResult(data);
    } catch (err) { alert('Vehicle not found.'); setSearchResult(null); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a photo first.');
    setUploading(true);
    const formData = new FormData();
    formData.append('evidence', file);
    formData.append('location', meta.location);
    formData.append('remarks', meta.remarks);

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data' } };
      await axios.post('http://localhost:5000/api/violations/upload', formData, config);
      alert('Photo checked successfully.');
      setFile(null);
      fetchData();
    } catch (err) { alert('Upload failed.'); }
    finally { setUploading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`http://localhost:5000/api/violations/${id}`, { status }, config);
      fetchData();
    } catch (err) { alert('Update failed.'); }
  };

  const deleteViolation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`http://localhost:5000/api/violations/${id}`, config);
      fetchData();
    } catch (err) { alert('Deletion failed.'); }
  };

  const viewEvidence = (path) => {
    if (!path) return alert('No photo found.');
    window.open(`http://localhost:5000/${path.replace(/\\/g, '/')}`, '_blank');
  };

  if (loading) return (
    <Layout title="Loading Dashboard">
      <div className="flex items-center justify-center h-screen -mt-24">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </Layout>
  );

  const renderView = () => {
    switch (location.pathname) {
      case '/detect':
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
             <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-neutral-100 space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-950/5 rounded-bl-[100px]"></div>
                <div>
                   <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase">Check Violation.</h3>
                   <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.4em] mt-2 italic border-l-4 border-accent-crimson pl-6">Upload a photo to automatically find traffic rule violations.</p>
                </div>

                <form onSubmit={handleUpload} className="space-y-8">
                   <div className="border-4 border-dashed border-neutral-100 rounded-[40px] p-12 text-center hover:border-primary-900/20 transition-all group cursor-pointer relative">
                      <input type="file" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="space-y-4">
                         <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><Camera className="text-primary-900" size={32} /></div>
                         <div>
                            <p className="text-sm font-black italic text-primary-950 uppercase">{file ? file.name : 'Click or Drop photo here'}</p>
                            <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest mt-1 italic">JPG OR PNG PHOTO • MAX 100MB</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">Location Name</label><input type="text" value={meta.location} onChange={e => setMeta({...meta, location: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic ml-2">Your Remarks</label><input type="text" value={meta.remarks} onChange={e => setMeta({...meta, remarks: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic" /></div>
                   </div>

                   <button type="submit" disabled={uploading} className={`w-full py-6 rounded-[32px] font-black uppercase tracking-[0.5em] text-xs shadow-2xl transition-all flex items-center justify-center space-x-4 ${uploading ? 'bg-neutral-200 text-neutral-400' : 'bg-primary-950 text-white hover:bg-black hover:-translate-y-1 shadow-primary-900/20'}`}>
                      {uploading ? <Cpu className="animate-spin" /> : <><Zap size={18} /> <span>Start AI Check</span></>}
                   </button>
                </form>
             </div>
          </div>
        );

      case '/manage':
        return (
          <div className="space-y-8 animate-fade-in pb-20">
             <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">Manage Records.</h3>
                   <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">List of violations that need to be checked.</p>
                </div>
                <div className="bg-primary-950 text-white px-4 py-2 rounded-xl font-black text-xs italic shadow-lg">{violations.length} RECORDS</div>
             </div>

             <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
                <div className="overflow-y-auto custom-scrollbar flex-1">
                   <table className="w-full text-left">
                      <thead className="bg-neutral-50/50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                         <tr><th className="px-6 py-5">Record ID</th><th className="px-6 py-5">Plate No.</th><th className="px-6 py-5">Violation</th><th className="px-6 py-5">Fine</th><th className="px-6 py-5">Status</th><th className="px-6 py-5 text-right">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                         {violations.map(v => (
                            <tr key={v._id} className="hover:bg-slate-50/80 transition-colors group">
                               <td className="px-6 py-4 text-neutral-300">#{v._id.slice(-6)}</td>
                               <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 bg-neutral-100 rounded-lg text-2xs font-black uppercase italic tracking-tighter border border-neutral-200">{v.vehicleId?.vehicleNumber || 'UNKNOWN'}</span>
                               </td>
                               <td className="px-6 py-4 text-primary-950">{v.violationType}</td>
                               <td className="px-6 py-4 text-xs font-black italic text-primary-900">NPR {v.fine?.amount || v.ruleId?.fineAmount || 'N/A'}</td>
                               <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-lg border text-[9px] ${v.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>{v.status}</span></td>
                               <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     {v.status === 'Pending' && <button onClick={() => updateStatus(v._id, 'Verified')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle2 size={16} /></button>}
                                     <button onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)} className="p-2 text-primary-900 hover:bg-primary-50 rounded-lg" title="See Photo"><Eye size={16} /></button>
                                     <button onClick={() => deleteViolation(v._id)} className="p-2 text-accent-crimson hover:bg-accent-crimson/5 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      case '/search':
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
             <div className="bg-primary-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-crimson/10 rounded-full blur-[80px]"></div>
                <div className="relative z-10 space-y-8">
                   <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Search <br /> Vehicles.</h3>
                   <form onSubmit={handleSearch} className="relative group max-w-xl">
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value.toUpperCase())} placeholder="Example: BA-1-PA-1234" className="w-full bg-white/10 border-2 border-white/10 rounded-[28px] py-6 pl-14 pr-8 font-black text-xl italic outline-none focus:ring-8 focus:ring-white/5 focus:border-white/30 transition-all uppercase placeholder:text-white/20" />
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" size={24} />
                      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-primary-950 p-3 rounded-2xl hover:scale-105 transition-all active:scale-95"><ArrowRight size={20} /></button>
                   </form>
                </div>
             </div>

             {searchResult && (
                <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-12 animate-slide-up">
                   <div className="space-y-8">
                      <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 text-[10px] font-black uppercase italic">
                         <Shield size={12} /> <span>Verified Vehicle</span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Plate Number</p>
                         <p className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase">{searchResult.vehicle.vehicleNumber}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Owner Name</p>
                         <p className="text-2xl font-black italic text-primary-950 uppercase">{searchResult.vehicle.ownerId?.fullName || 'NOT REGISTERED'}</p>
                      </div>
                   </div>
                   <div className="bg-slate-50 rounded-[32px] p-8 space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 border-b pb-3 italic">Vehicle Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase italic">
                         <div><p className="text-neutral-300 mb-1">Type</p><p className="text-primary-950">{searchResult.vehicle.vehicleType}</p></div>
                         <div><p className="text-neutral-300 mb-1">Brand</p><p className="text-primary-950">{searchResult.vehicle.brand}</p></div>
                         <div><p className="text-neutral-300 mb-1">Insurance</p><p className="text-green-600">{searchResult.vehicle.insuranceStatus}</p></div>
                         <div><p className="text-neutral-300 mb-1">Tax Status</p><p className="text-green-600">{searchResult.vehicle.taxStatus}</p></div>
                      </div>
                   </div>
                </div>
             )}
          </div>
        );

      case '/evidence':
        return (
          <div className="space-y-8 animate-fade-in pb-20">
             <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">Evidence Photos.</h3>
                   <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">Photos taken by traffic cameras as proof</p>
                </div>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {violations.map(v => (
                   <div key={v._id} className="bg-white border border-neutral-100 rounded-3xl overflow-hidden aspect-square flex flex-col shadow-xl group cursor-pointer relative hover:-translate-y-2 transition-all" onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}>
                      <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
                        {v.imageUrl || v.evidenceUrl ? <img src={`http://localhost:5000/${(v.imageUrl || v.evidenceUrl).replace(/\\/g, '/')}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <Image size={40} className="text-neutral-200" />}
                      </div>
                      <div className="p-4 bg-white border-t border-neutral-50">
                        <p className="text-[9px] font-black uppercase text-primary-950 italic truncate">ID-{v._id.slice(-8)}</p>
                        <p className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest mt-0.5">{v.violationType}</p>
                      </div>
                      <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={24} /></div>
                   </div>
                ))}
             </div>
          </div>
        );

      case '/fines':
        return (
          <div className="space-y-8 animate-fade-in pb-20">
             <div className="flex justify-between items-end border-b-4 border-primary-950 pb-4">
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">Fine Records.</h3>
                   <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] mt-2 italic">Records of paid and unpaid traffic fines.</p>
                </div>
             </div>
             <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
                <div className="overflow-y-auto custom-scrollbar flex-1">
                   <table className="w-full text-left">
                      <thead className="bg-neutral-50/50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                         <tr><th className="px-6 py-5">Record ID</th><th className="px-6 py-5">Fine</th><th className="px-6 py-5">Status</th><th className="px-6 py-5 text-right">Date & Time</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                         {violations.map(v => (
                            <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                               <td className="px-6 py-4 text-neutral-300">#{v._id.slice(-6)}</td>
                               <td className="px-6 py-4 text-xs font-black italic text-primary-900">NPR {v.fine?.amount || v.ruleId?.fineAmount || 'N/A'}</td>
                               <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-lg border text-[9px] ${v.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>{v.status}</span></td>
                               <td className="px-6 py-4 text-right text-neutral-400">{new Date(v.violationDateTime).toLocaleDateString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      case '/reports':
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
             <div className="border-b-4 border-primary-950 pb-6">
                <h3 className="text-5xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">Traffic Stats.</h3>
                <p className="text-[10px] font-black text-neutral-300 uppercase mt-4 italic border-l-4 border-accent-crimson pl-6">Simple charts and numbers about traffic violations</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-neutral-100 space-y-6">
                   <h4 className="text-xl font-black italic uppercase text-primary-950">Violation Types</h4>
                   <div className="space-y-4">
                      {stats?.violationsByType?.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-neutral-50 pb-3">
                            <span className="text-neutral-400">{item._id}</span>
                            <span className="text-primary-950">{item.count}</span>
                         </div>
                      ))}
                   </div>
                </div>
                <div className="bg-primary-900 text-white p-10 rounded-[48px] shadow-2xl space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]"></div>
                   <h4 className="text-xl font-black italic uppercase">Money Collected</h4>
                   <div className="space-y-2">
                      <p className="text-5xl font-black italic tracking-tighter leading-none">NPR {stats?.summary?.totalRevenue?.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total value of all paid fines</p>
                   </div>
                </div>
             </div>
          </div>
        );

      case '/settings':
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-20">
             <div className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-8 border-l-8 border-accent-crimson">
                <div className="flex items-center space-x-6">
                   <div className="w-20 h-20 bg-primary-950 rounded-[24px] flex items-center justify-center text-white font-black text-4xl italic border-4 border-white shadow-2xl">{user?.name?.charAt(0)}</div>
                   <div><h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">{user?.name}</h4><p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">Officer Badge: {user?.badgeNumber || 'OFFICER'}</p></div>
                </div>
                <div className="space-y-4 pt-4">
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Assigned Unit</p>
                      <p className="text-sm font-black italic text-primary-950 uppercase">Traffic Management Division</p>
                   </div>
                   <button onClick={() => alert('Password update requested.')} className="w-full py-5 bg-primary-950 text-white rounded-2xl uppercase font-black text-xs tracking-[0.5em] shadow-2xl shadow-primary-900/20">Change Password</button>
                </div>
             </div>
          </div>
        );

      case '/dashboard':
      default:
        return (
          <div className="space-y-12 animate-fade-in pb-20">
             {/* --- WELCOME BANNER --- */}
             <div className="bg-primary-950 rounded-[64px] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-b-[16px] border-accent-crimson group transition-all duration-1000">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent-crimson/10 to-transparent skew-x-12 transform origin-top-right"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                   <div className="space-y-10">
                      <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner">
                         <div className="w-2.5 h-2.5 rounded-full bg-accent-crimson shadow-[0_0_15px_#dc143c] animate-ping"></div>
                         <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-white/80">Duty Status: Signed In</span>
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">
                           Officer <br /> {user?.name.split(' ')[0]} <br />
                           <span className="text-accent-crimson">Panel.</span>
                        </h2>
                        <p className="text-white/30 font-bold uppercase text-[11px] tracking-[0.6em] italic border-l-4 border-accent-crimson pl-8 max-w-md">
                           Official Traffic Police Dashboard. <br /> 
                           Record and manage violations easily.
                        </p>
                      </div>
                   </div>
                   
                   <div className="bg-white/5 backdrop-blur-3xl p-14 rounded-[56px] border border-white/10 flex flex-col items-center justify-center space-y-4 min-w-[280px] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)] group-hover:bg-white/10 transition-all duration-700 cursor-crosshair group/stability">
                      <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic">System Online</p>
                      <p className="text-7xl font-black italic tracking-tighter text-accent-emerald uppercase group-hover/stability:scale-110 transition-transform duration-700">98.2%</p>
                      <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-accent-emerald w-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                      </div>
                   </div>
                </div>
             </div>

             {/* --- STATS GRID --- */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Violations Found', value: stats?.summary?.totalViolations || 0, icon: Activity, color: 'text-primary-950', bg: 'bg-primary-950/5', border: 'border-primary-950/10' },
                    { label: 'Need Checking', value: stats?.summary?.pendingViolations || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
                    { label: 'Total Money', value: `NPR ${stats?.summary?.totalRevenue?.toLocaleString() || 0}`, icon: Zap, color: 'text-green-600', bg: 'bg-green-500/5', border: 'border-green-500/20' },
                    { label: 'Vehicles Checked', value: stats?.summary?.totalVehicles || 0, icon: Database, color: 'text-blue-600', bg: 'bg-blue-500/5', border: 'border-blue-500/20' }
                ].map((s, i) => (
                    <div key={i} className={`bg-white p-10 rounded-[56px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-2 ${s.border} flex flex-col items-center text-center space-y-5 hover:-translate-y-3 transition-all duration-500 relative overflow-hidden group`}>
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-1000 -z-10"></div>
                        <div className={`w-16 h-16 ${s.bg} rounded-[24px] flex items-center justify-center ${s.color} shadow-inner group-hover:rotate-12 transition-transform`}><s.icon size={28} /></div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-neutral-300 tracking-[0.2em] italic">{s.label}</p>
                            <p className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
             </div>

             {/* --- RECENT ACTIVITY --- */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-2xl border border-neutral-50 space-y-8">
                    <div className="flex items-center justify-between border-b pb-4 border-neutral-50">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-950">Recent History</h3>
                        <Link to="/manage" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-900 hover:text-accent-crimson transition-colors flex items-center space-x-2"><span>View All</span> <ChevronRight size={14} /></Link>
                    </div>
                    <div className="space-y-4">
                      {violations.slice(0, 4).map(v => (
                        <div key={v._id} className="p-5 rounded-3xl flex items-center justify-between shadow-lg group hover:bg-slate-50 transition-all border border-neutral-50 bg-white">
                            <div className="flex items-center space-x-5">
                                <div className="w-12 h-12 bg-primary-900 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform"><Camera size={20} /></div>
                                <div>
                                    <p className="text-xs font-black uppercase italic tracking-tight text-primary-950">{v.violationType}</p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-0.5 italic">{v.vehicleId?.vehicleNumber || 'UNKNOWN'}</p>
                                </div>
                            </div>
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase italic tracking-tighter ${v.status === 'Paid' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>{v.status}</span>
                        </div>
                      ))}
                    </div>
                </div>

                <div className="space-y-8 flex flex-col">
                   <div className="bg-accent-crimson rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group flex-1">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px]"></div>
                      <div className="relative z-10 space-y-6">
                         <h4 className="text-2xl font-black uppercase italic tracking-tighter">Check Photo</h4>
                         <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">Upload a photo to automatically check for traffic violations.</p>
                         <button onClick={() => navigate('/detect')} className="w-full py-5 bg-white text-accent-crimson rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-neutral-100 transition-all">Start Check</button>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[48px] shadow-2xl border border-neutral-100 space-y-6 flex-1 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><BarChart3 className="text-primary-900" size={24} /></div>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter text-primary-950">Police Stats</h4>
                      <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest leading-relaxed">View how many violations are caught and fine collection stats.</p>
                      <button onClick={() => navigate('/reports')} className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950 hover:text-accent-crimson transition-colors flex items-center space-x-2 mx-auto"><span>Open Reports</span> <ChevronRight size={14} /></button>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles = { 
        '/dashboard': 'Officer Dashboard', 
        '/detect': 'Check Violation', 
        '/manage': 'Manage Records', 
        '/evidence': 'Evidence Photos', 
        '/search': 'Search Vehicle', 
        '/fines': 'Fine Records',
        '/reports': 'Traffic Stats',
        '/settings': 'My Profile' 
    };
    return titles[location.pathname] || 'Officer Hub';
  };

  return <Layout title={getPageTitle()}>{renderView()}</Layout>;
};

export default PoliceDashboard;
