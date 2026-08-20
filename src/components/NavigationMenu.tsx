import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Fingerprint, 
  MapPin, 
  UserPlus, 
  QrCode, 
  MessageSquare, 
  Lock, 
  Download, 
  CheckCheck, 
  DollarSign, 
  Users, 
  Calendar, 
  GraduationCap, 
  Sparkles, 
  BarChart3, 
  LayoutDashboard, 
  Building2, 
  Layers, 
  ChevronRight, 
  X, 
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { UserRole } from '../types';

interface NavigationMenuProps {
  currentRole: UserRole;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  orgInfo: OrgCategoryInfo;
  onOpenFaceScanner?: () => void;
  onOpenFingerprintScanner?: () => void;
  onOpenGeofenceModal?: () => void;
  onOpenRegisterModal?: () => void;
  onOpenSmartIdCard?: () => void;
  onOpenSmsModal?: () => void;
  onOpenAuditLog?: () => void;
  onOpenAttendanceLinkModal?: () => void;
  onExportCSV?: () => void;
  onMarkAllPresent?: () => void;
  onOpenOrgSelector?: () => void;
  onRoleChange?: (role: UserRole) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  currentRole,
  activeTab = 'dashboard',
  onSelectTab,
  orgInfo,
  onOpenFaceScanner,
  onOpenFingerprintScanner,
  onOpenGeofenceModal,
  onOpenRegisterModal,
  onOpenSmartIdCard,
  onOpenSmsModal,
  onOpenAuditLog,
  onOpenAttendanceLinkModal,
  onExportCSV,
  onMarkAllPresent,
  onOpenOrgSelector,
  onRoleChange,
  isOpen,
  onClose,
}) => {
  const { terminology, key: orgKey } = orgInfo;

  if (!isOpen) return null;

  const handleAction = (callback?: () => void) => {
    if (callback) {
      callback();
      onClose();
    }
  };

  const handleTabSwitch = (tab: string) => {
    if (onSelectTab) {
      onSelectTab(tab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Menu Drawer Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-slideLeft overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl text-slate-950 shadow-md">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>অ্যাপ্লিকেশন মেনু ও টুলস</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                সকল ফিচার ও মডিউল এক নজরে
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Main Views & Tabs */}
          {currentRole === 'teacher' && onSelectTab && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  প্রধান ড্যাশবোর্ড ও মডিউল
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {activeTab}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTabSwitch('dashboard')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-xs">উপস্থিতি ড্যাশবোর্ড</p>
                    <p className="text-[10px] opacity-70">দৈনিক হাজিরা</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSwitch('users')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-emerald-400" />
                  <div className="truncate">
                    <p className="font-bold text-xs">{terminology.memberLabel} লিস্ট</p>
                    <p className="text-[10px] opacity-70">ইউজার ডিরেক্টরি</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSwitch('payroll')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === 'payroll'
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <DollarSign className="w-4 h-4 shrink-0 text-emerald-400" />
                  <div className="truncate">
                    <p className="font-bold text-xs">বেতন ও পে-রোল</p>
                    <p className="text-[10px] opacity-70">মাসিক স্যালারি</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSwitch('somity')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === 'somity'
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-teal-400" />
                  <div className="truncate">
                    <p className="font-bold text-xs">সমিতি সঞ্চয় ও ঋণ</p>
                    <p className="text-[10px] opacity-70">ডিপিএস ও কিস্তি</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSwitch('leave')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === 'leave'
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0 text-indigo-400" />
                  <div className="truncate">
                    <p className="font-bold text-xs">ছুটি ব্যবস্থাপনা</p>
                    <p className="text-[10px] opacity-70">আবেদন অনুমোদন</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSwitch('ai')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === 'ai'
                      ? 'bg-slate-900 dark:bg-purple-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
                  <div className="truncate">
                    <p className="font-bold text-xs">AI রিপোর্ট হেলপার</p>
                    <p className="text-[10px] opacity-70">Gemini সামারি</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSwitch('analytics')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0 text-cyan-400" />
                  <div className="truncate">
                    <p className="font-bold text-xs">ভিজ্যুয়াল এনালিটিক্স</p>
                    <p className="text-[10px] opacity-70">চার্ট ও ট্রেন্ড</p>
                  </div>
                </button>

                {orgKey === 'educational' && (
                  <button
                    onClick={() => handleTabSwitch('academic')}
                    className={`col-span-2 p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                      activeTab === 'academic'
                        ? 'bg-slate-900 dark:bg-blue-600 text-white border-transparent shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500/40'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0 text-blue-400" />
                    <div>
                      <p className="font-bold text-xs">ক্লাস রুটিন ও শিক্ষা ব্যবস্থা</p>
                      <p className="text-[10px] opacity-70">টিচার ও বিষয়ভিত্তিক শিডিউল</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Quick Scanning & Biometric Tools */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              হাজিরা ও বায়োমেট্রিক স্ক্যানার
            </span>

            <div className="space-y-1.5">
              {onOpenAttendanceLinkModal && (
                <button
                  onClick={() => handleAction(onOpenAttendanceLinkModal)}
                  className="w-full p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex items-center justify-between hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition cursor-pointer text-left shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">পাবলিক হাজিরা লিংক ও কিউআর</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">কর্মীদের জন্য নিরাপদ লিংক ও প্রিন্টযোগ্য QR</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onOpenFaceScanner && (
                <button
                  onClick={() => handleAction(onOpenFaceScanner)}
                  className="w-full p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-xs">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">AI ফেস রিকগনিশন ক্যামেরা</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">লাইভ ক্যামেরা দিয়ে স্বয়ংক্রিয় ফেস স্ক্যান</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onOpenFingerprintScanner && (
                <button
                  onClick={() => handleAction(onOpenFingerprintScanner)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">বায়োমেট্রিক ফিঙ্গারপ্রিন্ট ডিভাইস</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">USB/ZKTeco ফিঙ্গারপ্রিন্ট সেন্সর কানেক্ট</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onOpenGeofenceModal && (
                <button
                  onClick={() => handleAction(onOpenGeofenceModal)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">GPS সেলফি ও জিওফেন্সিং</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">অফিস পরিধি সীমানা ও লোকেশন ভেরিফিকেশন</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onMarkAllPresent && (
                <button
                  onClick={() => handleAction(onMarkAllPresent)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <CheckCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">এক ক্লিকে সবাইকে উপস্থিত করুন</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">বর্তমান শিফটের সবাইকে প্রেজেন্ট মার্ক করুন</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Management & Utilities */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              কর্মী ও ইউটিলিটি টুলস
            </span>

            <div className="space-y-1.5">
              {onOpenRegisterModal && (
                <button
                  onClick={() => handleAction(onOpenRegisterModal)}
                  className="w-full p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-between hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer text-left shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">{terminology.registerActionText}</p>
                      <p className="text-[11px] text-slate-400">নতুন স্টাফ বা কর্মী নিবন্ধন ও ফেস আইডি</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onOpenSmartIdCard && (
                <button
                  onClick={() => handleAction(onOpenSmartIdCard)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">ডিজিটাল স্মার্ট আইডি কার্ড</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">QR কোড ও বারকোড সহ প্রিন্টযোগ্য আইডি</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onOpenSmsModal && (
                <button
                  onClick={() => handleAction(onOpenSmsModal)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">WhatsApp ও SMS নোটিফিকেশন</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">উপস্থিতি ও অনুপস্থিতির এসএমএস এলার্ট</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onOpenAuditLog && (
                <button
                  onClick={() => handleAction(onOpenAuditLog)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">সিকিউরিটি অডিট ও লগস</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">সিস্টেমের সকল পরিবর্তন ও লগইন ট্রেইল</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onExportCSV && (
                <button
                  onClick={() => handleAction(onExportCSV)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-500/20 text-slate-700 dark:text-slate-300 rounded-xl">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">হাজিরা রিপোর্ট CSV ডাউনলোড</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">এক্সেল ফরম্যাটে ডাটা এক্সপোর্ট করুন</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Section 4: Role Switcher & System Settings */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              সিস্টেম ও রোল নেভিগেশন
            </span>

            <div className="grid grid-cols-2 gap-2">
              {onOpenOrgSelector && (
                <button
                  onClick={() => handleAction(onOpenOrgSelector)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-left flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">প্রতিষ্ঠানের ধরণ</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{terminology.orgCategoryName}</p>
                  </div>
                </button>
              )}

              {onRoleChange && (
                <button
                  onClick={() => { onRoleChange('kiosk'); onClose(); }}
                  className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-2xl text-left flex items-center space-x-2 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-xs text-cyan-900 dark:text-cyan-200">কিয়স্ক মোড</p>
                    <p className="text-[10px] text-cyan-600 dark:text-cyan-400">ফুল-স্ক্রিন হাজিরা</p>
                  </div>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-400">
          স্মার্ট হাজিরা AI &bull; সকল সিস্টেম ফিচার সেন্ট্রালাইজড
        </div>

      </div>
    </div>
  );
};
