import React, { useState } from 'react';
import api from '../utils/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import policeLogo from '../assets/police_logo.jpg';
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowLeft, 
  Phone, 
  BadgeCheck, 
  Loader2, 
  CheckCircle2, 
  Building 
} from 'lucide-react';
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
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/users', { 
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
      setError(err.response?.data?.message || (lang === 'np' ? 'दर्ता प्रक्रिया असफल भयो। कृपया प्रविष्ट गरिएको विवरण रुजु गर्नुहोस्।' : 'Registration failed. Please check the provided information.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] font-sans">
      
      {/* Brand Side (Left) - Homepage Midnight Navy Theme */}
      <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-br from-[#071126] via-[#091736] to-[#12224D] p-12 flex-col justify-between relative overflow-hidden text-white border-r border-slate-800 shrink-0">
        
        {/* National Flag Dual Stripe */}
        <div className="absolute top-0 left-0 h-1.5 w-full flex">
          <div className="w-1/2 bg-[#DC143C]"></div>
          <div className="w-1/2 bg-[#003893]"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#DC143C]/20 rounded-full blur-[110px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-[#003893]/40 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Top Header Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3.5 group w-max">
            <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-slate-200 to-amber-500 shadow-xl group-hover:scale-105 transition-transform shrink-0">
              <img
                src={policeLogo}
                alt="Nepal Police"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white leading-none">TVDS</span>
                <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#DC143C] text-white rounded tracking-wider uppercase">NEPAL</span>
              </div>
              <p className="text-xs text-amber-300 font-bold mt-1">
                {lang === 'np' ? 'नेपाल प्रहरी • ट्राफिक निर्देशनालय' : 'Nepal Police • Traffic Directorate'}
              </p>
            </div>
          </Link>
        </div>

        {/* Central Pitch */}
        <div className="relative z-10 space-y-6 my-auto py-8">
           <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-mono text-[11px] uppercase tracking-wider">
                {lang === 'np' ? 'नागरिक तथा अधिकृत दर्ता' : 'National Enrollment'}
              </span>
           </div>
           
           <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
             {lang === 'np' ? (
               <>
                 डिजिटल ट्राफिक <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                   ग्रिडमा आबद्ध हुनुहोस्
                 </span>
               </>
             ) : (
               <>
                 Join the <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                   National Traffic Grid
                 </span>
               </>
             )}
           </h1>
           
           <p className="text-slate-300 text-base leading-relaxed max-w-md font-light">
             {lang === 'np' 
               ? 'सवारी साधन दर्ता, ई-चलान अभिलेख, डिजिटल कर भुक्तानी र ट्राफिक व्यवस्थापनका लागि आधिकारिक खाता खोल्नुहोस्।'
               : 'Register your account to manage registered vehicles, track automated violation citations, or enforce traffic regulations safely.'}
           </p>

           <div className="space-y-3 pt-2 text-xs text-slate-300">
             <div className="flex items-center space-x-2">
               <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
               <span>{lang === 'np' ? 'आफ्नो सवारी तथा ब्लुबुकको तत्काल ट्र्याकिङ' : 'Instant vehicle & bluebook tracking'}</span>
             </div>
             <div className="flex items-center space-x-2">
               <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
               <span>{lang === 'np' ? 'ईसेवा मार्फत सुरक्षित तथा छरितो जरिवाना भुक्तानी' : 'Instant eSewa digital fine settlement'}</span>
             </div>
             <div className="flex items-center space-x-2">
               <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
               <span>{lang === 'np' ? 'सवारी तथा यातायात व्यवस्था ऐन, २०४९ बमोजिम' : 'Fully compliant with Transport Management Act 2049'}</span>
             </div>
           </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 text-slate-400 text-xs font-medium tracking-wider flex items-center justify-between border-t border-white/10 pt-4">
           <span>© 2026 TVDS • GOVT OF NEPAL</span>
           <span className="text-amber-400/80 font-mono text-[10px]">ENROLLMENT SECURE</span>
        </div>
      </div>

      {/* Register Side (Right) */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative animate-fade-in overflow-y-auto bg-white lg:bg-transparent">
        <div className="max-w-xl w-full mx-auto space-y-7">
          
          {/* Top Bar: Back link */}
          <div>
            <Link to="/login" className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-[#003893] transition-colors group">
              <ArrowLeft size={16} className="mr-1.5 group-hover:-translate-x-1 transition-transform" /> 
              {lang === 'np' ? 'लगइनमा फर्कनुहोस्' : 'Back to Login'}
            </Link>
          </div>

          <div className="space-y-1.5">
            <div className="lg:hidden flex items-center space-x-2.5 mb-2">
              <img src={policeLogo} alt="Nepal Police" className="w-8 h-8 rounded-full border border-amber-400" />
              <span className="text-xs font-bold text-[#003893]">TVDS • NEPAL POLICE</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'np' ? 'नयाँ खाता सिर्जना गर्नुहोस्' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'np' ? 'प्रणालीमा आबद्ध हुन आफ्नो विवरण प्रविष्ट गर्नुहोस्।' : 'Enter your credentials to register in the national system.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {lang === 'np' ? 'खाताको प्रकार' : 'Account Type'}
                </Label>
                <Select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs font-medium"
                  required
                >
                  <option value="VehicleOwner">{lang === 'np' ? 'सवारी धनी (नागरिक)' : 'Vehicle Owner (Citizen)'}</option>
                  <option value="TrafficPolice">{lang === 'np' ? 'ट्राफिक प्रहरी अधिकृत' : 'Traffic Police Officer'}</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {lang === 'np' ? 'सम्पर्क नम्बर' : 'Phone Number'}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <Input
                    id="phone"
                    type="text"
                    className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                    placeholder="+977 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {lang === 'np' ? 'पूरा कानुनी नाम' : 'Full Legal Name'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <Input
                    id="fullName"
                    type="text"
                    className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                    placeholder={lang === 'np' ? 'राम बहादुर श्रेष्ठ' : 'Ram Bahadur Shrestha'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {lang === 'np' ? 'इमेल ठेगाना' : 'Email Address'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {lang === 'np' ? 'लिङ्ग' : 'Gender'}
                  </Label>
                  <Select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                  >
                    <option value="Male">{lang === 'np' ? 'पुरुष (Male)' : 'Male'}</option>
                    <option value="Female">{lang === 'np' ? 'महिला (Female)' : 'Female'}</option>
                    <option value="Other">{lang === 'np' ? 'अन्य (Other)' : 'Other'}</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {lang === 'np' ? 'जन्म मिति' : 'Date of Birth'}
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    className="h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
              </div>

              {role === 'TrafficPolice' && (
                <div className="space-y-1.5 animate-slide-up">
                  <Label htmlFor="badge" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {lang === 'np' ? 'प्रहरी ब्याज / अधिकृत नम्बर' : 'Enforcement Badge ID'}
                  </Label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <Input
                      id="badge"
                      type="text"
                      className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                      placeholder="POL-1234"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {role === 'VehicleOwner' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
                  <div className="space-y-1.5">
                    <Label htmlFor="citizenship" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {lang === 'np' ? 'नागरिकता नम्बर' : 'Citizenship Number'}
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <Input
                        id="citizenship"
                        type="text"
                        className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                        placeholder="27-01-72-..."
                        value={citizenshipNumber}
                        onChange={(e) => setCitizenshipNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {lang === 'np' ? 'स्थायी ठेगाना' : 'Permanent Address'}
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <Input
                        id="address"
                        type="text"
                        className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                        placeholder={lang === 'np' ? 'काठमाडौँ, नेपाल' : 'Kathmandu, Nepal'}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {lang === 'np' ? 'सुरक्षित पासवर्ड' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10 h-11 border-slate-200 focus:border-[#003893] focus:ring-[#003893]/20 rounded-xl text-xs"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-700 animate-slide-up text-xs font-semibold">
                <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-bold py-6 bg-gradient-to-r from-slate-900 to-[#003893] hover:from-slate-950 hover:to-[#00286b] text-white shadow-md rounded-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  {lang === 'np' ? 'खाता सिर्जना हुँदैछ...' : 'Registering...'}
                </>
              ) : (
                lang === 'np' ? 'नयाँ खाता सिर्जना गर्नुहोस्' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            {lang === 'np' ? 'पहिल्यै खाता छ?' : 'Already have an account?'}{' '}
            <Link to="/login" className="font-bold text-[#003893] hover:underline">
              {lang === 'np' ? 'यहाँ लगइन गर्नुहोस्' : 'Sign in here'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
