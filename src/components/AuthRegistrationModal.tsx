import React, { useState } from 'react';
import { RegisteredCompany, Student, UserRole } from '../types';
import { OrgCategoryKey, ORG_CATEGORIES } from '../utils/organizationConfig';
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
  Shield
} from 'lucide-react';

interface AuthRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: RegisteredCompany[];
  students: Student[];
  onAddCompany: (company: RegisteredCompany) => void;
  onAddMemberToCompany: (memberData: Partial<Student>, companyId: string) => void;
  onRoleChange: (role: UserRole) => void;
  onSelectCompany: (company: RegisteredCompany) => void;
  onSelectLoggedInStudent: (student: Student) => void;
  orgCategory: OrgCategoryKey;
}

export const AuthRegistrationModal: React.FC<AuthRegistrationModalProps> = ({
  isOpen,
  onClose,
  companies,
  students,
  onAddCompany,
  onAddMemberToCompany,
  onRoleChange,
  onSelectCompany,
  onSelectLoggedInStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register_company' | 'register_member'>('login');

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

  // Register Member Form States
  const [memberCompId, setMemberCompId] = useState<string>(companies[0]?.id || '');
  const [memberNameBangla, setMemberNameBangla] = useState('');
  const [memberRoll, setMemberRoll] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberDept, setMemberDept] = useState('');
  const [memberDesignation, setMemberDesignation] = useState('');

  if (!isOpen) return null;

  // Handle Login Action
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage('');

    if (loginType === 'super_admin') {
      onRoleChange('super_admin');
      onClose();
    } else if (loginType === 'company_admin') {
      const company = companies.find(c => c.id === selectedCompanyIdForLogin) || companies[0];
      if (company) {
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
        onSelectLoggedInStudent(matchedStudent);
        onRoleChange('student');
        onClose();
      } else {
        setLoginMessage('এই রোল আইডি বা মোবাইল নম্বর সম্বলিত কোনো সদস্য খুঁজে পাওয়া যায়নি!');
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
      contactEmail: compEmail || 'info@company.com',
      contactPhone: compPhone || '01700000000',
      address: compAddress || 'ঢাকা, বাংলাদেশ',
      totalMembers: 0,
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      adminName: compAdminName || 'কোম্পানি এডমিন'
    };

    onAddCompany(newCompany);
    onSelectCompany(newCompany);
    onRoleChange('teacher');
    onClose();
  };

  // Handle Member Registration
  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNameBangla || !memberCompId) return;

    const targetCompany = companies.find(c => c.id === memberCompId) || companies[0];

    onAddMemberToCompany({
      name: memberNameBangla,
      nameBangla: memberNameBangla,
      roll: memberRoll || `ID-${Math.floor(100 + Math.random() * 900)}`,
      guardianPhone: memberPhone || '01700000000',
      department: memberDept || 'সাধারণ শাখা',
      designation: memberDesignation || 'কর্মকর্তা/সদস্য',
      companyId: targetCompany.id,
      companyName: targetCompany.nameBangla,
    }, targetCompany.id);

    onRoleChange('student');
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
                স্মার্ট হাজিরা AI - পোর্টাল রিডাইরেক্ট
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                কোম্পানি বা কর্মী রেজিস্ট্রেশন করুন ও আপনার ড্যাশবোর্ডে লগইন করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
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

          <button
            onClick={() => setActiveTab('register_member')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'register_member'
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>কর্মী রেজিস্ট্রেশন</span>
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
                <select
                  value={selectedCompanyIdForLogin}
                  onChange={(e) => setSelectedCompanyIdForLogin(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBangla} ({c.code}) - {c.adminName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loginType === 'member' && (
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  আপনার স্টাফ আইডি / রোল নম্বর অথবা মোবাইল নম্বর দিন:
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: EMP-101 অথবা 01711223344"
                  value={memberLoginPhoneOrRoll}
                  onChange={(e) => setMemberLoginPhoneOrRoll(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold"
                />
              </div>
            )}

            {loginType === 'super_admin' && (
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-indigo-800 dark:text-indigo-200 font-medium">
                সুপার এডমিন মোডে প্রবেশ করলে দেশের সকল নিবন্ধিত কোম্পানি ও বায়োমেট্রিক ডিভাইস সেন্ট্রাল হাব পরিচালনা করতে পারবেন।
              </div>
            )}

            {loginMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold">
                {loginMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 mt-4"
            >
              <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: COMPANY REGISTRATION */}
        {activeTab === 'register_company' && (
          <form onSubmit={handleRegisterCompany} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
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
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
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
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
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
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              >
                {Object.entries(ORG_CATEGORIES).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.terminology.orgCategoryName} ({meta.terminology.memberPlural})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অ্যাডমিন ইনচার্জের নাম
                </label>
                <input
                  type="text"
                  placeholder="মোঃ শরিফুল ইসলাম (HR)"
                  value={compAdminName}
                  onChange={(e) => setCompAdminName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
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
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition shadow-lg shadow-emerald-600/30 mt-2"
            >
              কোম্পানি রেজিস্ট্রেশন করুন ও এডমিন ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </form>
        )}

        {/* TAB 3: MEMBER REGISTRATION */}
        {activeTab === 'register_member' && (
          <form onSubmit={handleRegisterMember} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                আপনার প্রতিষ্ঠান/কোম্পানি নির্বাচন করুন*
              </label>
              <select
                value={memberCompId}
                onChange={(e) => setMemberCompId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameBangla} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                আপনার পূর্ণ নাম (বাংলা)*
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: রাশেদুল ইসলাম"
                value={memberNameBangla}
                onChange={(e) => setMemberNameBangla(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  স্টাফ আইডি / রোল নম্বর
                </label>
                <input
                  type="text"
                  placeholder="EMP-302"
                  value={memberRoll}
                  onChange={(e) => setMemberRoll(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মোবাইল নম্বর
                </label>
                <input
                  type="text"
                  placeholder="01711223344"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিভাগ / ডিপার্টমেন্ট
                </label>
                <input
                  type="text"
                  placeholder="একাউন্টিং"
                  value={memberDept}
                  onChange={(e) => setMemberDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  পদবী / ডেজিগনেশন
                </label>
                <input
                  type="text"
                  placeholder="সিনিয়র অফিসার"
                  value={memberDesignation}
                  onChange={(e) => setMemberDesignation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl transition shadow-lg shadow-teal-600/30 mt-2"
            >
              কর্মী হিসেবে নিবন্ধিত হন ও সদস্য ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
