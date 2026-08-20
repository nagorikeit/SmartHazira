import React, { useState } from 'react';
import { RegisteredCompany, Student, UserRole } from '../types';
import { OrgCategoryKey, ORG_CATEGORIES } from '../utils/organizationConfig';
import { signInWithGoogle, signOutUser } from '../lib/firebase';
import { User } from 'firebase/auth';
import { 
  Building2, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  Users, 
  X, 
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
  LogOut,
  Loader2
} from 'lucide-react';

interface AuthRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: RegisteredCompany[];
  students: Student[];
  onAddCompany: (company: RegisteredCompany) => void;
  onAddMemberToCompany?: (memberData: Partial<Student>, companyId: string) => void;
  onRoleChange: (role: UserRole) => void;
  onSelectCompany: (company: RegisteredCompany) => void;
  onSelectLoggedInStudent: (student: Student) => void;
  orgCategory: OrgCategoryKey;
  currentUser?: User | null;
  currentRole?: UserRole;
  isCompanyLoggedIn?: boolean;
  onSetCurrentUser?: (user: User) => void;
}

export const AuthRegistrationModal: React.FC<AuthRegistrationModalProps> = ({
  isOpen,
  onClose,
  companies,
  students,
  onAddCompany,
  onRoleChange,
  onSelectCompany,
  onSelectLoggedInStudent,
  currentUser,
  onSetCurrentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register_company'>('login');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // Login Form States
  const [loginType, setLoginType] = useState<'super_admin' | 'company_admin' | 'member'>('company_admin');
  const [selectedCompanyIdForLogin, setSelectedCompanyIdForLogin] = useState<string>(companies[0]?.id || '');
  const [memberLoginPhoneOrRoll, setMemberLoginPhoneOrRoll] = useState<string>('');
  const [loginMessage, setLoginMessage] = useState<string>('');

  // Register Company Form States
  const [compNameBangla, setCompNameBangla] = useState('');
  const [compNameEnglish, setCompNameEnglish] = useState('');
  const [compCategory, setCompCategory] = useState<OrgCategoryKey>('corporate');
  const [compCode, setCompCode] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compAdminName, setCompAdminName] = useState('');

  if (!isOpen) return null;

  // Handle Google Login
  const handleGoogleLogin = async (targetRole?: UserRole) => {
    try {
      setIsGoogleLoading(true);
      setLoginMessage('');
      const user = await signInWithGoogle();
      if (user) {
        // Choose role or fallback
        const effectiveRole = targetRole || (loginType === 'super_admin' ? 'super_admin' : loginType === 'member' ? 'student' : 'teacher');
        
        // Auto-match or associate member if available
        if (effectiveRole === 'student') {
          const matched = students.find(s => 
            (s.email && s.email.toLowerCase() === user.email?.toLowerCase()) ||
            s.name.toLowerCase().includes(user.displayName?.toLowerCase() || '')
          );
          if (matched) {
            onSelectLoggedInStudent(matched);
          }
        }
        
        if (onSetCurrentUser) {
          onSetCurrentUser(user);
        }
        onRoleChange(effectiveRole);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setLoginMessage(err?.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setLoginMessage('সফলভাবে লগআউট সম্পন্ন হয়েছে');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle Traditional Login Action
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage('');

    if (loginType === 'super_admin') {
      const mockUser = {
        uid: 'super-admin-uid',
        email: 'superadmin@smarthazira.ai',
        displayName: 'সুপার এডমিন (সেন্ট্রাল হেডকোয়ার্টার)',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      } as unknown as User;
      if (onSetCurrentUser) onSetCurrentUser(mockUser);
      onRoleChange('super_admin');
      onClose();
    } else if (loginType === 'company_admin') {
      const company = companies.find(c => c.id === selectedCompanyIdForLogin) || companies[0];
      if (company) {
        const mockUser = {
          uid: `comp-${company.id}`,
          email: company.contactEmail,
          displayName: `${company.nameBangla} (${company.adminName})`,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.nameBangla)}`,
        } as unknown as User;
        if (onSetCurrentUser) onSetCurrentUser(mockUser);
        onSelectCompany(company);
        onRoleChange('teacher');
        onClose();
      }
    } else if (loginType === 'member') {
      if (!memberLoginPhoneOrRoll.trim()) {
        setLoginMessage('অনুগ্রহ করে আপনার মোবাইল নম্বর অথবা স্টাফ/রোল আইডি প্রদান করুন');
        return;
      }
      const matchedStudent = students.find(s => 
        s.roll.toLowerCase() === memberLoginPhoneOrRoll.trim().toLowerCase() ||
        s.guardianPhone === memberLoginPhoneOrRoll.trim()
      );

      if (matchedStudent) {
        const mockUser = {
          uid: `member-${matchedStudent.id}`,
          email: matchedStudent.email || `${matchedStudent.roll.toLowerCase()}@company.com`,
          displayName: matchedStudent.nameBangla,
          photoURL: matchedStudent.photoUrl,
        } as unknown as User;
        if (onSetCurrentUser) onSetCurrentUser(mockUser);
        onSelectLoggedInStudent(matchedStudent);
        onRoleChange('student');
        onClose();
      } else {
        setLoginMessage('এই রোল আইডি বা মোবাইল নম্বর সম্বলিত কোনো সদস্য খুঁজে পাওয়া যায়নি! কোম্পানি এডমিনের সাথে যোগাযোগ করুন।');
      }
    }
  };

  // Handle Company Registration
  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compNameBangla || !compCode) return;

    const newCompany: RegisteredCompany = {
      id: `cmp-${Date.now()}`,
      nameBangla: compNameBangla,
      nameEnglish: compNameEnglish || compNameBangla,
      category: compCategory,
      code: compCode,
      contactEmail: compEmail || currentUser?.email || 'info@company.com',
      contactPhone: compPhone || '01700000000',
      address: compAddress || 'ঢাকা, বাংলাদেশ',
      totalMembers: 0,
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      adminName: compAdminName || currentUser?.displayName || 'কোম্পানি এডমিন'
    };

    const mockUser = {
      uid: `comp-${newCompany.id}`,
      email: newCompany.contactEmail,
      displayName: `${newCompany.nameBangla} (${newCompany.adminName})`,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newCompany.nameBangla)}`,
    } as unknown as User;

    if (onSetCurrentUser) onSetCurrentUser(mockUser);
    onAddCompany(newCompany);
    onSelectCompany(newCompany);
    onRoleChange('teacher');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative animate-fadeIn my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                স্মার্ট হাজিরা AI - অথেনটিকেশন পোর্টাল
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                গুগল অথবা রোল আইডি দিয়ে নিরাপদে সাইন-ইন ও রেজিস্ট্রেশন করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Authentication Quick Action Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 text-white space-y-3 shadow-lg">
          {currentUser ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border-2 border-emerald-500 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    {currentUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-xs truncate">{currentUser.displayName || 'Google User'}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      লগইনকৃত
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1 shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ওয়ান-ক্লিক নিরাপদ গুগল লগইন</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                  Firebase Verified
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 text-slate-800 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Google অ্যাকাউন্ট দিয়ে সাইন ইন করুন</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('login')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'login'
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন পোর্টাল</span>
          </button>

          <button
            onClick={() => setActiveTab('register_company')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'register_company'
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>কোম্পানি রেজিস্ট্রেশন</span>
          </button>
        </div>

        {/* TAB 1: LOGIN PORTAL */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-2">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200">
                লগইন এর ভূমিকা (Role) নির্বাচন করুন:
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLoginType('company_admin')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                    loginType === 'company_admin'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span className="text-[11px]">কোম্পানি এডমিন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginType('member')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                    loginType === 'member'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <Users className="w-5 h-5 text-teal-500" />
                  <span className="text-[11px]">কর্মী / স্টুডেন্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginType('super_admin')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                    loginType === 'super_admin'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-extrabold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <span className="text-[11px]">সুপার এডমিন</span>
                </button>
              </div>
            </div>

            {/* Dynamic Inputs Based on Role */}
            {loginType === 'company_admin' && (
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  আপনার নিবন্ধিত কোম্পানি/প্রতিষ্ঠান নির্বাচন করুন:
                </label>
                {companies.length > 0 ? (
                  <select
                    value={selectedCompanyIdForLogin}
                    onChange={(e) => setSelectedCompanyIdForLogin(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-900 bg-white dark:bg-slate-800 dark:text-white">
                        {c.nameBangla} ({c.code}) - {c.adminName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
                    এখনও কোনো কোম্পানি নিবন্ধিত হয়নি। প্রথমে <b>"কোম্পানি নিবন্ধন"</b> ট্যাবে ক্লিক করে আপনার প্রতিষ্ঠান যুক্ত করুন।
                  </div>
                )}
              </div>
            )}

            {loginType === 'member' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-2xl text-teal-800 dark:text-teal-200 text-xs leading-relaxed">
                  <p className="font-bold flex items-center space-x-1 mb-1 text-teal-900 dark:text-teal-100">
                    <ShieldCheck className="w-4 h-4 text-teal-500" />
                    <span>কর্মী লগইন নীতিমালা:</span>
                  </p>
                  <p>
                    প্রত্যেক কর্মী কোম্পানির অধীনে সংযুক্ত থাকেন। কোম্পানি নিজে তার ড্যাশবোর্ড থেকে কর্মীদের যুক্ত করে। কর্মী নিজে একা রেজিস্ট্রেশন করতে পারে না। আপনার কোম্পানি কর্তৃক প্রদত্ত <b>স্টাফ আইডি / রোল</b> অথবা <b>মোবাইল নম্বর</b> দিয়ে সরাসরি লগইন করুন।
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    আপনার স্টাফ আইডি / রোল নম্বর অথবা মোবাইল নম্বর দিন:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: EMP-101 অথবা 01711223344"
                    value={memberLoginPhoneOrRoll}
                    onChange={(e) => setMemberLoginPhoneOrRoll(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {loginType === 'super_admin' && (
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-indigo-800 dark:text-indigo-200 font-medium">
                সুপার এডমিন মোডে প্রবেশ করলে দেশের সকল নিবন্ধিত কোম্পানি ও বায়োমেট্রিক ডিভাইস সেন্ট্রাল হাব পরিচালনা করতে পারবেন।
              </div>
            )}

            {loginMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-bold">
                {loginMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 mt-4 cursor-pointer"
            >
              <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: COMPANY REGISTRATION */}
        {activeTab === 'register_company' && (
          <form onSubmit={handleRegisterCompany} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  কোম্পানি নাম (বাংলা)*
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বেঙ্গল সফ্টওয়্যার লিমিটেড"
                  value={compNameBangla}
                  onChange={(e) => setCompNameBangla(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  কোম্পানি আইডি/কোড*
                </label>
                <input
                  type="text"
                  required
                  placeholder="BSL-CORP-01"
                  value={compCode}
                  onChange={(e) => setCompCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                প্রতিষ্ঠানের ক্যাটাগরি*
              </label>
              <select
                value={compCategory}
                onChange={(e) => setCompCategory(e.target.value as OrgCategoryKey)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {Object.entries(ORG_CATEGORIES).map(([key, meta]) => (
                  <option key={key} value={key} className="text-slate-900 bg-white dark:bg-slate-800 dark:text-white">
                    {meta.terminology.orgCategoryName} ({meta.terminology.memberPlural})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অ্যাডমিন ইনচার্জের নাম
                </label>
                <input
                  type="text"
                  placeholder="মোঃ শরিফুল ইসলাম (HR)"
                  value={compAdminName || currentUser?.displayName || ''}
                  onChange={(e) => setCompAdminName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মোবাইল নম্বর
                </label>
                <input
                  type="text"
                  placeholder="01711002233"
                  value={compPhone}
                  onChange={(e) => setCompPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition shadow-lg shadow-emerald-600/30 mt-2 cursor-pointer"
            >
              কোম্পানি রেজিস্ট্রেশন করুন ও এডমিন ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
