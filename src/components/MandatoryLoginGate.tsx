import React, { useState } from 'react';
import { 
  Camera, 
  Building2, 
  LogIn, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Factory, 
  Store, 
  Phone, 
  Mail, 
  Key, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Shield,
  Loader2,
  AlertTriangle,
  Fingerprint,
  MapPin,
  HelpCircle,
  Building
} from 'lucide-react';
import { RegisteredCompany, Student, UserRole } from '../types';
import { OrgCategoryKey, ORG_CATEGORIES } from '../utils/organizationConfig';
import { signInWithGoogle } from '../lib/firebase';
import { User } from 'firebase/auth';

interface MandatoryLoginGateProps {
  onGoogleSignIn: () => Promise<void>;
  companies: RegisteredCompany[];
  students: Student[];
  onAddCompany: (company: RegisteredCompany) => void;
  onRoleChange: (role: UserRole) => void;
  onSelectCompany: (company: RegisteredCompany) => void;
  onSelectLoggedInStudent: (student: Student) => void;
  onSetCurrentUser: (user: User) => void;
  orgCategory: OrgCategoryKey;
}

export const MandatoryLoginGate: React.FC<MandatoryLoginGateProps> = ({
  onGoogleSignIn,
  companies,
  students,
  onAddCompany,
  onRoleChange,
  onSelectCompany,
  onSelectLoggedInStudent,
  onSetCurrentUser,
  orgCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register_company'>('login');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Login Form States
  const [loginType, setLoginType] = useState<'super_admin' | 'company_admin' | 'member'>('company_admin');
  const [selectedCompanyIdForLogin, setSelectedCompanyIdForLogin] = useState<string>(companies[0]?.id || '');
  const [memberLoginPhoneOrRoll, setMemberLoginPhoneOrRoll] = useState<string>('');
  const [companySecurityCode, setCompanySecurityCode] = useState<string>('');
  const [superAdminCode, setSuperAdminCode] = useState<string>('');

  // Register Company Form States
  const [compNameBangla, setCompNameBangla] = useState('');
  const [compNameEnglish, setCompNameEnglish] = useState('');
  const [compCategory, setCompCategory] = useState<OrgCategoryKey>('corporate');
  const [compCode, setCompCode] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compAdminName, setCompAdminName] = useState('');

  // Handle Google Sign-In
  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Role inference: check if user matches a company or worker
        const effectiveRole: UserRole = loginType === 'super_admin' ? 'super_admin' : loginType === 'member' ? 'student' : 'teacher';

        if (effectiveRole === 'student') {
          const matched = students.find(s => 
            (s.email && s.email.toLowerCase() === user.email?.toLowerCase()) ||
            s.name.toLowerCase().includes(user.displayName?.toLowerCase() || '')
          );
          if (matched) {
            onSelectLoggedInStudent(matched);
          }
        } else if (effectiveRole === 'teacher' && companies.length > 0) {
          const matchedComp = companies.find(c => c.contactEmail?.toLowerCase() === user.email?.toLowerCase()) || companies[0];
          onSelectCompany(matchedComp);
        }

        onSetCurrentUser(user);
        onRoleChange(effectiveRole);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (loginType === 'super_admin') {
      const mockUser = {
        uid: 'super-admin-uid',
        email: 'superadmin@smarthazira.ai',
        displayName: 'সুপার এডমিন (হেডকোয়ার্টার)',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      } as unknown as User;
      onSetCurrentUser(mockUser);
      onRoleChange('super_admin');
    } else if (loginType === 'company_admin') {
      const company = companies.find(c => c.id === selectedCompanyIdForLogin) || companies[0];
      if (!company) {
        setErrorMessage('কোনো কোম্পানি পাওয়া যায়নি। অনুগ্রহ করে প্রথমে কোম্পানি নিবন্ধন করুন।');
        return;
      }
      const mockUser = {
        uid: `comp-${company.id}`,
        email: company.contactEmail,
        displayName: `${company.nameBangla} (${company.adminName})`,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.nameBangla)}`,
      } as unknown as User;
      onSetCurrentUser(mockUser);
      onSelectCompany(company);
      onRoleChange('teacher');
    } else if (loginType === 'member') {
      if (!memberLoginPhoneOrRoll.trim()) {
        setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বর অথবা স্টাফ/রোল আইডি প্রদান করুন');
        return;
      }
      const matchedStudent = students.find(s => 
        s.roll.toLowerCase() === memberLoginPhoneOrRoll.trim().toLowerCase() ||
        s.guardianPhone === memberLoginPhoneOrRoll.trim() ||
        (s.email && s.email.toLowerCase() === memberLoginPhoneOrRoll.trim().toLowerCase())
      );

      if (matchedStudent) {
        const mockUser = {
          uid: `member-${matchedStudent.id}`,
          email: matchedStudent.email || `${matchedStudent.roll.toLowerCase()}@company.com`,
          displayName: matchedStudent.nameBangla,
          photoURL: matchedStudent.photoUrl,
        } as unknown as User;
        onSetCurrentUser(mockUser);
        onSelectLoggedInStudent(matchedStudent);
        onRoleChange('student');
      } else {
        setErrorMessage('এই রোল আইডি বা মোবাইল নম্বর সম্বলিত কোনো কর্মী/সদস্য খুঁজে পাওয়া যায়নি! কোম্পানি এডমিনের সাথে যোগাযোগ করুন।');
      }
    }
  };

  // Handle Company Registration Submit
  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!compNameBangla || !compCode) {
      setErrorMessage('প্রতিষ্ঠানের নাম এবং কোম্পানি কোড প্রদান করা আবশ্যক');
      return;
    }

    const newCompany: RegisteredCompany = {
      id: `cmp-${Date.now()}`,
      nameBangla: compNameBangla,
      nameEnglish: compNameEnglish || compNameBangla,
      category: compCategory,
      code: compCode.toUpperCase(),
      contactEmail: compEmail || 'admin@company.com',
      contactPhone: compPhone || '01700000000',
      address: compAddress || 'ঢাকা, বাংলাদেশ',
      totalMembers: 0,
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      adminName: compAdminName || 'কোম্পানি এডমিন'
    };

    const mockUser = {
      uid: `comp-${newCompany.id}`,
      email: newCompany.contactEmail,
      displayName: `${newCompany.nameBangla} (${newCompany.adminName})`,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newCompany.nameBangla)}`,
    } as unknown as User;

    onAddCompany(newCompany);
    onSetCurrentUser(mockUser);
    onSelectCompany(newCompany);
    onRoleChange('teacher');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white font-sans">
      
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl z-10 space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-2xl shadow-emerald-500/30">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            স্মার্ট হাজিরা AI - পোর্টাল
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            ক্লাউড ভিত্তিক বায়োমেট্রিক ফেস রিকগনিশন, জিওফেন্সিং ও স্বয়ংক্রিয় উপস্থিতি ব্যবস্থাপনা
          </p>
        </div>

        {/* Main Portal Container */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          
          {/* Quick Google Sign-In */}
          <div>
            <button
              onClick={handleGoogleClick}
              disabled={isGoogleLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-white/5 transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Google অ্যাকাউন্ট দিয়ে এক ক্লিকে সাইন ইন করুন</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-bold">অথবা আইডি দিয়ে লগইন / রেজিস্ট্রেশন</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl text-xs font-bold border border-slate-800">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>লগইন পোর্টাল</span>
            </button>

            <button
              onClick={() => { setActiveTab('register_company'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'register_company'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>কোম্পানি রেজিস্ট্রেশন</span>
            </button>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN PORTAL */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block font-extrabold text-slate-300">
                  লগইন এর ভূমিকা (Role) নির্বাচন করুন:
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginType('company_admin')}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                      loginType === 'company_admin'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px]">কোম্পানি এডমিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginType('member')}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                      loginType === 'member'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4 text-teal-400" />
                    <span className="text-[11px]">কর্মী / স্টাফ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginType('super_admin')}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                      loginType === 'super_admin'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-[11px]">সুপার এডমিন</span>
                  </button>
                </div>
              </div>

              {/* Sub-form: Company Admin */}
              {loginType === 'company_admin' && (
                <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      প্রতিষ্ঠান / কোম্পানি নির্বাচন করুন:
                    </label>
                    {companies.length > 0 ? (
                      <select
                        value={selectedCompanyIdForLogin}
                        onChange={(e) => setSelectedCompanyIdForLogin(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 text-white border border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id} className="text-white bg-slate-900">
                            {c.nameBangla} ({c.code}) - এডমিন: {c.adminName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                        এখনও কোনো কোম্পানি নিবন্ধিত হয়নি। উপরের <b>"কোম্পানি রেজিস্ট্রেশন"</b> ট্যাবে ক্লিক করে আপনার প্রতিষ্ঠান নিবন্ধন করুন।
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      কোম্পানি পিন / সিকিউরিটি কোড (ঐচ্ছিক):
                    </label>
                    <input
                      type="password"
                      placeholder="ডিফল্ট মাস্টার কোড বা খালি রাখুন"
                      value={companySecurityCode}
                      onChange={(e) => setCompanySecurityCode(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Sub-form: Member / Worker */}
              {loginType === 'member' && (
                <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-[11px] leading-relaxed">
                    <b>কর্মী নোটিশ:</b> কোম্পানি এডমিন ড্যাশবোর্ড থেকে যুক্ত করা স্টাফ/রোল আইডি বা মোবাইল নম্বর দিয়ে প্রবেশ করুন।
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      স্টাফ আইডি / রোল নম্বর অথবা মোবাইল:*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: EMP-101 বা 01711223344"
                      value={memberLoginPhoneOrRoll}
                      onChange={(e) => setMemberLoginPhoneOrRoll(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Sub-form: Super Admin */}
              {loginType === 'super_admin' && (
                <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-[11px]">
                    সেন্ট্রাল সুপার এডমিন এক্সেস: সকল নিবন্ধিত কোম্পানি ও কেন্দ্রীয় সার্ভার ম্যানেজমেন্ট।
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      হেডকোয়ার্টার মাস্টার এক্সেস কোড:*
                    </label>
                    <input
                      type="password"
                      placeholder="হেডকোয়ার্টার কি"
                      value={superAdminCode}
                      onChange={(e) => setSuperAdminCode(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>
                  {loginType === 'company_admin'
                    ? 'কোম্পানি এডমিন হিসেবে প্রবেশ করুন'
                    : loginType === 'member'
                    ? 'কর্মী ড্যাশবোর্ডে প্রবেশ করুন'
                    : 'সুপার এডমিন কন্ট্রোল প্যানেলে প্রবেশ করুন'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER COMPANY */}
          {activeTab === 'register_company' && (
            <form onSubmit={handleRegisterCompany} className="space-y-3 text-xs">
              
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] leading-relaxed">
                নতুন প্রতিষ্ঠান বা কোম্পানি নিবন্ধন করে সরাসরি এডমিন ড্যাশবোর্ডে প্রবেশ করুন। পরবর্তীতে কোম্পানি থেকেই কর্মীদের যুক্ত করতে পারবেন।
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  প্রতিষ্ঠানের পূর্ণ নাম (বাংলা)*
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: গ্রিন টেকনোলজিস লিমিটেড"
                  value={compNameBangla}
                  onChange={(e) => setCompNameBangla(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    প্রতিষ্ঠানের নাম (English)
                  </label>
                  <input
                    type="text"
                    placeholder="Green Tech Ltd"
                    value={compNameEnglish}
                    onChange={(e) => setCompNameEnglish(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    প্রতিষ্ঠানের ধরণ (Category)*
                  </label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as OrgCategoryKey)}
                    className="w-full p-2.5 bg-slate-900 text-white border border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="corporate" className="bg-slate-900 text-white">কর্পোরেট অফিস / IT কোম্পানি</option>
                    <option value="garments" className="bg-slate-900 text-white">গার্মেন্টস ও টেক্সটাইল</option>
                    <option value="factory" className="bg-slate-900 text-white">ফ্যাক্টরি ও শিল্প কারখানা</option>
                    <option value="educational" className="bg-slate-900 text-white">শিক্ষা প্রতিষ্ঠান (স্কুল/কলেজ)</option>
                    <option value="retail" className="bg-slate-900 text-white">দোকান / রিটেল শপ</option>
                    <option value="hospital" className="bg-slate-900 text-white">হাসপাতাল ও ক্লিনিক</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    ইউনিক কোম্পানি কোড*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: GTL-2026"
                    value={compCode}
                    onChange={(e) => setCompCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    কোম্পানি এডমিন নাম
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: পরিচালক / ম্যানেজার"
                    value={compAdminName}
                    onChange={(e) => setCompAdminName(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    অফিসিয়াল ইমেইল
                  </label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={compEmail}
                    onChange={(e) => setCompEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="01711223344"
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  অফিসের ঠিকানা
                </label>
                <input
                  type="text"
                  placeholder="যেমন: লেভেল ৪, গুলশান-২, ঢাকা"
                  value={compAddress}
                  onChange={(e) => setCompAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-600/30 mt-2 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>কোম্পানি রেজিস্ট্রেশন সম্পন্ন করুন ও এডমিন ড্যাশবোর্ডে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Policy Banner for Worker & Company */}
          <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-[11px] text-slate-400 leading-relaxed flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <b>কোম্পানি ও কর্মী নীতিমালা:</b> প্রত্যেক কর্মী কোম্পানির অধীনে থাকবেন এবং কোম্পানি নিজেই তার ড্যাশবোর্ড থেকে কর্মীদের সংযুক্ত করবে। কর্মীরা তাদের স্টাফ আইডি দিয়ে সরাসরি লগইন করবেন।
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          স্মার্ট হাজিরা AI &copy; ২০২৬ &bull; Firebase Firestore রিয়েল-টাইম ক্লাউড ডাটাবেজ সুরক্ষিত
        </div>

      </div>
    </div>
  );
};
