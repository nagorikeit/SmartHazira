import React from 'react';
import { UserRole } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { User } from 'firebase/auth';
import { 
  Camera, 
  UserCheck, 
  Shield, 
  GraduationCap, 
  Building, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Building2, 
  ShieldCheck, 
  Database,
  Menu,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  orgInfo: OrgCategoryInfo;
  onOpenOrgSelector: () => void;
  onOpenAuthPortal?: () => void;
  onOpenNavigationMenu?: () => void;
  isFirebaseConnected?: boolean;
  currentUser?: User | null;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  soundEnabled,
  onToggleSound,
  orgInfo,
  onOpenOrgSelector,
  onOpenAuthPortal,
  onOpenNavigationMenu,
  isFirebaseConnected = true,
  currentUser,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const todayDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const { terminology } = orgInfo;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Camera className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  স্মার্ট হাজিরা AI
                </h1>
                
                {/* Organization Category Badge */}
                <button
                  onClick={onOpenOrgSelector}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  title="প্রতিষ্ঠানের ধরন পরিবর্তন করুন"
                >
                  <Building className="w-3 h-3 text-emerald-400" />
                  <span>{terminology.orgCategoryName}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-400" />
                </button>

                {/* Firebase Cloud Live Badge */}
                <div 
                  className={`hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                    isFirebaseConnected 
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Firebase Firestore Cloud Database Synced (smarthazira)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <Database className="w-2.5 h-2.5 text-amber-400" />
                  <span>Firebase Live</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {terminology.adminLabel} ও {terminology.memberPlural}র স্বয়ংক্রিয় উপস্থিতি ব্যবস্থাপনা
              </p>
            </div>
          </div>

          {/* Date & Auth & Role Switcher */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            
            {/* Live Date Badge */}
            <div className="hidden sm:flex items-center text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Building className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
              <span>{todayDate}</span>
            </div>

            {/* Google User Profile and Sign Out */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5">
                <div 
                  onClick={onOpenAuthPortal}
                  className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl cursor-pointer transition"
                  title={`${currentUser.displayName || 'User'} (${currentUser.email}) - ক্লিক করে পোর্টাল দেখুন`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full border border-emerald-400 shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">
                      {currentUser.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div className="text-left hidden sm:block max-w-[110px]">
                    <p className="text-xs font-bold text-slate-200 truncate leading-tight">
                      {currentUser.displayName || 'Google User'}
                    </p>
                    <p className="text-[10px] text-emerald-400 truncate leading-tight">
                      গুগল ভেরিফাইড
                    </p>
                  </div>
                </div>

                {onGoogleSignOut && (
                  <button
                    onClick={onGoogleSignOut}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    title="লগআউট করুন"
                  >
                    <span className="hidden sm:inline text-[11px] px-1">লগআউট</span>
                    <span className="sm:hidden text-[10px]">প্রস্থান</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn || onOpenAuthPortal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer"
                title="গুগল দিয়ে দ্রুত সাইন ইন করুন"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Google লগইন</span>
                <span className="sm:hidden">লগইন</span>
              </button>
            )}

            {/* Auth / Registration Portal Trigger Button */}
            {onOpenAuthPortal && (
              <button
                onClick={onOpenAuthPortal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                title="কোম্পানি বা কর্মী রেজিস্ট্রেশন ও লগইন করুন"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">রেজিস্ট্রেশন ও পোর্টাল</span>
                <span className="sm:hidden">পোর্টাল</span>
              </button>
            )}

            {/* App Navigation / Feature Drawer Menu Button */}
            {onOpenNavigationMenu && (
              <button
                onClick={onOpenNavigationMenu}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 shadow-md transition-all cursor-pointer"
                title="অ্যাপ্লিকেশন মেনু ও টুলস ওপেন করুন"
              >
                <Menu className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">মেনু ও টুলস</span>
                <span className="sm:hidden">মেনু</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Dynamic Role Selectors */}
            <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-medium gap-1">
              <button
                onClick={() => onRoleChange('super_admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentRole === 'super_admin'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="সুপার এডমিন প্যানেল - সব কোম্পানি পরিচালনা"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">সুপার এডমিন</span>
                <span className="sm:hidden">সুপার</span>
              </button>

              <button
                onClick={() => onRoleChange('teacher')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentRole === 'teacher'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{terminology.roleAdminMode}</span>
              </button>

              <button
                onClick={() => onRoleChange('student')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentRole === 'student'
                    ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{terminology.roleMemberMode}</span>
              </button>

              <button
                onClick={() => onRoleChange('kiosk')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentRole === 'kiosk'
                    ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{terminology.roleKioskMode}</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
