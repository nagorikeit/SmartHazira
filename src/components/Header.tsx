import React from 'react';
import { UserRole } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { User } from 'firebase/auth';
import { 
  Camera, 
  Menu,
  LogOut
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
  orgInfo,
  onOpenNavigationMenu,
  onGoogleSignOut,
  isFirebaseConnected = true,
}) => {

  const { terminology } = orgInfo;

  return (
    <header className="bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-3">
          
          {/* Logo, Header Name & Description */}
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
                    স্মার্ট হাজিরা AI
                  </span>
                  <span className="text-slate-400 text-xs font-normal hidden md:inline">
                    | {terminology.orgCategoryName}
                  </span>
                </h1>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{terminology.companySubtitle || `${terminology.adminLabel} ও ${terminology.memberPlural}র ডিজিটাল উপস্থিতি`}</span>
                {isFirebaseConnected && (
                  <span className="text-amber-400/90 font-mono hidden sm:inline">&bull; ক্লাউড সিঙ্ক</span>
                )}
              </p>
            </div>
          </div>

          {/* Clean Action Icons on the Right */}
          <div className="flex items-center space-x-2 shrink-0">
            {onOpenNavigationMenu && (
              <button
                onClick={onOpenNavigationMenu}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 hover:text-white border border-slate-700/80 hover:border-emerald-500/40 transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                title="মেইন মেনু - সকল মডিউল, শিফট, অডিট ও সেটিংস"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
                <span className="hidden sm:inline font-bold text-xs">মেনু</span>
              </button>
            )}

            {onGoogleSignOut && (
              <button
                onClick={onGoogleSignOut}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 active:scale-95 text-red-300 hover:text-white border border-red-800/80 hover:border-red-600 transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                title="লগআউট / প্রস্থান করুন"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline font-bold text-xs">লগআউট</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
