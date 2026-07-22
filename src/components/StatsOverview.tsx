import React from 'react';
import { Users, UserCheck, Clock, UserX, TrendingUp, Save } from 'lucide-react';
import { OrgCategoryInfo } from '../utils/organizationConfig';

interface StatsOverviewProps {
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
  selectedClassName: string;
  autoSaved: boolean;
  orgInfo: OrgCategoryInfo;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalStudents,
  presentCount,
  lateCount,
  absentCount,
  attendancePercentage,
  selectedClassName,
  autoSaved,
  orgInfo,
}) => {
  const { terminology } = orgInfo;

  return (
    <div className="space-y-4">
      {/* Top Banner with Auto-Save Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-2xl border border-slate-800 text-white shadow-lg">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-slate-100">
            <span>উপস্থিতি তথ্যচিত্র ({terminology.orgCategoryName})</span>
            <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
              {selectedClassName}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            আজকের উপস্থিতি রিয়েল-টাইমে বায়োমেট্রিক ও ফেস রিকগনিশনের মাধ্যমে আপডেট হচ্ছে
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-medium text-slate-300 self-start sm:self-auto">
          <Save className={`w-3.5 h-3.5 ${autoSaved ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span>{autoSaved ? 'স্বয়ংক্রিয়ভাবে ডাটাবেজে সংরক্ষিত' : 'নতুন ডাটা আপডেট প্রয়োজন'}</span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Enrolled Members */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট {terminology.memberLabel}</span>
            <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-[11px] text-slate-500 font-medium">জন নথিভুক্ত</span>
          </div>
        </div>

        {/* Present */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">উপস্থিত</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{presentCount}</span>
            <span className="text-[11px] text-emerald-600/80 font-medium">সময়মতো</span>
          </div>
        </div>

        {/* Late */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">বিলম্ব (Late)</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{lateCount}</span>
            <span className="text-[11px] text-amber-600/80 font-medium">জন দেরিতে</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">অনুপস্থিত</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600">{absentCount}</span>
            <span className="text-[11px] text-rose-600/80 font-medium">অনুপস্থিত</span>
          </div>
        </div>

        {/* Percentage Card */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 p-4 rounded-2xl text-white shadow-md shadow-emerald-600/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100">উপস্থিতির হার</span>
            <TrendingUp className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="my-1">
            <div className="text-2xl font-black">{attendancePercentage}%</div>
            <div className="w-full bg-emerald-950/40 h-2 rounded-full overflow-hidden mt-1.5 border border-emerald-400/20">
              <div
                className="bg-emerald-300 h-full transition-all duration-500 rounded-full"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
