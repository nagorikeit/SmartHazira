import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Users, 
  LayoutDashboard, 
  DollarSign, 
  Calendar, 
  GraduationCap, 
  Sparkles, 
  BarChart3, 
  Building2, 
  User, 
  ChevronDown, 
  UserPlus, 
  LogOut, 
  Sliders, 
  ShieldCheck, 
  Menu, 
  X, 
  QrCode, 
  MessageSquare,
  Lock,
  Volume2,
  VolumeX,
  Layers,
  Database
} from 'lucide-react';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { RegisteredCompany, UserRole } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface CompanyAdminNavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  orgInfo: OrgCategoryInfo;
  activeCompany: RegisteredCompany | null;
  currentUser: FirebaseUser | null;
  isFirebaseConnected?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenOrgSelector: () => void;
  onOpenFaceScanner: () => void;
  onOpenRegisterModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuditLog: () => void;
  onOpenSmsModal: () => void;
  onOpenAttendanceLinkModal: () => void;
  onSignOut: () => void;
}

export const CompanyAdminNavbar: React.FC<CompanyAdminNavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onSelectTab,
  orgInfo,
  activeCompany,
  currentUser,
  isFirebaseConnected = true,
  soundEnabled,
  onToggleSound,
  onOpenOrgSelector,
  onOpenFaceScanner,
  onOpenRegisterModal,
  onOpenProfileModal,
  onOpenAuditLog,
  onOpenSmsModal,
  onOpenAttendanceLinkModal,
  onSignOut,
}) => {
  const { terminology, key: orgKey } = orgInfo;

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'হাজিরা ও ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'users', label: `${terminology.memberLabel} লিস্ট`, icon: Users },
    { id: 'payroll', label: 'বেতন ও পে-রোল', icon: DollarSign },
    { id: 'leave', label: 'ছুটি ব্যবস্থাপনা', icon: Calendar },
    { id: 'somity', label: 'সঞ্চয় ও সমিতি', icon: Layers },
    { id: 'ai', label: 'AI হেলপার', icon: Sparkles },
    { id: 'analytics', label: 'এনালিটিক্স', icon: BarChart3 },
    ...(orgKey === 'educational' ? [{ id: 'academic', label: 'ক্লাস রুটিন', icon: GraduationCap }] : []),
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Org Identifier */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  স্মার্ট হাজিরা AI
                </span>

                {/* Company / Category Badge */}
                <button
                  onClick={onOpenOrgSelector}
                  className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 transition cursor-pointer"
                  title="প্রতিষ্ঠানের ধরণ বদলান"
                >
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[110px]">{activeCompany?.nameBangla || terminology.orgCategoryName}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-400" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  এডমিন প্যানেল
                </span>
                {isFirebaseConnected && (
                  <span className="text-amber-400/90 font-mono hidden md:inline">&bull; ক্লাউড সিঙ্ক</span>
                )}
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden xl:flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Actions: Attendance Button + Link Button + Add User + Profile Menu */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Primary Action 1: Quick Face Attendance Scanner Button */}
            <button
              onClick={onOpenFaceScanner}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5 cursor-pointer"
              title="ক্যামেরা দিয়ে দ্রুত হাজিরা স্ক্যান করুন"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">হাজিরা স্ক্যান</span>
              <span className="sm:hidden">হাজিরা</span>
            </button>

            {/* Primary Action 2: Public Attendance Link & QR Generator */}
            <button
              onClick={onOpenAttendanceLinkModal}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl border border-indigo-500/50 shadow-sm transition cursor-pointer"
              title="কর্মীদের জন্য নিরাপদ সেলফ-সার্ভিস হাজিরা লিংক ও QR কোড"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-200" />
              <span>হাজিরা লিংক ও QR</span>
            </button>

            {/* Primary Action 3: Add Member Shortcut */}
            <button
              onClick={onOpenRegisterModal}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
              title={`নতুন ${terminology.memberLabel} যুক্ত করুন`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>যুক্ত করুন</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60 cursor-pointer hidden md:flex"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Company Admin Profile Menu Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`p-1.5 rounded-xl border transition flex items-center space-x-2 cursor-pointer ${
                  isProfileDropdownOpen
                    ? 'bg-slate-800 border-emerald-500/50 text-white'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
                title="কোম্পানি এডমিন প্রোফাইল ও সেটিংস"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-black text-xs text-white">
                  {(activeCompany?.nameBangla || currentUser?.displayName || 'ক').charAt(0)}
                </div>
                <div className="hidden md:block text-left text-xs max-w-[100px] truncate">
                  <p className="font-bold text-white leading-tight truncate">
                    {activeCompany?.nameBangla || currentUser?.displayName || 'কোম্পানি এডমিন'}
                  </p>
                  <p className="text-[10px] text-emerald-400 leading-tight">প্রোফাইল</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Card */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn text-slate-900 dark:text-white text-xs space-y-1">
                  
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                      {activeCompany?.nameBangla || 'স্মার্ট কোম্পানি'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {currentUser?.email || activeCompany?.adminEmail || 'admin@smartenterprise.bd'}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {terminology.orgCategoryName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeCompany?.code || 'CMP-8802'}
                      </span>
                    </div>
                  </div>

                  {/* Profile Item 1: Full Profile Modal */}
                  <button
                    onClick={() => { onOpenProfileModal(); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">কোম্পানি ও এডমিন প্রোফাইল</p>
                      <p className="text-[10px] text-slate-400">প্রতিষ্ঠানের তথ্য ও বিবরণ দেখুন</p>
                    </div>
                  </button>

                  {/* Profile Item 2: Public Attendance Link & QR */}
                  <button
                    onClick={() => { onOpenAttendanceLinkModal(); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">হাজিরা লিংক ও QR কোড</p>
                      <p className="text-[10px] text-slate-400">কর্মীদের জন্য নিরাপদ লিংক জেনারেট</p>
                    </div>
                  </button>

                  {/* Profile Item 3: Switch Org Category */}
                  <button
                    onClick={() => { onOpenOrgSelector(); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">প্রতিষ্ঠানের ধরণ পরিবর্তন</p>
                      <p className="text-[10px] text-slate-400">মডেল ও পরিভাষা কনফিগার করুন</p>
                    </div>
                  </button>

                  {/* Profile Item 3: Security Audit Log */}
                  <button
                    onClick={() => { onOpenAuditLog(); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">সিকিউরিটি অডিট ট্রেইল</p>
                      <p className="text-[10px] text-slate-400">লগইন ও কার্যক্রম হিস্টোরি</p>
                    </div>
                  </button>

                  {/* Profile Item 4: SMS / WhatsApp Alerts */}
                  <button
                    onClick={() => { onOpenSmsModal(); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">SMS / WhatsApp সেন্টার</p>
                      <p className="text-[10px] text-slate-400">হাজিরা সতর্কতা ও মেসেজ পাঠান</p>
                    </div>
                  </button>

                  {/* Profile Item 5: Fullscreen Kiosk Mode */}
                  <button
                    onClick={() => { onRoleChange('kiosk'); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">ফুল-স্ক্রিন কিয়স্ক মোড</p>
                      <p className="text-[10px] text-slate-400">ট্যাবলেট বা গেট স্ক্যানার</p>
                    </div>
                  </button>

                  {/* Logout Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => { onSignOut(); setIsProfileDropdownOpen(false); }}
                      className="w-full p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>লগআউট করুন</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Sub-bar / Secondary Tab Navigation (Desktop visible for quick switching) */}
        <div className="hidden md:flex xl:hidden items-center space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-t border-slate-800 p-4 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelectTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
            <button
              onClick={() => { onOpenAttendanceLinkModal(); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-1.5 text-indigo-400 font-bold p-2 hover:bg-slate-900 rounded-lg"
            >
              <QrCode className="w-4 h-4" />
              <span>হাজিরা লিংক ও QR</span>
            </button>

            <button
              onClick={() => { onOpenProfileModal(); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-1.5 text-emerald-400 font-bold p-2 hover:bg-slate-900 rounded-lg"
            >
              <User className="w-4 h-4" />
              <span>প্রোফাইল</span>
            </button>

            <button
              onClick={() => { onSignOut(); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-1.5 text-red-400 font-bold p-2 hover:bg-slate-900 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      )}

    </nav>
  );
};
