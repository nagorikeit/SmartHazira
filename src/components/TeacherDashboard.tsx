import React, { useState } from 'react';
import { Student, ClassSubject, AttendanceRecord, AttendanceStatus } from '../types';
import { exportAttendanceCSV, saveAttendanceRecord } from '../utils/storage';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { Camera, UserPlus, Download, Search, Calendar, CheckCircle2, Clock, XCircle, Check, Sparkles, Filter, ChevronDown, CheckCheck, MapPin, MessageSquare, QrCode, Lock, Fingerprint } from 'lucide-react';

interface TeacherDashboardProps {
  classes: ClassSubject[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onOpenFaceScanner: () => void;
  onOpenRegisterModal: () => void;
  onAttendanceUpdated: (record: AttendanceRecord) => void;
  orgInfo: OrgCategoryInfo;
  onOpenGeofenceModal?: () => void;
  onOpenSmsModal?: () => void;
  onOpenSmartIdCard?: () => void;
  onOpenAuditLog?: () => void;
  onOpenFingerprintScanner?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  students,
  attendanceRecords,
  onOpenFaceScanner,
  onOpenRegisterModal,
  onAttendanceUpdated,
  orgInfo,
  onOpenGeofenceModal,
  onOpenSmsModal,
  onOpenSmartIdCard,
  onOpenAuditLog,
  onOpenFingerprintScanner,
}) => {
  const { terminology } = orgInfo;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Late' | 'Absent'>('All');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Map students with their attendance record for the selected date
  const studentRows = classStudents.map(student => {
    const record = attendanceRecords.find(
      r => r.studentId === student.id && r.date === selectedDate
    );
    return {
      student,
      record,
      status: record ? record.status : ('Absent' as AttendanceStatus),
    };
  });

  // Filter rows
  const filteredRows = studentRows.filter(({ student, status }) => {
    const matchesSearch =
      student.nameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Quick manual status change
  const handleStatusChange = (student: Student, newStatus: AttendanceStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    const updated = saveAttendanceRecord({
      studentId: student.id,
      studentName: student.nameBangla,
      roll: student.roll,
      classId: selectedClassId,
      className: currentClass ? currentClass.classNameBangla : '',
      date: selectedDate,
      time: timeStr,
      status: newStatus,
      method: 'Manual',
      notes: `${terminology.adminLabel} কর্তৃক ম্যানুয়ালি হালনাগাদ করা হয়েছে (${newStatus})`,
    });

    onAttendanceUpdated(updated);
  };

  // Mark All Present Shortcut
  const handleMarkAllPresent = () => {
    if (confirm(`${currentClass?.classNameBangla || ''} এর সকলকে 'উপস্থিত' হিসেবে এনট্রি করতে চান?`)) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

      classStudents.forEach(student => {
        const updated = saveAttendanceRecord({
          studentId: student.id,
          studentName: student.nameBangla,
          roll: student.roll,
          classId: selectedClassId,
          className: currentClass ? currentClass.classNameBangla : '',
          date: selectedDate,
          time: timeStr,
          status: 'Present',
          method: 'Manual',
          notes: `${terminology.adminLabel} কর্তৃক এক ক্লিকে সকল ${terminology.memberLabel} উপস্থিত চিহ্নিত`,
        });
        onAttendanceUpdated(updated);
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const recordsToExport = attendanceRecords.filter(r => r.classId === selectedClassId);
    exportAttendanceCSV(recordsToExport, `${currentClass?.classNameBangla || 'attendance'}_report.csv`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Class Selection Tabs & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Class / Department Tabs */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {terminology.groupLabel} নির্বাচন করুন:
            </span>
            <div className="flex flex-wrap gap-2">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    selectedClassId === cls.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  <span>{cls.classNameBangla}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    selectedClassId === cls.id ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {cls.totalStudents} জন
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            
            {/* AI Face Camera Button */}
            <button
              onClick={onOpenFaceScanner}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>AI ফেস স্ক্যান</span>
            </button>

            {/* Fingerprint Scanner Button */}
            {onOpenFingerprintScanner && (
              <button
                onClick={onOpenFingerprintScanner}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-teal-700/20 transition-all flex items-center space-x-2"
                title="ফিঙ্গারপ্রিন্ট ডিভাইসে হাজিরা"
              >
                <Fingerprint className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>ফিঙ্গারপ্রিন্ট কানেক্ট</span>
              </button>
            )}

            {/* Add Member Button */}
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all flex items-center space-x-2 shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>{terminology.registerActionText}</span>
            </button>

            {/* Mark All Present Shortcut */}
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-2xl border border-emerald-200 transition-all flex items-center space-x-1.5"
              title="এক ক্লিকে সকলকে উপস্থিত করুন"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">সবাই উপস্থিত</span>
            </button>

            {/* GPS Selfie Geofence Button */}
            {onOpenGeofenceModal && (
              <button
                onClick={onOpenGeofenceModal}
                className="px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center space-x-1.5"
                title="GPS লোকেশন ও সেলফি হাজিরা"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">GPS সেলফি</span>
              </button>
            )}

            {/* SMS / WhatsApp Notification Button */}
            {onOpenSmsModal && (
              <button
                onClick={onOpenSmsModal}
                className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-2xl border border-emerald-300 transition-all flex items-center space-x-1.5"
                title="WhatsApp / SMS সতর্কবার্তা"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">SMS / মেসেজ</span>
              </button>
            )}

            {/* Smart ID Card Button */}
            {onOpenSmartIdCard && (
              <button
                onClick={onOpenSmartIdCard}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-300 transition-all flex items-center space-x-1.5"
                title="স্মার্ট আইডি কার্ড তৈরি"
              >
                <QrCode className="w-4 h-4 text-slate-700" />
                <span className="hidden lg:inline">আইডি কার্ড</span>
              </button>
            )}

            {/* Audit Log Button */}
            {onOpenAuditLog && (
              <button
                onClick={onOpenAuditLog}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl border border-slate-200/80 transition-all"
                title="সিকিউরিটি অডিট লগ"
              >
                <Lock className="w-4 h-4 text-slate-600" />
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl border border-slate-200/80 transition-all"
              title="CSV রিপোর্ট ডাউনলোড"
            >
              <Download className="w-4 h-4 text-slate-600" />
            </button>

          </div>

        </div>

        {/* Info Banner for Selected Department / Class */}
        {currentClass && (
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-slate-800">{currentClass.subjectName}</span>
              <span className="text-slate-400">|</span>
              <span>দায়িত্বপ্রাপ্ত: <strong className="text-slate-800">{currentClass.teacherName}</strong></span>
              <span className="text-slate-400 hidden md:inline">|</span>
              <span className="hidden md:inline">{currentClass.scheduleTime}</span>
            </div>
            <div className="text-emerald-700 font-bold bg-emerald-100/60 px-2.5 py-1 rounded-xl">
              স্থান/কক্ষ: {currentClass.roomNo}
            </div>
          </div>
        )}

      </div>

      {/* Filter and Student Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Header Filter Controls */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 text-xs shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-slate-500">তারিখ:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="font-bold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
            />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`${terminology.memberLabel}-এর নাম বা ${terminology.idLabel} দিয়ে খুঁজুন...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'All' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              সকল ({studentRows.length})
            </button>
            <button
              onClick={() => setStatusFilter('Present')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'Present' ? 'bg-emerald-600 font-bold text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              উপস্থিত ({studentRows.filter(r => r.status === 'Present').length})
            </button>
            <button
              onClick={() => setStatusFilter('Late')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'Late' ? 'bg-amber-500 font-bold text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              বিলম্ব ({studentRows.filter(r => r.status === 'Late').length})
            </button>
            <button
              onClick={() => setStatusFilter('Absent')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'Absent' ? 'bg-rose-600 font-bold text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              অনুপস্থিত ({studentRows.filter(r => r.status === 'Absent').length})
            </button>
          </div>

        </div>

        {/* Member List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5 pl-5">{terminology.memberLabel} ও ছবি</th>
                <th className="p-3.5">{terminology.idLabel}</th>
                <th className="p-3.5">{terminology.contactLabel}</th>
                <th className="p-3.5">ফেস বায়োমেট্রিক</th>
                <th className="p-3.5">সময় ও নিয়ম</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-right pr-5">দ্রুত পরিবর্তন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    কোন {terminology.memberLabel} পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ student, record, status }) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Member Name & Photo */}
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.photoUrl}
                          alt={student.nameBangla}
                          className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{student.nameBangla}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{student.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* ID / Roll */}
                    <td className="p-3.5 font-bold text-slate-800 font-mono">
                      {student.roll}
                    </td>

                    {/* Contact Phone */}
                    <td className="p-3.5 text-slate-600 font-mono">
                      {student.guardianPhone || 'N/A'}
                    </td>

                    {/* Face Registration Status */}
                    <td className="p-3.5">
                      {student.faceRegistered ? (
                        <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> নিবন্ধিত
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                          অনলাইন স্ক্যান বাকি
                        </span>
                      )}
                    </td>

                    {/* Time & Method */}
                    <td className="p-3.5 text-slate-600">
                      {record ? (
                        <div>
                          <span className="font-semibold text-slate-800">{record.time}</span>
                          <span className="text-[10px] text-slate-400 block">{record.method}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">এখনো এনট্রি হয়নি</span>
                      )}
                    </td>

                    {/* Attendance Status Badge */}
                    <td className="p-3.5">
                      {status === 'Present' && (
                        <span className="inline-flex items-center font-bold px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3 mr-1 text-emerald-600" /> উপস্থিত
                        </span>
                      )}
                      {status === 'Late' && (
                        <span className="inline-flex items-center font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1 text-amber-600" /> বিলম্ব (Late)
                        </span>
                      )}
                      {status === 'Absent' && (
                        <span className="inline-flex items-center font-bold px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 mr-1 text-rose-600" /> অনুপস্থিত
                        </span>
                      )}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleStatusChange(student, 'Present')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                          }`}
                        >
                          উপস্থিত
                        </button>
                        <button
                          onClick={() => handleStatusChange(student, 'Late')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            status === 'Late'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                          }`}
                        >
                          বিলম্ব
                        </button>
                        <button
                          onClick={() => handleStatusChange(student, 'Absent')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            status === 'Absent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                          }`}
                        >
                          অনুপস্থিত
                        </button>
                      </div>
                    </td>

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
