import React, { useState, useRef, useEffect } from 'react';
import { Student, ClassSubject, AttendanceRecord, AttendanceStatus } from '../types';
import { exportAttendanceCSV, saveAttendanceRecord } from '../utils/storage';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { isFaceActuallyRegistered, isFingerprintActuallyRegistered, isFingerprintPendingApproval } from '../utils/faceMatching';
import { getStoredScheduleSettings, getCurrentActiveShift } from '../utils/scheduleConfig';
import { AttendanceDetailsModal } from './AttendanceDetailsModal';
import { EditAttendanceHistoryModal } from './EditAttendanceHistoryModal';
import { parseTimeToMinutes } from '../utils/timeUtils';
import { 
  Camera, 
  UserPlus, 
  Download, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Check, 
  Sparkles, 
  Filter, 
  ChevronDown, 
  CheckCheck, 
  MapPin, 
  MessageSquare, 
  QrCode, 
  Lock, 
  Fingerprint,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Users,
  Zap,
  Edit3,
  LogIn,
  LogOut,
  Timer,
  Info,
  Eye,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Cpu
} from 'lucide-react';

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
  onOpenAttendanceLinkModal?: () => void;
  onOpenZKTecoDeviceModal?: () => void;
  onOpenBiometricsModal?: (student: Student) => void;
  onOpenEditModal?: (student: Student) => void;
  onNavigateToUsers?: () => void;
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
  onOpenAttendanceLinkModal,
  onOpenZKTecoDeviceModal,
  onOpenBiometricsModal,
  onOpenEditModal,
  onNavigateToUsers,
}) => {
  const { terminology } = orgInfo;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Late' | 'Absent'>('All');
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState<boolean>(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Attendance Details Modal State
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<AttendanceRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  // Attendance History Edit Modal State
  const [selectedStudentForHistoryEdit, setSelectedStudentForHistoryEdit] = useState<Student | null>(null);
  const [selectedRecordForHistoryEdit, setSelectedRecordForHistoryEdit] = useState<AttendanceRecord | null>(null);
  const [isHistoryEditModalOpen, setIsHistoryEditModalOpen] = useState<boolean>(false);

  const handleOpenDetails = (student: Student, record?: AttendanceRecord) => {
    setSelectedStudentForDetails(student);
    setSelectedRecordForDetails(record || null);
    setIsDetailsModalOpen(true);
  };

  const handleOpenHistoryEdit = (student: Student, record?: AttendanceRecord) => {
    setSelectedStudentForHistoryEdit(student);
    setSelectedRecordForHistoryEdit(record || null);
    setIsHistoryEditModalOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  const scheduleSettings = getStoredScheduleSettings();
  const currentActiveShift = getCurrentActiveShift(scheduleSettings, new Date());

  const getShiftBadgeStyle = (code?: string, name?: string) => {
    const text = ((code || '') + ' ' + (name || '')).toLowerCase();
    if (text.includes('morning') || text.includes('মর্নিং') || text.includes('সকাল')) {
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    }
    if (text.includes('night') || text.includes('নাইট') || text.includes('রাত')) {
      return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700';
    }
    if (text.includes('evening') || text.includes('ইভনিং') || text.includes('সন্ধ্যা')) {
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
    }
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
  };

  const getShiftIcon = (code?: string, name?: string) => {
    const text = ((code || '') + ' ' + (name || '')).toLowerCase();
    if (text.includes('morning') || text.includes('মর্নিং') || text.includes('সকাল')) {
      return <Sunrise className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
    }
    if (text.includes('night') || text.includes('নাইট') || text.includes('রাত')) {
      return <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    }
    if (text.includes('evening') || text.includes('ইভনিং') || text.includes('সন্ধ্যা')) {
      return <Sunset className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
    }
    return <Sun className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  };

  // Map students with their attendance record for the selected date
  // Sort so that the latest entry/punch appears at the very top of the table
  const studentRows = classStudents.map(student => {
    const record = attendanceRecords.find(
      r => r.studentId === student.id && r.date === selectedDate
    );
    return {
      student,
      record,
      status: record ? record.status : ('Absent' as AttendanceStatus),
    };
  }).sort((a, b) => {
    // 1. If both have attendance records on selected date: sort by latest timestamp/time in descending order (latest first)
    if (a.record && b.record) {
      if (a.record.updatedAt && b.record.updatedAt) {
        return b.record.updatedAt - a.record.updatedAt;
      }
      const timeA = parseTimeToMinutes(a.record.exitTime || a.record.time || a.record.entryTime || '') ?? 0;
      const timeB = parseTimeToMinutes(b.record.exitTime || b.record.time || b.record.entryTime || '') ?? 0;
      if (timeB !== timeA) return timeB - timeA;
    }
    // 2. An attended member appears before an unattended member
    if (a.record && !b.record) return -1;
    if (!a.record && b.record) return 1;

    // 3. Otherwise sort by ID / Roll
    return (a.student.roll || '').localeCompare(b.student.roll || '', undefined, { numeric: true });
  });

  // Filter rows with resilient name check
  const filteredRows = studentRows.filter(({ student, status }) => {
    const displayName = student.nameBangla || student.name || student.nameEnglish || student.roll || '';
    const matchesSearch =
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nameBangla || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.roll || '').includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Quick manual status change
  const handleStatusChange = (student: Student, newStatus: AttendanceStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const displayName = student.nameBangla || student.name || student.nameEnglish || 'সদস্য';

    const updated = saveAttendanceRecord({
      studentId: student.id,
      studentName: displayName,
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
        const displayName = student.nameBangla || student.name || student.nameEnglish || 'সদস্য';
        const updated = saveAttendanceRecord({
          studentId: student.id,
          studentName: displayName,
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

  const pendingApprovalsCount = students.filter(isFingerprintPendingApproval).length;

  return (
    <div className="space-y-4">
      {/* Pending Mobile Biometric Approvals Banner */}
      {pendingApprovalsCount > 0 && onNavigateToUsers && (
        <div className="p-3.5 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border border-amber-500/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-900 dark:text-amber-200">
                {pendingApprovalsCount} টি নতুন মোবাইল ফিঙ্গারপ্রিন্ট আবেদন অনুমোদনের অপেক্ষায়
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                কর্মীরা তাদের মোবাইল থেকে বায়োমেট্রিক নিবন্ধন সম্পন্ন করেছেন। অনুমোদন দিতে সদস্য ডিরেক্টরিতে যান।
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToUsers}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1 transition cursor-pointer shadow-xs shrink-0"
          >
            <span>অনুমোদন ড্যাশবোর্ড</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Attendance Methods & Hardware Devices Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. AI Face Recognition */}
        <button
          onClick={onOpenFaceScanner}
          className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl shadow-xs hover:shadow-md transition text-left flex items-center space-x-3 cursor-pointer group"
        >
          <div className="p-2 bg-white/20 rounded-xl group-hover:scale-105 transition-transform shrink-0">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="truncate">
            <p className="font-extrabold text-xs">AI ফেস ক্যামেরা</p>
            <p className="text-[10px] text-emerald-100 opacity-90">স্বয়ংক্রিয় লাইভ ফেস স্ক্যান</p>
          </div>
        </button>

        {/* 2. Public Self-Service Attendance Link & QR (No Login Required) */}
        {onOpenAttendanceLinkModal && (
          <button
            onClick={onOpenAttendanceLinkModal}
            className="p-3 bg-gradient-to-br from-indigo-600 to-slate-800 hover:from-indigo-500 hover:to-slate-700 text-white rounded-2xl shadow-xs hover:shadow-md transition text-left flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-2 bg-white/20 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1">
                <p className="font-extrabold text-xs">পাবলিক কিউআর ও লিংক</p>
                <span className="px-1 py-0.2 bg-emerald-400 text-slate-950 font-black text-[9px] rounded">নো-লগইন</span>
              </div>
              <p className="text-[10px] text-indigo-100 opacity-90">কর্মীদের সেলফ-হাজিরা লিংক</p>
            </div>
          </button>
        )}

        {/* 3. ZKTeco Biometric Machine & Log History (SenseFace M2F-LR) */}
        {onOpenZKTecoDeviceModal && (
          <button
            onClick={onOpenZKTecoDeviceModal}
            className="p-3 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 hover:bg-slate-800 text-white rounded-2xl shadow-xs hover:shadow-md transition text-left flex items-center space-x-3 cursor-pointer group border border-emerald-500/30"
          >
            <div className="p-2 bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1">
                <p className="font-extrabold text-xs">SenseFace M2F-LR</p>
                <span className="px-1 py-0.2 bg-emerald-500/30 text-emerald-300 font-black text-[9px] rounded">ADMS লাইভ</span>
              </div>
              <p className="text-[10px] text-slate-300 opacity-90">ফেস, ফিঙ্গার ও ক্লাউড সিঙ্ক</p>
            </div>
          </button>
        )}

        {/* 4. Mobile Biometric / GPS */}
        {onOpenFingerprintScanner && (
          <button
            onClick={onOpenFingerprintScanner}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl shadow-2xs hover:shadow-md transition text-left flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="font-extrabold text-xs">বায়োমেট্রিক সেন্সর</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">USB / ফিঙ্গারপ্রিন্ট রিডার</p>
            </div>
          </button>
        )}
      </div>

      {/* Unified Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Filter and Search Sub-bar */}
        <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Left: Date Picker + Search */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            {/* Date Picker */}
            <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs shadow-2xs shrink-0">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="font-bold text-slate-900 dark:text-white focus:outline-none bg-transparent cursor-pointer text-xs"
              />
            </div>

            {/* Search Box */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder={`${terminology.memberLabel}-এর নাম বা আইডি খুঁজুন...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Right: Status Filter Tabs */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium shrink-0 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'All' ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              সকল ({studentRows.length})
            </button>
            <button
              onClick={() => setStatusFilter('Present')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'Present' ? 'bg-emerald-600 font-bold text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              উপস্থিত ({studentRows.filter(r => r.status === 'Present').length})
            </button>
            <button
              onClick={() => setStatusFilter('Late')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'Late' ? 'bg-amber-500 font-bold text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              বিলম্ব ({studentRows.filter(r => r.status === 'Late').length})
            </button>
            <button
              onClick={() => setStatusFilter('Absent')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'Absent' ? 'bg-rose-600 font-bold text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
              }`}
            >
              অনুপস্থিত ({studentRows.filter(r => r.status === 'Absent').length})
            </button>
          </div>

        </div>

        {/* Member List Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[880px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                <th className="p-3 pl-4 whitespace-nowrap min-w-[220px]">প্রোফাইল ফটো ও নাম</th>
                <th className="p-3 whitespace-nowrap min-w-[110px]">পদবী</th>
                <th className="p-3 whitespace-nowrap min-w-[140px]">শিফট</th>
                <th className="p-3 whitespace-nowrap min-w-[130px]">প্রবেশ করার সময়</th>
                <th className="p-3 whitespace-nowrap min-w-[140px]">বাহির হওয়ার সময়</th>
                <th className="p-3 text-center whitespace-nowrap min-w-[150px]">স্ট্যাটাস</th>
                <th className="p-3 text-right pr-4 whitespace-nowrap w-24">এডিট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2.5 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">কোনো {terminology.memberLabel} পাওয়া যায়নি</p>
                      <button
                        onClick={onOpenRegisterModal}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{terminology.registerActionText}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ student, record, status }) => {
                  const hasFace = isFaceActuallyRegistered(student);
                  const displayName = student.nameBangla || student.name || student.nameEnglish || (student.roll ? `সদস্য #${student.roll}` : 'সদস্য');
                  const secondaryName = (student.name && student.name !== displayName) ? student.name : (student.nameEnglish && student.nameEnglish !== displayName ? student.nameEnglish : null);

                  return (
                  <tr 
                    key={student.id} 
                    onClick={() => handleOpenDetails(student, record)}
                    className="cursor-pointer transition-all duration-150 group hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 hover:shadow-2xs"
                    title={`ক্লিক করে ${displayName}-এর সকল তথ্য ও বিস্তারিত হাজিরা হিস্টোরি দেখুন`}
                  >
                    
                    {/* 1. Profile Photo & Name */}
                    <td className="p-3 pl-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500 overflow-hidden shrink-0 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 transition relative shadow-2xs">
                          {hasFace && (student.faceImage || student.photoUrl) ? (
                            <img
                              src={student.faceImage || student.photoUrl}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            displayName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center space-x-1.5 transition">
                            <span className="text-xs font-black">{displayName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px] flex items-center space-x-1.5 font-mono">
                            <span>ID: <strong className="text-slate-600 dark:text-slate-300">{student.roll || 'N/A'}</strong></span>
                            {secondaryName && <span>• {secondaryName}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Designation (পদবী) */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200/80 dark:border-slate-700">
                        {student.designation || student.className || 'সদস্য'}
                      </span>
                    </td>

                    {/* 3. Shift (শিফট - স্ক্যান বা অটো ডিটেক্ট) */}
                    <td className="p-3 whitespace-nowrap">
                      {record?.shiftName ? (
                        <div className="inline-flex flex-col">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-2xs ${getShiftBadgeStyle(record.shiftCode, record.shiftName)}`}>
                            {getShiftIcon(record.shiftCode, record.shiftName)}
                            <span>{record.shiftName}</span>
                          </span>
                          {record.shiftTiming && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 pl-0.5">
                              {record.shiftTiming}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                            <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{currentActiveShift?.nameBangla || 'সাধারণ ডে শিফট'}</span>
                          </span>
                          {currentActiveShift && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 pl-0.5">
                              {currentActiveShift.startTime} - {currentActiveShift.endTime}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 4. Entry Time (প্রবেশ করার সময়) */}
                    <td className="p-3 whitespace-nowrap">
                      {record && (record.entryTime || record.time) ? (
                        <div className="inline-flex items-center space-x-1 font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs">
                          <LogIn className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{record.entryTime || record.time}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* 5. Exit Time (বাহির হওয়ার সময়) */}
                    <td className="p-3 whitespace-nowrap">
                      {record?.exitTime ? (
                        <div className="inline-flex items-center space-x-1 font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 text-xs">
                          <LogOut className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{record.exitTime}</span>
                        </div>
                      ) : (status === 'Present' || status === 'Late') && record ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>অবস্থান করছেন</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* 6. Status Dropdown (স্ট্যাটাস ড্রপ ডাউন) */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div 
                        className="inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(student, e.target.value as AttendanceStatus);
                          }}
                          className={`px-2.5 py-1 rounded-xl font-bold text-xs border shadow-2xs cursor-pointer transition focus:outline-none ${
                            status === 'Present'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                              : status === 'Late'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
                          }`}
                          title="হাজিরা স্ট্যাটাস পরিবর্তন করুন"
                        >
                          <option value="Present">✓ উপস্থিত (Present)</option>
                          <option value="Late">⏱ বিলম্ব (Late)</option>
                          <option value="Absent">✕ অনুপস্থিত (Absent)</option>
                        </select>
                      </div>
                    </td>

                    {/* 7. Edit Attendance History Button (হিস্টোরি এডিট) */}
                    <td className="p-3 text-right pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenHistoryEdit(student, record);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-2xs flex items-center space-x-1 cursor-pointer"
                          title="এই সদস্যের হাজিরা ও হিস্টোরি এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                          <span>এডিট</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Attendance & Stay Duration Breakdown Modal with Full History Table */}
      <AttendanceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        student={selectedStudentForDetails}
        attendanceRecord={selectedRecordForDetails}
        selectedDate={selectedDate}
        orgInfo={orgInfo}
        allAttendanceRecords={attendanceRecords}
        onAttendanceUpdated={(updated) => {
          onAttendanceUpdated(updated);
          setSelectedRecordForDetails(updated);
        }}
      />

      {/* Attendance History Edit Modal */}
      <EditAttendanceHistoryModal
        isOpen={isHistoryEditModalOpen}
        onClose={() => setIsHistoryEditModalOpen(false)}
        student={selectedStudentForHistoryEdit}
        currentRecord={selectedRecordForHistoryEdit}
        selectedDate={selectedDate}
        orgInfo={orgInfo}
        onAttendanceUpdated={(updated) => {
          onAttendanceUpdated(updated);
          setSelectedRecordForHistoryEdit(updated);
        }}
      />

    </div>
  );
};
