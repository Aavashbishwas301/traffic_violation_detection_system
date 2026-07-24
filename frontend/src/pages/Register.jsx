import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, AlertCircle, ArrowLeft, Phone, BadgeCheck, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VehicleOwner');
  const [phone, setPhone] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [citizenshipNumber, setCitizenshipNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('Other');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/users', { 
        fullName, 
        email, 
        password, 
        role,
        phoneNumber: phone,
        gender,
        dateOfBirth,
        badgeNumber: role === 'TrafficPolice' ? badgeNumber : undefined,
        citizenshipNumber: role === 'VehicleOwner' ? citizenshipNumber : undefined,
        address: role === 'VehicleOwner' ? address : undefined
      });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check the provided information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Brand Side (Left) */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-900 p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-primary-600 rounded-full blur-[120px] opacity-20 -mr-48"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 group w-max">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Shield className="text-primary-900" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">TVDS</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-primary-100 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>Enrollment Active</span>
           </div>
           <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
             Join the <br /> National <br /> Traffic Grid
           </h1>
           <p className="text-primary-200 text-lg max-w-md">
             Register your account to manage vehicles, track violations, or enforce traffic regulations across the city.
           </p>
        </div>

        <div className="relative z-10 text-primary-400 text-xs font-medium tracking-wider">
            © 2026 TVDS GOVERNMENT PORTAL
        </div>
      </div>

      {/* Register Side (Right) */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 relative animate-fade-in overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-8">
          <div>
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-slate-500">Enter your details to register in the system.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="VehicleOwner">Vehicle Owner (Citizen)</option>
                      <option value="TrafficPolice">Traffic Police Officer</option>
                      <option value="Admin">System Administrator</option>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          id="phone"
                          type="text"
                          className="pl-10"
                          placeholder="+977 98..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Legal Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        id="fullName"
                        type="text"
                        className="pl-10"
                        placeholder="Ram Bahadur"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                  </div>
                </div>

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

                {(role === 'VehicleOwner' || role === 'TrafficPolice') && (
                  <div className="grid grid-cols-2 gap-6 animate-slide-up">
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                            id="dob"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                        />
                    </div>
                  </div>
                )}

                {role === 'TrafficPolice' && (
                  <div className="space-y-2 animate-slide-up">
                    <Label htmlFor="badge">Enforcement Badge ID</Label>
                    <div className="relative">
                        <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          id="badge"
                          type="text"
                          className="pl-10"
                          placeholder="POL-1234"
                          value={badgeNumber}
                          onChange={(e) => setBadgeNumber(e.target.value)}
                          required
                        />
                    </div>
                  </div>
                )}

                {role === 'VehicleOwner' && (
                  <>
                  <div className="space-y-2 animate-slide-up">
                    <Label htmlFor="citizenship">Citizenship Number</Label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          id="citizenship"
                          type="text"
                          className="pl-10"
                          placeholder="27-01-72-..."
                          value={citizenshipNumber}
                          onChange={(e) => setCitizenshipNumber(e.target.value)}
                          required
                        />
                    </div>
                  </div>
                  <div className="space-y-2 animate-slide-up">
                    <Label htmlFor="address">Resident Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Kathmandu, Nepal"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        id="password"
                        type="password"
                        className="pl-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start space-x-3 text-rose-600 animate-slide-up">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-base py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="pt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
