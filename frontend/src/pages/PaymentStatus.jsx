import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, Loader2, Cpu, ArrowRight } from 'lucide-react';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('SYNCING WITH CENTRAL BANKING GATEWAY...');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            const pidx = searchParams.get('pidx');
            const esewaData = searchParams.get('data');
            // Purchase order ID from Khalti is actually the fineId
            const fineId = searchParams.get('purchase_order_id');

            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };

                if (pidx) {
                    const { data } = await axios.post('http://localhost:5000/api/payments/khalti/verify', { pidx, fineId }, config);
                    if (data.success) { setStatus('success'); setMessage('GRID SETTLEMENT VERIFIED. LIABILITY ERASED.'); }
                    else { setStatus('failure'); setMessage('KHALTI PROTOCOL REJECTED. AUTHENTICATION FAILURE.'); }
                } else if (esewaData) {
                    const { data } = await axios.get(`http://localhost:5000/api/payments/esewa/verify?data=${esewaData}`, config);
                    if (data.success) { setStatus('success'); setMessage('GRID SETTLEMENT VERIFIED. LIABILITY ERASED.'); }
                    else { setStatus('failure'); setMessage('ESEWA PROTOCOL REJECTED. AUTHENTICATION FAILURE.'); }
                } else {
                    setStatus('failure'); setMessage('INVALID SETTLEMENT PARAMETERS DETECTED.');
                }
            } catch (error) {
                setStatus('failure'); setMessage('CENTRAL SYNC FAILURE. RETRY SEQUENCE INITIATED.');
            }
        };
        if (user?.token) verifyPayment();
    }, [searchParams, user]);

    return (
        <Layout title="Grid Settlement Node">
            <div className="max-w-2xl mx-auto mt-24 animate-fade-in pb-20">
                <div className="bg-white rounded-[64px] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] p-12 md:p-20 text-center space-y-12 border-t-8 border-primary-950 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary-900/5 rounded-bl-[200px]"></div>
                    
                    <div className="space-y-6 relative z-10">
                        {status === 'processing' && (
                            <div className="flex flex-col items-center space-y-8">
                                <div className="relative">
                                    <div className="absolute -inset-6 border-4 border-primary-900/10 rounded-full animate-spin"></div>
                                    <div className="w-24 h-24 bg-primary-950 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <Cpu className="w-12 h-12 text-white animate-pulse" />
                                    </div>
                                </div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary-950">Processing.</h2>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center space-y-8 animate-slide-up">
                                <div className="relative">
                                    <div className="absolute -inset-6 bg-accent-emerald/10 rounded-full animate-ping"></div>
                                    <div className="w-24 h-24 bg-accent-emerald rounded-3xl flex items-center justify-center shadow-2xl border-b-8 border-green-700">
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-green-600">Settled.</h2>
                            </div>
                        )}

                        {status === 'failure' && (
                            <div className="flex flex-col items-center space-y-8 animate-slide-up">
                                <div className="relative">
                                    <div className="absolute -inset-6 bg-accent-crimson/10 rounded-full animate-pulse"></div>
                                    <div className="w-24 h-24 bg-accent-crimson rounded-3xl flex items-center justify-center shadow-2xl border-b-8 border-red-800">
                                        <XCircle className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-accent-crimson">Rejected.</h2>
                            </div>
                        )}

                        <div className="space-y-3">
                           <p className="text-neutral-400 text-xs font-black uppercase tracking-[0.4em] italic leading-relaxed">
                                {message}
                           </p>
                           <div className="h-1 w-20 bg-slate-100 mx-auto rounded-full group-hover:w-40 transition-all duration-1000"></div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 relative z-10">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-7 bg-primary-950 text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-[10px] italic shadow-2xl hover:bg-black hover:-translate-y-1.5 transition-all active:scale-95 flex items-center justify-center gap-4"
                        >
                            <span>Return to Command Node</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.6em] text-neutral-200 italic pt-6">
                        <span>NODE: SET-HUB-X</span>
                        <span>GRID_SECURED_TLS_1.3</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PaymentStatus;
