import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Building2, 
  User, 
  ChevronDown, 
  UserPlus, 
  LogOut, 
  Sliders, 
  ShieldCheck, 
  Menu, 
  QrCode, 
  MessageSquare,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { RegisteredCompany, UserRole } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { Clock } from 'lucide-react';

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
  onOpenScheduleSettings?: () => void;
  activeShiftTitle?: string;
  onOpenNavigationMenu?: () => void;
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
  onOpenScheduleSettings,
  activeShiftTitle,
  onOpenNavigationMenu,
  onSignOut,
}) => {
  const { terminology } = orgInfo;

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Clean, Clutter-Free Header Row */}
        <div className="flex items-center justify-between h-15 sm:h-16 gap-3">
          
          {/* Brand & Organization Identifier */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  স্মার্ট হাজিরা AI
                </span>

                {/* Company / Category Switcher Badge */}
                <button
                  onClick={onOpenOrgSelector}
                  className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 transition cursor-pointer"
                  title="প্রতিষ্ঠানের ধরণ বদলান"
                >
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[120px]">{activeCompany?.nameBangla || terminology.orgCategoryName}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-400" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  এডমিন ড্যাশবোর্ড
                </span>
                {isFirebaseConnected && (
                  <span className="text-amber-400/90 font-mono hidden md:inline">&bull; ক্লাউড সিঙ্ক</span>
                )}
              </div>
            </div>
          </div>

          {/* Clean Right Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Direct Schedule & Shift Settings Button */}
            {onOpenScheduleSettings && (
              <button
                onClick={onOpenScheduleSettings}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-teal-300 hover:text-white font-bold text-xs rounded-xl border border-teal-500/30 transition cursor-pointer active:scale-95 shadow-sm"
                title={activeShiftTitle ? `বর্তমান শিফট: ${activeShiftTitle} - সিডিউল ও জিওফেন্স কনফিগার করুন` : "সিডিউল, শিফট ও জিও-লোকেশন সেটিংস"}
              >
                <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="hidden md:inline truncate max-w-[130px]">
                  {activeShiftTitle || 'সিডিউল ও শিফট'}
                </span>
                <span className="md:hidden">শিফট</span>
              </button>
            )}

            {/* Quick Add Member Action */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white font-bold text-xs rounded-xl border border-emerald-500/30 transition cursor-pointer active:scale-95"
              title={`নতুন ${terminology.memberLabel} যুক্ত করুন`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">সদস্য যুক্ত</span>
              <span className="sm:hidden">+</span>
            </button>

            {/* Sound Mute/Unmute */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? "ভয়েস ও অডিও বন্ধ করুন" : "ভয়েস ও অডিও চালু করুন"}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700/60 cursor-pointer hidden sm:flex"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* All Functions & Modules Menu Drawer Trigger */}
            <button
              onClick={onOpenNavigationMenu}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition cursor-pointer font-bold text-xs"
              title="সকল মেনু ও ফিচার খুলুন"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>মেনু</span>
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`p-1.5 rounded-xl border transition flex items-center space-x-1.5 cursor-pointer ${
                  isProfileDropdownOpen
                    ? 'bg-slate-800 border-emerald-500/50 text-white'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
                title="কোম্পানি এডমিন প্রোফাইল ও সেটিংস"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-black text-xs text-white">
                  {(activeCompany?.nameBangla || currentUser?.displayName || 'ক').charAt(0)}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
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
                      <p className="text-[10px] text-slate-400">প্রতিষ্ঠানের বিবরণ ও সেটিংস</p>
                    </div>
                  </button>

                  {/* Profile Item 2: Schedule & Shift Settings */}
                  {onOpenScheduleSettings && (
                    <button
                      onClick={() => { onOpenScheduleSettings(); setIsProfileDropdownOpen(false); }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                    >
                      <div className="p-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">সিডিউল, শিফট ও জিওফেন্স</p>
                        <p className="text-[10px] text-slate-400">২৪ ঘণ্টা শিফট ও GPS লোকেশন কোড</p>
                      </div>
                    </button>
                  )}

                  {/* Profile Item 3: Public Attendance Link & QR */}
                  <button
                    onClick={() => { onOpenAttendanceLinkModal(); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">হাজিরা লিংক ও QR কোড</p>
                      <p className="text-[10px] text-slate-400">কর্মীদের সেলফ-সার্ভিস লিংক</p>
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

                  {/* Profile Item 4: Security Audit Log */}
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

                  {/* Profile Item 5: SMS / WhatsApp Alerts */}
                  <button
                    onClick={() => { onOpenSmsModal(); setIsProfileDropdownOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition text-left cursor-pointer"
                  >
                    <div className="p-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">SMS / WhatsApp সেন্টার</p>
                      <p className="text-[10px] text-slate-400">হাজিরা সতর্কতা ও নোটিফিকেশন</p>
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

          </div>

        </div>

      </div>
    </nav>
  );
};
