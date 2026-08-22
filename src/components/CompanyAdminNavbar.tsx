import React from 'react';
import { 
  Camera, 
  Menu
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
  onOpenScheduleSettings?: () => void;
  activeShiftTitle?: string;
  onOpenNavigationMenu?: () => void;
  onSignOut: () => void;
}

export const CompanyAdminNavbar: React.FC<CompanyAdminNavbarProps> = ({
  orgInfo,
  activeCompany,
  isFirebaseConnected = true,
  onOpenNavigationMenu,
}) => {
  const { terminology } = orgInfo;

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Clean, Minimal Header Row */}
        <div className="flex items-center justify-between h-15 sm:h-16 gap-3">
          
          {/* Brand Logo, Header Name & Description */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                    {activeCompany?.nameBangla || 'স্মার্ট হাজিরা AI'}
                  </span>
                  <span className="text-slate-400 text-xs font-normal hidden md:inline">
                    | {activeCompany?.nameBangla ? terminology.orgCategoryName : 'এডমিন প্যানেল'}
                  </span>
                </h1>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{terminology.companySubtitle || 'ডিজিটাল বায়োমেট্রিক ও শিফট হাজিরা ম্যানেজমেন্ট'}</span>
                {isFirebaseConnected && (
                  <span className="text-amber-400/90 font-mono hidden sm:inline">&bull; ক্লাউড সিঙ্ক</span>
                )}
              </p>
            </div>
          </div>

          {/* Clean Menu Icon on Right */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onOpenNavigationMenu}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 hover:text-white border border-slate-700/80 hover:border-emerald-500/40 transition cursor-pointer flex items-center space-x-2 shadow-sm"
              title="মেইন মেনু - সকল মডিউল, শিফট, অডিট ও সেটিংস"
            >
              <Menu className="w-5 h-5 text-emerald-400" />
              <span className="hidden sm:inline font-bold text-xs">মেনু</span>
            </button>
          </div>

        </div>

      </div>
    </nav>
  );
};
