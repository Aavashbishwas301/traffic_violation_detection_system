import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { 
  Bell, Camera, Activity, Shield, Clock, CheckCircle2, AlertTriangle, 
  CreditCard, History, ChevronRight, Eye, User, Settings, Info, 
  ShieldCheck, ArrowRight, Download, Receipt, Zap, Image, History as HistoryIcon,
  MapPin, Globe, CreditCard as PaymentIcon, Car, MessageSquare
} from 'lucide-react';

const OwnerDashboard = () => {
  const [violations, setViolations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Settings State
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  const fetchViolations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/violations/my', config);
      setViolations(data);
    } catch (err) { console.error('Violation fetch failed'); }
  };

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/admin/notifications', config);
      setNotifications(data);
    } catch (err) { console.error('Notification fetch failed'); }
  };

  const fetchVehicles = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/vehicles/my', config);
        setVehicles(data);
    } catch (err) { console.error('Vehicle fetch failed'); }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchViolations(), fetchNotifications(), fetchVehicles()]);
    setLoading(false);
  };

  useEffect(() => { if (user?.token) fetchData(); }, [user, location.pathname]);

  const handlePay = async (id, method, fineId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const targetId = fineId || id; 

      if (method === 'khalti') {
        const { data } = await axios.post('http://localhost:5000/api/payments/khalti/initiate', { fineId: targetId }, config);
        window.location.href = data.payment_url;
      } else if (method === 'esewa') {
        const { data } = await axios.post('http://localhost:5000/api/payments/esewa/initiate', { fineId: targetId }, config);
        
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', data.url);

        for (const key in data.formData) {
            const hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', data.formData[key]);
            form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        await axios.post(`http://localhost:5000/api/payments/${targetId}/pay`, {}, config);
        alert('Payment Successful');
        fetchViolations();
      }
    } catch (err) { 
      console.error(err);
      alert('Payment failed.'); 
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put('http://localhost:5000/api/users/profile', { password: newPassword }, config);
      setProfileMsg('Password Updated.');
      setNewPassword('');
    } catch (err) { setProfileMsg('Update Failed.'); }
  };

  const viewEvidence = (path) => {
    if (!path) return alert('No photo found.');
    const url = `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    window.open(url, '_blank');
  };

  const handleAppeal = (e) => {
    e.preventDefault();
    alert('Complaint sent successfully.');
    e.target.reset();
  };

  if (loading) return (
    <Layout title="Loading...">
      <div className="flex items-center justify-center h-screen -mt-24">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </Layout>
  );

  const renderView = () => {
    switch (location.pathname) {
      case '/violations': 
        return (
          <div className="space-y-6 animate-fade-in pb-20">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">My Violations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {violations.length > 0 ? violations.map(v => (
                <div key={v._id} className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-primary-950 uppercase italic underline decoration-accent-crimson/20 underline-offset-4">{v.violationType}</h4>
                    <span className={`text-2xs font-black px-2 py-0.5 rounded-lg uppercase ${v.status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{v.status}</span>
                  </div>
                  <div className="mt-4 space-y-1 text-2xs font-bold text-neutral-400 uppercase italic">
                    <p>Location: {v.location}</p>
                    <p>Vehicle: {v.vehicleId?.vehicleNumber}</p>
                    <p>Date: {new Date(v.violationDateTime).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-black text-primary-950 italic text-sm">NPR {v.fine?.amount || v.ruleId?.fineAmount || '0'}</p>
                        <button onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)} className="text-[10px] font-black uppercase text-primary-900 hover:underline">See Photo</button>
                    </div>
                    {v.status !== 'Paid' && (
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handlePay(v._id, 'esewa', v.fine?._id)} className="bg-[#60bb46] text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase flex items-center gap-1.5 hover:opacity-90 transition-all">Pay with eSewa</button>
                            <button onClick={() => handlePay(v._id, 'khalti', v.fine?._id)} className="bg-[#5d2e8e] text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase flex items-center gap-1.5 hover:opacity-90 transition-all">Pay with Khalti</button>
                            <button onClick={() => handlePay(v._id, 'manual', v.fine?._id)} className="bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase hover:bg-neutral-200 transition-all">Simulate</button>
                        </div>
                    )}
                  </div>
                </div>
              )) : (
                  <div className="bg-white p-12 rounded-[40px] border border-neutral-100 text-center space-y-4">
                      <ShieldCheck size={48} className="mx-auto text-green-500 opacity-20" />
                      <p className="text-xs font-black uppercase text-neutral-400 tracking-[0.4em] italic">No violations found.</p>
                  </div>
              )}
            </div>
          </div>
        );

      case '/gallery':
        return (
          <div className="space-y-6 animate-fade-in pb-20">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">My Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {violations.filter(v => v.imageUrl || v.evidenceUrl).map(v => (
                <div key={v._id} className="bg-white border border-neutral-100 rounded-3xl overflow-hidden aspect-square flex flex-col shadow-xl group cursor-pointer relative hover:-translate-y-2 transition-all" onClick={() => viewEvidence(v.imageUrl || v.evidenceUrl)}>
                  <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={`http://localhost:5000/${(v.imageUrl || v.evidenceUrl).replace(/\\/g, '/')}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <div className="p-4 bg-white border-t border-neutral-50">
                    <p className="text-[9px] font-black uppercase text-primary-950 italic truncate">{v.violationType}</p>
                    <p className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest mt-0.5">{new Date(v.violationDateTime).toLocaleDateString()}</p>
                  </div>
                  <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={24} /></div>
                </div>
              ))}
              {violations.filter(v => v.imageUrl || v.evidenceUrl).length === 0 && (
                <div className="col-span-full bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">No photos found.</div>
              )}
            </div>
          </div>
        );

      case '/payments':
        const paidViolations = violations.filter(v => v.status === 'Paid');
        return (
          <div className="space-y-6 animate-fade-in pb-20">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">Payment History</h3>
            <div className="bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[600px]">
                <div className="overflow-y-auto custom-scrollbar flex-1">
                   <table className="w-full text-left">
                      <thead className="bg-neutral-50/50 border-b text-[10px] font-black uppercase tracking-widest text-neutral-400 sticky top-0 z-10 backdrop-blur-md">
                         <tr><th className="px-6 py-5">Payment ID</th><th className="px-6 py-5">Type</th><th className="px-6 py-5">Amount</th><th className="px-6 py-5">Status</th><th className="px-6 py-5 text-right">Date</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 text-[11px] font-black uppercase italic">
                         {paidViolations.map(v => (
                            <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                               <td className="px-6 py-4 text-neutral-300">#PAY-{v._id.slice(-8).toUpperCase()}</td>
                               <td className="px-6 py-4 text-primary-950">{v.violationType}</td>
                               <td className="px-6 py-4 text-xs font-black italic text-green-600">NPR {v.fine?.amount || v.ruleId?.fineAmount}</td>
                               <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-lg bg-green-50 text-green-600 border border-green-100 text-[9px]">PAID</span></td>
                               <td className="px-6 py-4 text-right text-neutral-400">{new Date(v.updatedAt || v.violationDateTime).toLocaleDateString()}</td>
                            </tr>
                         ))}
                         {paidViolations.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-neutral-300 italic">No payments found.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
            </div>
          </div>
        );

      case '/complaints':
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in pb-20">
             <div className="text-center space-y-4">
                <h3 className="text-4xl font-black italic tracking-tighter text-primary-950 uppercase leading-none">Send Complaint.</h3>
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.4em] italic">Complain about a violation record if you think it is wrong</p>
             </div>
             <form onSubmit={handleAppeal} className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-6">
                <div className="space-y-2">
                   <label className="text-2xs font-black uppercase tracking-widest text-neutral-400 italic">Select Violation</label>
                   <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic">
                      <option value="">Choose from list</option>
                      {violations.map(v => <option key={v._id} value={v._id}>{v.violationType} - {v.vehicleId?.vehicleNumber}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-2xs font-black uppercase tracking-widest text-neutral-400 italic">Complaint Details</label>
                   <textarea required rows={5} placeholder="Type your message here..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-xs outline-none focus:ring-8 focus:ring-primary-900/5 transition-all uppercase italic" />
                </div>
                <button type="submit" className="w-full py-6 bg-primary-950 text-white rounded-[28px] font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-black transition-all">Send Complaint</button>
             </form>
          </div>
        );

      case '/vehicle':
        return (
          <div className="space-y-8 animate-fade-in pb-20">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">My Vehicles</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {vehicles.map(vh => (
                   <div key={vh._id} className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-950/5 rounded-bl-[100px]"></div>
                      <h3 className="text-4xl font-black text-primary-950 italic tracking-tighter underline decoration-accent-crimson underline-offset-8 uppercase">{vh.vehicleNumber}</h3>
                      <div className="grid grid-cols-2 gap-4 pt-6 uppercase font-black tracking-widest text-[10px] text-left">
                         <div><p className="text-neutral-300">Type</p><p className="text-primary-950 italic">{vh.vehicleType}</p></div>
                         <div><p className="text-neutral-300">Brand</p><p className="text-primary-950 italic">{vh.brand} {vh.model}</p></div>
                         <div><p className="text-neutral-300">Insurance</p><p className="text-accent-emerald italic">{vh.insuranceStatus}</p></div>
                         <div><p className="text-neutral-300">Tax</p><p className="text-accent-emerald italic">{vh.taxStatus}</p></div>
                      </div>
                   </div>
                ))}
                {vehicles.length === 0 && <div className="md:col-span-2 bg-white p-12 rounded-[40px] border border-neutral-100 text-center italic text-neutral-400 uppercase font-black tracking-widest">No vehicles found.</div>}
             </div>
          </div>
        );

      case '/notifications':
        return (
          <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b-4 border-primary-950 pb-2">Notifications</h3>
             {notifications.map(n => (
               <div key={n._id} className="bg-white border border-neutral-100 rounded-2xl p-6 flex items-center space-x-4 hover:border-primary-900/20 transition-all group">
                  <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-primary-900/5 transition-colors"><Bell size={18} className="text-primary-900" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent-crimson">{n.title}</span>
                        <span className="text-[9px] font-bold text-neutral-300 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-bold uppercase italic text-neutral-500 tracking-tight leading-relaxed">{n.message}</p>
                  </div>
               </div>
             ))}
          </div>
        );

      case '/settings':
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-2xl space-y-8 border-l-8 border-primary-950">
                <div className="flex items-center space-x-6">
                   <div className="w-20 h-20 bg-primary-900 rounded-[24px] flex items-center justify-center text-white font-black text-4xl italic border-4 border-white shadow-2xl">{user?.name?.charAt(0)}</div>
                   <div><h4 className="text-3xl font-black italic tracking-tighter text-primary-950 leading-none">{user?.name}</h4><p className="text-2xs font-black uppercase text-accent-crimson tracking-[0.3em] mt-2 italic">{user?.role} Profile</p></div>
                </div>
                <form onSubmit={updateProfile} className="space-y-4 pt-4">
                   <div className="space-y-2">
                      <label className="text-2xs font-black uppercase tracking-widest text-neutral-400 italic">Change Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter New Password" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-sm outline-none focus:ring-8 focus:ring-primary-900/5 transition-all" />
                   </div>
                   <button type="submit" className="btn-primary w-full py-5 rounded-2xl uppercase font-black text-xs tracking-[0.5em] shadow-2xl shadow-primary-900/20">Update Profile</button>
                   {profileMsg && <p className="text-center text-2xs font-black uppercase text-accent-crimson italic animate-pulse">{profileMsg}</p>}
                </form>
             </div>
          </div>
        );

      case '/dashboard':
      default:
        return (
          <div className="space-y-12 animate-fade-in pb-20">
             {/* --- CINEMATIC CITIZEN BANNER --- */}
             <div className="bg-primary-950 rounded-[64px] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden border-b-[16px] border-primary-900 group transition-all duration-1000">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-900/10 to-transparent skew-x-12 transform origin-top-right"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                   <div className="space-y-10">
                      <div className="inline-flex items-center space-x-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner">
                         <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_15px_#10b981] animate-pulse"></div>
                         <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-white/80">Logged In Successfully</span>
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] group-hover:translate-x-4 transition-transform duration-1000">
                           {user?.name.split(' ')[0]} <br />
                           <span className="text-primary-400">Portal.</span>
                        </h2>
                        <p className="text-white/30 font-bold uppercase text-[11px] tracking-[0.6em] italic border-l-4 border-primary-900 pl-8 max-w-md">
                           Manage your vehicle details and <br /> 
                           view traffic violations records.
                        </p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-12 rounded-[64px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-neutral-100 space-y-10 relative group overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="flex items-center justify-between border-b-2 pb-6 border-neutral-50 relative z-10">
                        <div>
                           <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary-950 underline decoration-accent-crimson/20 underline-offset-8 decoration-4">Active Logs.</h3>
                           <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mt-6 italic leading-none">List of your unpaid fines</p>
                        </div>
                        <Link to="/violations" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-900 hover:text-accent-crimson transition-all flex items-center space-x-3 bg-white px-5 py-2.5 rounded-full border border-neutral-100 shadow-sm"><span>View All</span> <ChevronRight size={14} /></Link>
                    </div>
                    <div className="space-y-6 relative z-10">
                      {violations.slice(0, 4).map(v => (
                        <div key={v._id} className="p-6 rounded-[32px] flex items-center justify-between shadow-lg group hover:bg-slate-50 transition-all border border-neutral-50 bg-white">
                            <div className="flex items-center space-x-6">
                                <div className="w-14 h-14 bg-primary-950 text-white rounded-[22px] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform"><AlertTriangle size={24} /></div>
                                <div><p className="text-lg font-black uppercase italic tracking-tighter text-primary-950 leading-none">{v.violationType}</p><p className="text-[10px] text-neutral-300 font-bold uppercase tracking-[0.2em] mt-1.5 italic">{v.vehicleId?.vehicleNumber}</p></div>
                            </div>
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl border uppercase italic tracking-tighter ${v.status === 'Paid' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>{v.status}</span>
                        </div>
                      ))}
                    </div>
                </div>

                <div className="space-y-12 flex flex-col">
                   <div className="bg-primary-900 rounded-[64px] p-12 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 flex-1 flex flex-col justify-between border-b-[16px] border-black">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[150px]"></div>
                      <div className="relative z-10 space-y-10">
                         <h4 className="text-3xl font-black uppercase italic tracking-tighter underline decoration-white/20 underline-offset-8">Fine <br /> Balance.</h4>
                         <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase text-white/40 tracking-[0.5em] italic">Total NPR Amount</p>
                            <p className="text-8xl font-black italic tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700">{violations.filter(v => v.status !== 'Paid').reduce((acc, v) => acc + (v.fine?.amount || v.ruleId?.fineAmount || 0), 0).toLocaleString()}</p>
                         </div>
                      </div>
                      <button onClick={() => navigate('/violations')} className="relative z-10 w-full py-7 bg-white text-primary-900 rounded-[32px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl hover:bg-neutral-50 transition-all active:scale-95 mt-8">Pay Now</button>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles = { '/dashboard': 'User Portal', '/violations': 'My Violations', '/gallery': 'My Photos', '/payments': 'Make Payments', '/vehicle': 'My Vehicles', '/notifications': 'Notifications', '/complaints': 'Send Complaint', '/settings': 'My Profile' };
    return titles[location.pathname] || 'User Portal';
  };

  return <Layout title={getPageTitle()}>{renderView()}</Layout>;
};

export default OwnerDashboard;
