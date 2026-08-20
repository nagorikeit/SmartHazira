import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Database, 
  X, 
  Edit3, 
  Check, 
  LogOut, 
  Key, 
  Sparkles,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { RegisteredCompany, UserRole } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { User as FirebaseUser } from 'firebase/auth';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: RegisteredCompany | null;
  currentUser: FirebaseUser | null;
  orgInfo: OrgCategoryInfo;
  totalMembersCount: number;
  onUpdateCompany?: (updated: RegisteredCompany) => void;
  onOpenOrgSelector?: () => void;
  onSignOut?: () => void;
  onOpenAuditLogs?: () => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  company,
  currentUser,
  orgInfo,
  totalMembersCount,
  onUpdateCompany,
  onOpenOrgSelector,
  onSignOut,
  onOpenAuditLogs,
}) => {
  const { terminology } = orgInfo;

  const [isEditing, setIsEditing] = useState(false);
  const [nameBangla, setNameBangla] = useState(company?.nameBangla || 'স্মার্ট এন্টারপ্রাইজ');
  const [adminName, setAdminName] = useState(company?.adminName || currentUser?.displayName || 'কোম্পানি এডমিন');
  const [adminEmail, setAdminEmail] = useState(company?.adminEmail || currentUser?.email || 'admin@smartenterprise.bd');
  const [phone, setPhone] = useState(company?.phone || '০১৭xxxxxxxx');
  const [address, setAddress] = useState(company?.address || 'ঢাকা, বাংলাদেশ');

  if (!isOpen) return null;

  const handleSave = () => {
    if (company && onUpdateCompany) {
      onUpdateCompany({
        ...company,
        nameBangla,
        adminName,
        adminEmail,
        phone,
        address,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Cover & Avatar */}
        <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl font-black text-emerald-400">
                {nameBangla.charAt(0) || 'ক'}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black text-white truncate">
                  {nameBangla}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {terminology.orgCategoryName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ভেরিফাইড এডমিন
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-2">
                <span>কোম্পানি কোড: <strong className="text-emerald-400 font-mono">{company?.code || 'CMP-8802'}</strong></span>
                <span>&bull;</span>
                <span>স্টাফ: <strong>{totalMembersCount} জন</strong></span>
              </p>
            </div>

            <div className="shrink-0">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center space-x-1.5 shadow-sm cursor-pointer transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>তথ্য এডিট</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <Users className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900 dark:text-white">{totalMembersCount}</p>
              <p className="text-[11px] text-slate-500 font-medium">নিবন্ধিত {terminology.memberLabel}</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <Database className="w-5 h-5 text-teal-500 mx-auto mb-1" />
              <p className="text-lg font-black text-teal-600 dark:text-teal-400">সক্রিয়</p>
              <p className="text-[11px] text-slate-500 font-medium">ক্লাউড ফায়ারস্টোর</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <ShieldCheck className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">নিরাপদ</p>
              <p className="text-[11px] text-slate-500 font-medium">বায়োমেট্রিক সিস্টেম</p>
            </div>
          </div>

          {/* Detailed Info Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              কোম্পানি ও এডমিন প্রোফাইল বিবরণ
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  প্রতিষ্ঠানের নাম
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={nameBangla}
                    onChange={(e) => setNameBangla(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>{nameBangla}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  প্রধান এডমিন নাম
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>{adminName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অফিসিয়াল ইমেইল
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2 truncate">
                    <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">{adminEmail}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মোবাইল নম্বর
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-teal-500" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অফিস ঠিকানা
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{address}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Quick Settings & Security Shortcuts */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              সিস্টেম ও সিকিউরিটি অ্যাকশন
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {onOpenOrgSelector && (
                <button
                  onClick={() => { onOpenOrgSelector(); onClose(); }}
                  className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 text-left transition cursor-pointer"
                >
                  <div className="p-2 bg-emerald-500/20 text-emerald-600 rounded-xl">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">প্রতিষ্ঠানের ধরণ বদলান</p>
                    <p className="text-[10px] text-slate-500">{terminology.orgCategoryName}</p>
                  </div>
                </button>
              )}

              {onOpenAuditLogs && (
                <button
                  onClick={() => { onOpenAuditLogs(); onClose(); }}
                  className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 text-left transition cursor-pointer"
                >
                  <div className="p-2 bg-amber-500/20 text-amber-600 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">সিকিউরিটি অডিট ট্রেইল</p>
                    <p className="text-[10px] text-slate-500">লগইন ও কার্যক্রম হিস্টোরি</p>
                  </div>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {onSignOut ? (
            <button
              onClick={() => { onSignOut(); onClose(); }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center space-x-1.5 cursor-pointer transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট করুন</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
