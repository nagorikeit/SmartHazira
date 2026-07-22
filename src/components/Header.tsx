import React from 'react';
import { UserRole } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { Camera, UserCheck, Shield, GraduationCap, Building, Sparkles, Volume2, VolumeX, ChevronDown, Briefcase, Factory, Building2, Store, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  orgInfo: OrgCategoryInfo;
  onOpenOrgSelector: () => void;
  onOpenAuthPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  soundEnabled,
  onToggleSound,
  orgInfo,
  onOpenOrgSelector,
  onOpenAuthPortal,
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
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {terminology.adminLabel} ও {terminology.memberPlural}র স্বয়ংক্রিয় উপস্থিতি ব্যবস্থাপনা
              </p>
            </div>
          </div>

          {/* Date & Role Switcher */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            
            {/* Live Date Badge */}
            <div className="hidden sm:flex items-center text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Building className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
              <span>{todayDate}</span>
            </div>

            {/* Auth / Registration Portal Trigger Button */}
            {onOpenAuthPortal && (
              <button
                onClick={onOpenAuthPortal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                title="কোম্পানি বা কর্মী রেজিস্ট্রেশন ও লগইন করুন"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>রেজিস্ট্রেশন ও লগইন</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentRole === 'super_admin'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="সুপার এডমিন প্যানেল - সব কোম্পানি পরিচালনা"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span>সুপার এডমিন</span>
              </button>

              <button
                onClick={() => onRoleChange('teacher')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
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
