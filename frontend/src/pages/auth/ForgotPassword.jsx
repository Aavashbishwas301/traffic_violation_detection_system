import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axios.js';
import { Mail, ArrowLeft, Loader2, Shield, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input.jsx';
import { Label } from '../../components/ui/Label.jsx';
import { Button } from '../../components/ui/Button.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await api.post('/api/users/forgot-password', { email: normalizedEmail });
      
      // Store email in sessionStorage to pass it to the reset page
      sessionStorage.setItem('resetEmail', normalizedEmail);
      
      // Check if devOtp was returned (development mode via ethereal email)
      if (data.devOtp) {
        alert(`DEV MODE: Your OTP is ${data.devOtp}. In production, check Ethereal Email terminal logs.`);
      }

      navigate('/reset-password');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 font-sans px-6 py-12 lg:px-24">
      <div className="max-w-md w-full mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-900 rounded-2xl flex items-center justify-center shadow-xl">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
          <p className="text-slate-500 mt-2">
            Enter your registered email address and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                id="email"
                type="email"
                className="pl-10"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start space-x-3 text-rose-600">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full text-base py-6">
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>

          <div className="text-center pt-4">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
