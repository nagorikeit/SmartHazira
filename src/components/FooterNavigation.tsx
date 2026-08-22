import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Camera, 
  BarChart3, 
  User,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { UserRole } from '../types';

interface FooterNavigationProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  orgInfo: OrgCategoryInfo;
  onOpenFaceScanner?: () => void;
  onOpenNavMenu?: () => void;
  onOpenProfileModal?: () => void;
  onOpenFingerprintScanner?: () => void;
  onOpenRegisterModal?: () => void;
  onOpenAttendanceLinkModal?: () => void;
}

export const FooterNavigation: React.FC<FooterNavigationProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  orgInfo,
  onOpenFaceScanner,
  onOpenNavMenu,
  onOpenProfileModal,
}) => {
  const { terminology } = orgInfo;

  return (
    <footer 
      id="bottom-footer-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] transition-all"
    >
      <div className="max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-6">
        {/* Exactly 5 balanced Navigation Columns */}
        <div className="grid grid-cols-5 items-center h-16 sm:h-18">
          
          {/* Item 1: ড্যাশবোর্ড / হাজিরা */}
          <button
            id="footer-nav-dashboard"
            onClick={() => onSelectTab('dashboard')}
            title="হাজিরা ও ড্যাশবোর্ড"
            className={`group relative flex flex-col items-center justify-center py-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'dashboard' && (
              <span className="absolute inset-x-2 inset-y-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl shadow-xs" />
            )}
            <div className="relative z-10 flex items-center justify-center">
              <LayoutDashboard className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'dashboard' ? 'text-emerald-400 stroke-[2.4]' : 'text-slate-400 stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-[11px] leading-tight mt-1 z-10 truncate ${
              activeTab === 'dashboard' ? 'text-emerald-300 font-bold' : 'text-slate-400'
            }`}>
              হাজিরা
            </span>
          </button>

          {/* Item 2: সদস্য তালিকা */}
          <button
            id="footer-nav-users"
            onClick={() => onSelectTab('users')}
            title={`${terminology.memberLabel} ও বায়োমেট্রিক ডিরেক্টরি`}
            className={`group relative flex flex-col items-center justify-center py-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'users' && (
              <span className="absolute inset-x-2 inset-y-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl shadow-xs" />
            )}
            <div className="relative z-10 flex items-center justify-center">
              <Users className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'users' ? 'text-emerald-400 stroke-[2.4]' : 'text-slate-400 stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-[11px] leading-tight mt-1 z-10 truncate ${
              activeTab === 'users' ? 'text-emerald-300 font-bold' : 'text-slate-400'
            }`}>
              {terminology.memberLabel}
            </span>
          </button>

          {/* Item 3 (CENTER): স্ক্যান / হাজিরা গ্রহণ ক্যামেরা বাটন */}
          <div className="flex items-center justify-center -mt-5 sm:-mt-6 relative">
            <button
              id="footer-action-face-scanner"
              type="button"
              onClick={onOpenFaceScanner}
              title="এআই ফেস রিকগনিশন ক্যামেরা দিয়ে হাজিরা স্ক্যান করুন"
              className="relative group p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black shadow-lg shadow-emerald-500/40 border-4 border-slate-900 transition-all duration-200 cursor-pointer active:scale-95 flex flex-col items-center justify-center"
            >
              {/* Pulsing ring */}
              <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-pulse" />
              
              <div className="relative z-10 flex items-center justify-center">
                <Camera className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.6] text-slate-950" />
              </div>
            </button>
            <span className="absolute -bottom-4 text-[10px] font-black text-emerald-400 tracking-tight whitespace-nowrap">
              স্ক্যান
            </span>
          </div>

          {/* Item 4: এনালিটিক্স ও রিপোর্ট */}
          <button
            id="footer-nav-analytics"
            onClick={() => onSelectTab('analytics')}
            title="পরিসংখ্যান ও রিপোর্ট"
            className={`group relative flex flex-col items-center justify-center py-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'analytics' && (
              <span className="absolute inset-x-2 inset-y-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl shadow-xs" />
            )}
            <div className="relative z-10 flex items-center justify-center">
              <BarChart3 className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'analytics' ? 'text-emerald-400 stroke-[2.4]' : 'text-slate-400 stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-[11px] leading-tight mt-1 z-10 truncate ${
              activeTab === 'analytics' ? 'text-emerald-300 font-bold' : 'text-slate-400'
            }`}>
              রিপোর্ট
            </span>
          </button>

          {/* Item 5: প্রোফাইল সংক্রান্ত মেনু */}
          <button
            id="footer-action-profile"
            type="button"
            onClick={onOpenProfileModal || onOpenNavMenu}
            title="কোম্পানি ও এডমিন প্রোফাইল সেটিংস"
            className="group relative flex flex-col items-center justify-center py-1 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-slate-200"
          >
            <div className="relative z-10 flex items-center justify-center">
              <div className="p-1 rounded-full group-hover:bg-emerald-500/20 transition">
                <User className="w-5 h-5 transition-transform group-hover:scale-110 text-slate-400 group-hover:text-emerald-400 stroke-[1.8]" />
              </div>
            </div>
            <span className="text-[11px] leading-tight mt-0.5 z-10 truncate text-slate-400 group-hover:text-emerald-300 font-medium">
              প্রোফাইল
            </span>
          </button>

        </div>
      </div>
    </footer>
  );
};
