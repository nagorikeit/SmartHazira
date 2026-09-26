import React, { useState } from 'react';
import { 
  Camera, 
  Building2, 
  LogIn, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Phone, 
  Mail, 
  Key, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Shield,
  Loader2,
  AlertTriangle,
  Building,
  UserCheck,
  Zap,
  Clock,
  Smartphone,
  ExternalLink,
  Plus,
  Eye,
  EyeOff,
  Lock
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
  onOpenPublicPortal?: () => void;
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
  onOpenPublicPortal,
}) => {
  // Role Selector: 'super_admin' | 'company' | 'user'
  const [selectedRoleType, setSelectedRoleType] = useState<'super_admin' | 'company' | 'user'>('company');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Super Admin Credentials
  const [adminPin, setAdminPin] = useState<string>('');

  // Company Login Credentials
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const [companyCodeInput, setCompanyCodeInput] = useState<string>('');
  const [companyPassword, setCompanyPassword] = useState<string>('');
  const [showCompanyPassword, setShowCompanyPassword] = useState<boolean>(false);

  // User / Employee Credentials
  const [userRollOrPhone, setUserRollOrPhone] = useState<string>('');

  // New Company Registration Form
  const [newCompNameBangla, setNewCompNameBangla] = useState('');
  const [newCompCategory, setNewCompCategory] = useState<OrgCategoryKey>('corporate');
  const [newCompCode, setNewCompCode] = useState('');
  const [newCompPhone, setNewCompPhone] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompAdmin, setNewCompAdmin] = useState('');
  const [newCompPassword, setNewCompPassword] = useState<string>('');
  const [newCompConfirmPassword, setNewCompConfirmPassword] = useState<string>('');
  const [showNewCompPassword, setShowNewCompPassword] = useState<boolean>(false);

  // 1. Super Admin Login
  const handleSuperAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const mockUser = {
      uid: 'super-admin-uid',
      email: 'superadmin@smarthazira.ai',
      displayName: 'সুপার এডমিন (সিস্টেম হেডকোয়ার্টার)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    } as unknown as User;
    onSetCurrentUser(mockUser);
    onRoleChange('super_admin');
  };

  // 2. Company Admin Login
  const handleCompanyLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    let matchedCompany = companies.find(c => c.id === selectedCompanyId);
    if (companyCodeInput.trim()) {
      const codeMatched = companies.find(
        c => c.code.toLowerCase() === companyCodeInput.trim().toLowerCase() ||
             c.contactPhone === companyCodeInput.trim()
      );
      if (codeMatched) matchedCompany = codeMatched;
    }

    if (!matchedCompany && companies.length > 0) {
      matchedCompany = companies[0];
    }

    if (!matchedCompany) {
      setErrorMessage('কোন কোম্পানি পাওয়া যায়নি। অনুগ্রহ করে প্রথমে একটি কোম্পানি নিবন্ধন করুন।');
      return;
    }

    // Verify company password if set
    if (matchedCompany.password && matchedCompany.password.trim()) {
      if (!companyPassword.trim()) {
        setErrorMessage(`"${matchedCompany.nameBangla}" কোম্পানির এডমিন পাসওয়ার্ড লিখুন।`);
        return;
      }
      if (companyPassword.trim() !== matchedCompany.password.trim()) {
        setErrorMessage('ভুল পাসওয়ার্ড! আপনার কোম্পানির সঠিক এডমিন পাসওয়ার্ড প্রদান করুন।');
        return;
      }
    }

    const mockUser = {
      uid: `comp-${matchedCompany.id}`,
      email: matchedCompany.contactEmail || 'admin@smarthazira.ai',
      displayName: `${matchedCompany.nameBangla} (${matchedCompany.adminName || 'কোম্পানি এডমিন'})`,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(matchedCompany.nameBangla)}`,
    } as unknown as User;

    onSetCurrentUser(mockUser);
    onSelectCompany(matchedCompany);
    onRoleChange('teacher'); // 'teacher' acts as Company Admin in the applet
  };

  // 3. User / Employee Login
  const handleUserLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!userRollOrPhone.trim()) {
      // Login with first student as fallback
      const defaultStudent = students[0];
      if (defaultStudent) {
        loginAsStudent(defaultStudent);
        return;
      }
      setErrorMessage('অনুগ্রহ করে আপনার আইডি বা মোবাইল নম্বর লিখুন।');
      return;
    }

    const trimmed = userRollOrPhone.trim().toLowerCase();
    const matched = students.find(
      s => String(s.roll).trim().toLowerCase() === trimmed ||
           (s.guardianPhone && s.guardianPhone.trim() === trimmed) ||
           (s.parentPhone && s.parentPhone.trim() === trimmed) ||
           s.nameBangla.toLowerCase().includes(trimmed)
    );

    if (matched) {
      loginAsStudent(matched);
    } else {
      setErrorMessage(`"${userRollOrPhone}" আইডি বা নম্বর দিয়ে কোনো কর্মী পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি দিন।`);
    }
  };

  const loginAsStudent = (std: Student) => {
    const mockUser = {
      uid: `member-${std.id}`,
      email: std.email || 'employee@smarthazira.ai',
      displayName: std.nameBangla,
      photoURL: std.faceImage || std.photoUrl,
    } as unknown as User;

    // Attach company if student has one
    if (std.companyId) {
      const cmp = companies.find(c => c.id === std.companyId);
      if (cmp) onSelectCompany(cmp);
    }

    onSetCurrentUser(mockUser);
    onSelectLoggedInStudent(std);
    onRoleChange('student');
  };

  // Handle Google Sign-In
  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const user = await signInWithGoogle();
      if (user) {
        if (selectedRoleType === 'super_admin') {
          onSetCurrentUser(user);
          onRoleChange('super_admin');
        } else if (selectedRoleType === 'user') {
          const matched = students.find(s => 
            (s.email && s.email.toLowerCase() === user.email?.toLowerCase()) ||
            s.name.toLowerCase().includes(user.displayName?.toLowerCase() || '')
          ) || students[0];
          if (matched) onSelectLoggedInStudent(matched);
          onSetCurrentUser(user);
          onRoleChange('student');
        } else {
          const matchedComp = companies.find(c => c.contactEmail?.toLowerCase() === user.email?.toLowerCase()) || companies[0];
          if (matchedComp) onSelectCompany(matchedComp);
          onSetCurrentUser(user);
          onRoleChange('teacher');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Register New Company Submit
  const handleRegisterCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!newCompNameBangla.trim() || !newCompCode.trim()) {
      setErrorMessage('কোম্পানির নাম এবং কোড আবশ্যক।');
      return;
    }

    if (!newCompPassword.trim()) {
      setErrorMessage('কোম্পানি এডমিনের জন্য একটি পাসওয়ার্ড সেটআপ করা বাধ্যতামূলক।');
      return;
    }

    if (newCompPassword.trim().length < 4) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (newCompPassword !== newCompConfirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি মিলছে না! অনুগ্রহ করে পুনরায় টাইপ করুন।');
      return;
    }

    const newCompany: RegisteredCompany = {
      id: `cmp-${Date.now()}`,
      nameBangla: newCompNameBangla.trim(),
      nameEnglish: newCompNameBangla.trim(),
      category: newCompCategory,
      code: newCompCode.trim().toUpperCase(),
      contactEmail: newCompEmail.trim() || 'info@company.com',
      contactPhone: newCompPhone.trim() || '01700000000',
      address: 'বাংলাদেশ',
      totalMembers: 0,
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      adminName: newCompAdmin.trim() || 'এডমিন',
      password: newCompPassword.trim(),
    };

    onAddCompany(newCompany);
    setIsRegisterModalOpen(false);

    // Auto login as this company
    const mockUser = {
      uid: `comp-${newCompany.id}`,
      email: newCompany.contactEmail,
      displayName: `${newCompany.nameBangla} (${newCompany.adminName})`,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newCompany.nameBangla)}`,
    } as unknown as User;
    onSetCurrentUser(mockUser);
    onSelectCompany(newCompany);
    onRoleChange('teacher');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header / Brand */}
      <header className="max-w-md w-full mx-auto pt-4 sm:pt-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-1 shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-white rounded-[20px] flex items-center justify-center">
            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 stroke-[2.2]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
          <span>স্মার্ট হাজিরা</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            মোবাইল AI
          </span>
        </h1>
        <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
          স্মার্টফোন ক্যামেরা দিয়ে দ্রুত ও নির্ভরযোগ্য ফেস হাজিরা সিস্টেম
        </p>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-6 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        
        {/* PUBLIC PORTAL BUTTON (Top Highlight for Tablet/Mobile Kiosk) */}
        {onOpenPublicPortal && (
          <button
            type="button"
            onClick={onOpenPublicPortal}
            className="w-full p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl flex items-center justify-between shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <span className="p-2 bg-white/20 rounded-xl">
                <Camera className="w-5 h-5 stroke-[2.5] text-white" />
              </span>
              <div className="text-left">
                <p className="text-xs font-black leading-tight text-white">পাবলিক ফেস হাজিরা পোর্টাল</p>
                <p className="text-[10px] text-emerald-100 font-medium">ক্যামেরা অন করে সরাসরি হাজিরা দিন</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 stroke-[3] text-white" />
          </button>
        )}

        {/* Unified Role Selector (3 Tabs: Admin, Company, User) */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            লগইন রোল নির্বাচন করুন
          </p>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            
            {/* 1. Super Admin */}
            <button
              type="button"
              onClick={() => {
                setSelectedRoleType('super_admin');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedRoleType === 'super_admin'
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-[11px]">এডমিন</span>
            </button>

            {/* 2. Company */}
            <button
              type="button"
              onClick={() => {
                setSelectedRoleType('company');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedRoleType === 'company'
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-[11px]">কোম্পানি</span>
            </button>

            {/* 3. User / Member */}
            <button
              type="button"
              onClick={() => {
                setSelectedRoleType('user');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedRoleType === 'user'
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[11px]">ইউজার</span>
            </button>

          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. SUPER ADMIN FORM */}
        {selectedRoleType === 'super_admin' && (
          <form onSubmit={handleSuperAdminLogin} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>সুপার এডমিন কন্ট্রোল</span>
              </p>
              <p className="text-[11px] text-slate-600">
                সকল নিবন্ধিত কোম্পানি পরিচালনা, মনিটরিং ও কেন্দ্রীয় নিয়ন্ত্রণ এক্সেস।
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>এডমিন প্যানেলে প্রবেশ করুন</span>
            </button>
          </form>
        )}

        {/* 2. COMPANY ADMIN FORM */}
        {selectedRoleType === 'company' && (
          <form onSubmit={handleCompanyLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                আপনার কোম্পানি নির্বাচন করুন
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-emerald-600 font-medium cursor-pointer"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameBangla} ({c.code}) - {c.totalMembers || 0} জন কর্মী
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                কোম্পানি কোড (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={companyCodeInput}
                onChange={(e) => setCompanyCodeInput(e.target.value)}
                placeholder="যেমন: SCO-2026 বা ফোন নম্বর"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                এডমিন পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showCompanyPassword ? 'text' : 'password'}
                  value={companyPassword}
                  onChange={(e) => setCompanyPassword(e.target.value)}
                  placeholder="কোম্পানি এডমিন পাসওয়ার্ড লিখুন"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCompanyPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                >
                  {showCompanyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                💡 রেজিস্ট্রেশনের সময় সেটআপ করা পাসওয়ার্ড দিন
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>কোম্পানি ড্যাশবোর্ডে প্রবেশ করুন</span>
            </button>

            {/* Quick Link to Register Company */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন কোম্পানি নিবন্ধন করুন</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. USER / MEMBER FORM */}
        {selectedRoleType === 'user' && (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                কর্মীর আইডি বা মোবাইল নম্বর *
              </label>
              <input
                type="text"
                value={userRollOrPhone}
                onChange={(e) => setUserRollOrPhone(e.target.value)}
                placeholder="যেমন: EMP-101 বা 01711223344"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-emerald-600 font-mono font-bold"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600">
              💡 ইউজার হিসেবে লগইন করে আপনি নিজের আজকের উপস্থিতি দেখতে পারবেন এবং ক্যামেরা দিয়ে ফেস হাজিরা দিতে পারবেন।
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>কর্মী ড্যাশবোর্ডে প্রবেশ করুন</span>
            </button>
          </form>
        )}

        {/* Google Sign-in Divider */}
        <div className="relative flex items-center justify-center pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-slate-400">
            অথবা
          </span>
        </div>

        {/* Google 1-Click Button */}
        <button
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleClick}
          className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl border border-slate-300 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>গুগল অ্যাকাউন্ট দিয়ে সরাসরি লগইন</span>
        </button>

      </main>

      {/* Footer info */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-slate-500 pb-2">
        <p>মোবাইল অপ্টিমাইজড • ক্যামেরা ফেস হাজিরা সিস্টেম</p>
      </footer>

      {/* MODAL: Register New Company */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>নতুন কোম্পানি নিবন্ধন</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterCompanySubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  কোম্পানির নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  value={newCompNameBangla}
                  onChange={(e) => setNewCompNameBangla(e.target.value)}
                  placeholder="যেমন: এসিআই লজিস্টিকস লিঃ"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  কোম্পানি কোড *
                </label>
                <input
                  type="text"
                  required
                  value={newCompCode}
                  onChange={(e) => setNewCompCode(e.target.value)}
                  placeholder="যেমন: ACI-2026"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={newCompCategory}
                  onChange={(e) => setNewCompCategory(e.target.value as OrgCategoryKey)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600 cursor-pointer"
                >
                  <option value="corporate">কর্পোরেট অফিস (Corporate)</option>
                  <option value="factory">কারখানা ও ফ্যাক্টরি (Factory)</option>
                  <option value="educational">শিক্ষাপ্রতিষ্ঠান (Educational)</option>
                  <option value="medical">হাসপাতাল ও ক্লিনিক (Medical)</option>
                  <option value="general">সাধারণ প্রতিষ্ঠান (General)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    value={newCompPhone}
                    onChange={(e) => setNewCompPhone(e.target.value)}
                    placeholder="01711..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    এডমিন নাম
                  </label>
                  <input
                    type="text"
                    value={newCompAdmin}
                    onChange={(e) => setNewCompAdmin(e.target.value)}
                    placeholder="ম্যানেজার / এডমিন"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  কোম্পানি ইমেইল (লগইনের জন্য)
                </label>
                <input
                  type="email"
                  value={newCompEmail}
                  onChange={(e) => setNewCompEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    পাসওয়ার্ড সেটআপ করুন *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewCompPassword ? 'text' : 'password'}
                      required
                      value={newCompPassword}
                      onChange={(e) => setNewCompPassword(e.target.value)}
                      placeholder="কমপক্ষে ৪ অক্ষর"
                      className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewCompPassword(prev => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                    >
                      {showNewCompPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    পাসওয়ার্ড নিশ্চিত করুন *
                  </label>
                  <input
                    type={showNewCompPassword ? 'text' : 'password'}
                    required
                    value={newCompConfirmPassword}
                    onChange={(e) => setNewCompConfirmPassword(e.target.value)}
                    placeholder="একই পাসওয়ার্ড দিন"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                >
                  নিবন্ধন করুন ও প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
