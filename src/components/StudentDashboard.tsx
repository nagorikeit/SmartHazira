import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { Camera, GraduationCap, Calendar, CheckCircle2, AlertTriangle, Flame, Clock, Award, CheckCircle, UserCheck } from 'lucide-react';

interface StudentDashboardProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onOpenFaceScanner: () => void;
  orgInfo: OrgCategoryInfo;
  selectedStudentId?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  students,
  attendanceRecords,
  onOpenFaceScanner,
  orgInfo,
  selectedStudentId,
}) => {
  const { terminology } = orgInfo;

  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || students[0]?.id || ''
  );

  useEffect(() => {
    if (selectedStudentId) {
      setActiveStudentId(selectedStudentId);
    }
  }, [selectedStudentId]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  // Records for this active member
  const studentRecords = attendanceRecords.filter(r => r.studentId === activeStudent?.id);

  const totalClasses = studentRecords.length || 1;
  const presentCount = studentRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const percentage = Math.round((presentCount / totalClasses) * 100);

  const isLowAttendance = percentage < 75;

  return (
    <div className="space-y-5">
      
      {/* Member Selector & Self Face Scan Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 rounded-3xl border border-slate-800 text-white shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/40 shrink-0">
              <img src={activeStudent?.photoUrl} alt={activeStudent?.nameBangla} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{activeStudent?.nameBangla}</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {terminology.idLabel}: {activeStudent?.roll}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeStudent?.className} | {terminology.contactLabel}: {activeStudent?.guardianPhone}
              </p>
            </div>
          </div>

          {/* Member Switcher for Portal Demo */}
          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <UserCheck className="w-4 h-4 text-emerald-400 ml-1.5" />
            <select
              value={activeStudentId}
              onChange={e => setActiveStudentId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-emerald-300 rounded-xl px-2.5 py-1 focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nameBangla} ({terminology.idLabel}: {s.roll})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Self Attendance Trigger Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
              <span>আজকের উপস্থিতি নিশ্চিতকরণ</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ফেস বায়োমেট্রিক স্ক্যানের মাধ্যমে নিজের উপস্থিতি স্বয়ংক্রিয়ভাবে প্রদান করুন
            </p>
          </div>

          <button
            onClick={onOpenFaceScanner}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>স্ক্যান করে উপস্থিতি দিন</span>
          </button>
        </div>

      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Ratio */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-700">
            <Calendar className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">মোট কার্যদিবস</span>
            <span className="text-xl font-bold text-slate-900">{presentCount} / {totalClasses} দিন</span>
          </div>
        </div>

        {/* Percentage */}
        <div className={`p-4 rounded-2xl border shadow-xs flex items-center space-x-3 ${
          isLowAttendance ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className={`p-3 rounded-2xl ${
            isLowAttendance ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">উপস্থিতির হার</span>
            <span className={`text-xl font-bold ${isLowAttendance ? 'text-amber-700' : 'text-emerald-700'}`}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">ধারাবাহিক উপস্থিতি</span>
            <span className="text-xl font-bold text-orange-600">
              {activeStudent?.attendanceStreak || 0} দিন টানা
            </span>
          </div>
        </div>

      </div>

      {/* Attendance Alert if low */}
      {isLowAttendance && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sm block">উপস্থিতি সতর্কতা!</strong>
            <p className="mt-0.5">{terminology.lowAttendanceWarning}</p>
          </div>
        </div>
      )}

      {/* Attendance Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>উপস্থিতির সাম্প্রতিক ইতিহাস ({activeStudent?.nameBangla})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            মোট {studentRecords.length} টি রেকর্ড পাওয়া গেছে
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5 pl-5">তারিখ</th>
                <th className="p-3.5">সময়</th>
                <th className="p-3.5">{terminology.sessionLabel}</th>
                <th className="p-3.5">পদ্ধতি</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 pr-5">নোট/মন্তব্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    কোন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                studentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-slate-800 font-mono">{r.date}</td>
                    <td className="p-3.5 text-slate-600 font-mono">{r.time}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{r.className}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {r.method}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {r.status === 'Present' && (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          উপস্থিত
                        </span>
                      )}
                      {r.status === 'Late' && (
                        <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          বিলম্ব
                        </span>
                      )}
                      {r.status === 'Absent' && (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          অনুপস্থিত
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-slate-500 italic">{r.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
