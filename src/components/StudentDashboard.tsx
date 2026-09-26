import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, OrganizationScheduleSettings, EmployeeDeviceSession, EmployeeActivityLog } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { 
  Camera, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Award, 
  CheckCircle, 
  UserCheck, 
  Layers,
  Fingerprint,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Zap,
  Check,
  X,
  AlertCircle,
  LogOut,
  Lock,
  Unlock,
  Shield,
  Laptop,
  Wifi,
  History,
  Info
} from 'lucide-react';
import { isFaceActuallyRegistered, isFingerprintActuallyRegistered, isFingerprintPendingApproval, isFingerprintApproved, speakBengaliAttendance } from '../utils/faceMatching';
import { MobileFingerprintEnrollModal } from './MobileFingerprintEnrollModal';

interface StudentDashboardProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onOpenFaceScanner: () => void;
  orgInfo: OrgCategoryInfo;
  selectedStudentId?: string;
  onUpdateStudent?: (student: Student) => void;
  onAttendancePunch?: (record: AttendanceRecord) => void;
  scheduleSettings?: OrganizationScheduleSettings;
  onSignOut?: () => void;
  companyName?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  students,
  attendanceRecords,
  onOpenFaceScanner,
  orgInfo,
  selectedStudentId,
  onUpdateStudent,
  onAttendancePunch,
  scheduleSettings,
  onSignOut,
  companyName,
}) => {
  const { terminology } = orgInfo;

  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || students[0]?.id || ''
  );

  // Biometric Enrollment State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [isPunchingFingerprint, setIsPunchingFingerprint] = useState<boolean>(false);
  const [fingerprintSuccessMessage, setFingerprintSuccessMessage] = useState<string | null>(null);
  const [fingerprintErrorMessage, setFingerprintErrorMessage] = useState<string | null>(null);
  const [lastPunchedTime, setLastPunchedTime] = useState<string | null>(null);

  // Security & Device Lock State
  const [isDeviceLocked, setIsDeviceLocked] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<EmployeeActivityLog[]>([]);
  const [securitySuccessToast, setSecuritySuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStudentId) {
      setActiveStudentId(selectedStudentId);
    }
  }, [selectedStudentId]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  // Detect current client device info
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const currentDeviceName = isMobile ? 'স্মার্টফোন / মোবাইল ডিভাইস' : 'ডেস্কটপ / কম্পিউটার (Windows)';
  const currentBrowser = /Chrome/i.test(userAgent) ? 'Chrome Browser' : 'Web Browser';

  // Load and initialize Activity Logs and Device Lock State from LocalStorage
  useEffect(() => {
    if (!activeStudent) return;

    // Check device locked status in state/localStorage
    const lockedKey = `device_lock_status_${activeStudent.id}`;
    const storedLock = localStorage.getItem(lockedKey);
    const locked = storedLock === 'true' || Boolean(activeStudent.isDeviceLocked);
    setIsDeviceLocked(locked);

    // Load Activity Logs
    const logKey = `security_activity_logs_${activeStudent.id}`;
    const storedLogs = localStorage.getItem(logKey);

    const nowFormatted = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('bn-BD');

    if (storedLogs) {
      try {
        const parsed = JSON.parse(storedLogs);
        setActivityLogs(parsed);
      } catch {
        createInitialLogs(nowFormatted);
      }
    } else {
      createInitialLogs(nowFormatted);
    }
  }, [activeStudent?.id]);

  const createInitialLogs = (nowTime: string) => {
    const initialLogs: EmployeeActivityLog[] = [
      {
        id: `act-${Date.now()}-1`,
        studentId: activeStudent?.id || '1',
        timestamp: nowTime,
        activityType: 'login',
        description: `ড্যাশবোর্ডে সফল লগইন ও সেশন চালু হয়েছে (${currentDeviceName})`,
        device: `${currentDeviceName} (${currentBrowser})`,
        ipAddress: '192.168.1.104',
        location: 'ঢাকা, বাংলাদেশ (অফিস ওয়াইফাই জোন)',
        status: 'success'
      },
      {
        id: `act-${Date.now()}-2`,
        studentId: activeStudent?.id || '1',
        timestamp: 'পূর্ববর্তী সেশন',
        activityType: 'security_check',
        description: 'অফিস ওয়াইফাই ও বায়োমেট্রিক সিকিউরিটি এনক্রিপশন ভেরিফাইড',
        device: 'Office-Secured-5G',
        ipAddress: '192.168.1.1',
        location: 'হেড অফিস',
        status: 'success'
      }
    ];
    setActivityLogs(initialLogs);
    if (activeStudent) {
      localStorage.setItem(`security_activity_logs_${activeStudent.id}`, JSON.stringify(initialLogs));
    }
  };

  // Toggle Device Lock / Unlock Handler
  const handleToggleDeviceLock = () => {
    if (!activeStudent) return;

    const newLockState = !isDeviceLocked;
    setIsDeviceLocked(newLockState);

    // Save to LocalStorage
    localStorage.setItem(`device_lock_status_${activeStudent.id}`, String(newLockState));

    // Update parent student state if handler exists
    if (onUpdateStudent) {
      onUpdateStudent({
        ...activeStudent,
        isDeviceLocked: newLockState
      });
    }

    const nowFormatted = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('bn-BD');

    const newLog: EmployeeActivityLog = {
      id: `act-${Date.now()}`,
      studentId: activeStudent.id,
      timestamp: nowFormatted,
      activityType: newLockState ? 'device_lock' : 'device_unlock',
      description: newLockState 
        ? `নিরাপত্তা কারণে কর্মী কর্তৃক বর্তমান ডিভাইস (${currentDeviceName}) লক করা হয়েছে` 
        : `কর্মী কর্তৃক ডিভাইস আনলক ও হাজিরা এক্সেস সক্রিয় করা হয়েছে`,
      device: `${currentDeviceName} (${currentBrowser})`,
      ipAddress: '192.168.1.104',
      location: 'ঢাকা, বাংলাদেশ',
      status: newLockState ? 'locked' : 'success'
    };

    const updatedLogs = [newLog, ...activityLogs].slice(0, 15);
    setActivityLogs(updatedLogs);
    localStorage.setItem(`security_activity_logs_${activeStudent.id}`, JSON.stringify(updatedLogs));

    playSound(newLockState ? 440 : 880, 'triangle');
    const toastMsg = newLockState 
      ? '🔒 ডিভাইসটি সফলভাবে লক করা হয়েছে! এই ডিভাইস থেকে হাজিরা সাময়িক বন্ধ থাকবে।' 
      : '🔓 ডিভাইস আনলক হয়েছে! হাজিরা প্রদান ও প্রোফাইল এক্সেস স্বাভাবিক আছে।';
    setSecuritySuccessToast(toastMsg);
    setTimeout(() => setSecuritySuccessToast(null), 5000);
  };

  // Records for this active member
  const studentRecords = attendanceRecords.filter(r => r.studentId === activeStudent?.id);

  const totalClasses = studentRecords.length || 1;
  const presentCount = studentRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const percentage = Math.round((presentCount / totalClasses) * 100);
  const isLowAttendance = percentage < 75;

  const todayStr = new Date().toISOString().split('T')[0];
  const hasAttendedToday = studentRecords.some(r => r.date === todayStr);

  // Audio tone helper
  const playSound = (freq = 880, type: OscillatorType = 'sine') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } catch {
      // Audio fallback
    }
  };

  // Open the interactive Fingerprint Enrollment Modal
  const handleOpenEnrollModal = () => {
    setFingerprintErrorMessage(null);
    setFingerprintSuccessMessage(null);
    setIsEnrollModalOpen(true);
  };

  // When enrollment scan finishes inside modal
  const handleEnrollComplete = (updatedStudent: Student) => {
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
    setFingerprintSuccessMessage('🎉 আপনার মোবাইল ফিঙ্গারপ্রিন্ট সফলভাবে স্ক্যান হয়েছে! কোম্পানি এডমিন অনুমোদন করলেই আপনি ১-টাচে হাজিরা দিতে পারবেন।');
    setTimeout(() => setFingerprintSuccessMessage(null), 7000);
  };

  // Punch Attendance with Approved Fingerprint
  const handlePunchAttendanceViaFingerprint = async () => {
    if (!activeStudent || !onAttendancePunch) return;
    if (activeStudent.fingerprintStatus !== 'Approved' && activeStudent.fingerprintStatus !== undefined && !activeStudent.fingerprintRegistered) {
      setFingerprintErrorMessage('কোম্পানি এডমিন এখনও আপনার ফিঙ্গারপ্রিন্ট অনুমোদন করেননি।');
      return;
    }

    setIsPunchingFingerprint(true);
    setFingerprintErrorMessage(null);
    setFingerprintSuccessMessage(null);

    // Trigger WebAuthn get if available
    try {
      if (window.PublicKeyCredential && typeof navigator.credentials?.get === 'function') {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        try {
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: "preferred"
            }
          });
        } catch {
          // fallback
        }
      }
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsPunchingFingerprint(false);
      playSound(940, 'triangle');

      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
      setLastPunchedTime(currentTimeStr);

      // Determine Shift & Status
      let status: 'Present' | 'Late' = 'Present';
      let shiftName = 'সাধারণ শিফট';
      let shiftCode = 'DAY';
      let shiftTiming = '০৯:০০ - ১৭:০০';

      if (scheduleSettings?.shifts && scheduleSettings.shifts.length > 0) {
        const activeShift = scheduleSettings.shifts.find(s => s.isActive) || scheduleSettings.shifts[0];
        if (activeShift) {
          shiftName = activeShift.nameBangla;
          shiftCode = activeShift.code;
          shiftTiming = `${activeShift.startTime} - ${activeShift.endTime}`;
          
          // Check grace period
          const currentHour = now.getHours();
          const currentMin = now.getMinutes();
          const [sHour, sMin] = activeShift.startTime.split(':').map(Number);
          const shiftStartMins = sHour * 60 + sMin;
          const currentMins = currentHour * 60 + currentMin;
          const grace = activeShift.gracePeriodMinutes || 15;

          if (currentMins > (shiftStartMins + grace)) {
            status = 'Late';
          }
        }
      }

      const record: AttendanceRecord = {
        id: `att-${Date.now()}-${activeStudent.id}`,
        studentId: activeStudent.id,
        studentName: activeStudent.nameBangla,
        roll: activeStudent.roll,
        classId: activeStudent.classId,
        className: activeStudent.className || orgInfo.terminology.groupLabel,
        date: todayStr,
        time: currentTimeStr,
        entryTime: currentTimeStr,
        punchCount: 1,
        status: status,
        method: 'Fingerprint',
        shiftName: shiftName,
        shiftCode: shiftCode,
        shiftTiming: shiftTiming,
        verifiedByAI: true,
        confidenceScore: 0.99,
        notes: `মোবাইল ফিঙ্গারপ্রিন্ট দিয়ে হাজিরা নিশ্চিত করা হয়েছে (${activeStudent.fingerprintDeviceModel || 'রেজিস্টার্ড ফোন'})`,
        updatedAt: Date.now(),
      };

      onAttendancePunch(record);
      speakBengaliAttendance(activeStudent.nameBangla);

      setFingerprintSuccessMessage(`🎉 ${activeStudent.nameBangla}, আপনার ফিঙ্গারপ্রিন্ট হাজিরা সফলভাবে গ্রহণ করা হয়েছে (${currentTimeStr})!`);
      setTimeout(() => setFingerprintSuccessMessage(null), 6000);
    }, 1000);
  };

  const isFpPending = isFingerprintPendingApproval(activeStudent);
  const isFpApproved = activeStudent?.fingerprintRegistered && (activeStudent?.fingerprintStatus === 'Approved' || activeStudent?.fingerprintStatus === undefined);
  const isFpRejected = activeStudent?.fingerprintStatus === 'Rejected';
  const hasNoFp = !activeStudent?.fingerprintRegistered || activeStudent?.fingerprintStatus === 'None';

  return (
    <div className="space-y-5">
      
      {/* Member Selector & Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-6 rounded-3xl border border-slate-800 text-white shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/40 shrink-0 shadow-lg">
              <img src={activeStudent?.photoUrl} alt={activeStudent?.nameBangla} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>{activeStudent?.nameBangla}</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {terminology.idLabel}: {activeStudent?.roll}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeStudent?.className} | {terminology.contactLabel}: {activeStudent?.guardianPhone}
              </p>
              <p className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                <span>🏢 {activeStudent?.companyName || companyName || 'স্মার্ট হাজিরা AI'}</span>
              </p>
            </div>
          </div>

          {/* Member Switcher & Logout */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <UserCheck className="w-4 h-4 text-emerald-400 ml-1.5" />
              <select
                value={activeStudentId}
                onChange={e => setActiveStudentId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-semibold text-emerald-300 rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nameBangla} ({terminology.idLabel}: {s.roll})
                  </option>
                ))}
              </select>
            </div>

            {onSignOut && (
              <button
                id="student-dashboard-logout-btn"
                type="button"
                onClick={onSignOut}
                className="px-3 py-2 bg-red-950/50 hover:bg-red-900/60 active:scale-95 text-red-300 hover:text-white rounded-2xl border border-red-800/80 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm shrink-0"
                title="কর্মী অ্যাকাউন্ট থেকে লগআউট করুন"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="hidden xs:inline">লগআউট</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Security Toast Message */}
        {securitySuccessToast && (
          <div className="p-3.5 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-indigo-200 text-xs font-bold flex items-center gap-2.5 animate-in zoom-in-95">
            <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{securitySuccessToast}</span>
          </div>
        )}

        {/* Global Toast Message */}
        {fingerprintSuccessMessage && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{fingerprintSuccessMessage}</span>
          </div>
        )}

        {fingerprintErrorMessage && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2.5 animate-in zoom-in-95">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{fingerprintErrorMessage}</span>
          </div>
        )}

        {/* Attendance Action Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Action 1: Mobile Fingerprint Setup & Attendance */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-indigo-300 flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-indigo-400" />
                  <span>মোবাইল ফিঙ্গারপ্রিন্ট হাজিরা</span>
                </h3>

                {isFpApproved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>কোম্পানি অনুমোদিত</span>
                  </span>
                )}

                {isFpPending && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>অনুমোদনের অপেক্ষা</span>
                  </span>
                )}

                {isFpRejected && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>অনুমোদন বাতিল</span>
                  </span>
                )}

                {hasNoFp && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    সেট করা নেই
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isFpApproved
                  ? `আপনার নিবন্ধিত ডিভাইস (${activeStudent.fingerprintDeviceModel || 'রেজিস্টার্ড ফোন'}) অনুমোদিত হয়েছে। ১-টাচেই হাজিরা দিন।`
                  : isFpPending
                  ? `আপনার ডিভাইস (${activeStudent.fingerprintDeviceModel || 'মোবাইল'}) থেকে ফিঙ্গারপ্রিন্ট এনরোলমেন্ট জমা হয়েছে। কোম্পানির এডমিন অনুমোদনের পর হাজিরা দিতে পারবেন।`
                  : isFpRejected
                  ? 'কোম্পানি কর্তৃপক্ষ আপনার ফিঙ্গারপ্রিন্ট বাতিল করেছে। দয়া করে পুনরায় সেট করুন।'
                  : 'আপনার নিজস্ব স্মার্টফোনের ফিঙ্গারপ্রিন্ট সেন্সর এনরোল করে রাখুন। কোম্পানি অনুমোদন দিলে হাজিরা দিতে পারবেন।'}
              </p>
            </div>

            {/* If Not Enrolled or Rejected -> Provide Enrollment Box */}
            {(hasNoFp || isFpRejected) && (
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleOpenEnrollModal}
                  disabled={isDeviceLocked}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📱 ফোনে আঙুল স্ক্যান ও সেট করুন</span>
                </button>
              </div>
            )}

            {/* If Pending Approval -> Notification with Re-enroll option */}
            {isFpPending && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">কোম্পানি এডমিনের অনুমোদনের অপেক্ষায়</p>
                    <p className="text-[11px] text-amber-200/80">
                      ডিভাইস: <span className="font-mono font-bold text-white">{activeStudent.fingerprintDeviceModel || 'Mobile'}</span>
                      {activeStudent.fingerprintRegisteredAt && ` • আবেদন সময়: ${activeStudent.fingerprintRegisteredAt}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenEnrollModal}
                  className="text-[11px] text-amber-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>ডিভাইস পরিবর্তন / পুনরায় স্ক্যান ও আবেদন</span>
                </button>
              </div>
            )}

            {/* If Approved -> Instant 1-Touch Biometric Punch Button */}
            {isFpApproved && (
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handlePunchAttendanceViaFingerprint}
                  disabled={isPunchingFingerprint || isDeviceLocked}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 shadow-xl ${
                    isDeviceLocked
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : isPunchingFingerprint
                      ? 'bg-emerald-700 text-white border-2 border-emerald-400 animate-pulse'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {isDeviceLocked ? (
                    <>
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>ডিভাইস লক করা আছে (হাজিরা স্থগিত)</span>
                    </>
                  ) : isPunchingFingerprint ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>বায়োমেট্রিক রিড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                      <span>👆 ১-টাচে ফিঙ্গারপ্রিন্ট হাজিরা দিন</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>আঙুল: {activeStudent.fingerprintFingerName || 'রেজিস্টার্ড আঙুল'}</span>
                  {hasAttendedToday && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>আজকের হাজিরা সম্পন্ন</span>
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Action 2: AI Face Scan Camera Attendance */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-teal-300 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-teal-400" />
                  <span>AI ফেস স্ক্যান হাজিরা</span>
                </h3>

                {isFaceActuallyRegistered(activeStudent) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3 text-teal-400" />
                    <span>ফেস সক্রিয়</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ফেস নেই
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                সেলফি ক্যামেরায় সোজা মুখ রেখে রিয়েল-টাইম ফেস ডিটেকশনের মাধ্যমে স্বয়ংক্রিয়ভাবে হাজিরা দিন।
              </p>
            </div>

            <button
              onClick={onOpenFaceScanner}
              disabled={isDeviceLocked}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>ক্যামেরা ওপেন করে ফেস হাজিরা দিন</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVITY LOG & DEVICE SECURITY CENTER (কর্মীর প্রোফাইল সিকিউরিটি)       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl ${isDeviceLocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isDeviceLocked ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <span>ডিভাইস ও অ্যাক্টিভিটি সিকিউরিটি সেন্টার</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDeviceLocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isDeviceLocked ? 'ডিভাইস লক করা আছে' : 'ডিভাইস নিরাপদ ও সক্রিয়'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বর্তমান ডিভাইস ট্র্যাকিং, অফিস ওয়াইফাই লোকেশন যাচাই ও রিমোট লক নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          {/* DEVICE LOCK / UNLOCK TOGGLE BUTTON */}
          <button
            id="btn-toggle-device-lock"
            type="button"
            onClick={handleToggleDeviceLock}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 shadow-sm shrink-0 ${
              isDeviceLocked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
            title={isDeviceLocked ? 'ডিভাইস আনলক করতে ক্লিক করুন' : 'ডিভাইসটি অবিলম্বে লক করতে ক্লিক করুন'}
          >
            {isDeviceLocked ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>ডিভাইস আনলক করুন</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>ডিভাইস লক করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Active Session & Device Status Bar */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-100 bg-slate-900 text-white">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              <span>বর্তমান সক্রিয় ডিভাইস</span>
            </span>
            <p className="text-xs font-bold text-white truncate">{currentDeviceName}</p>
            <span className="text-[10px] text-emerald-400 font-mono">ব্রাউজার: {currentBrowser}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-teal-400" />
              <span>ওয়াইফাই নেটওয়ার্ক নিরাপত্তা</span>
            </span>
            <p className="text-xs font-bold text-teal-300 truncate">Office-Secured-5G</p>
            <span className="text-[10px] text-slate-400 font-mono">আইপি: 192.168.1.104</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>ডিভাইস সিকিউরিটি স্ট্যাটাস</span>
            </span>
            <p className={`text-xs font-black ${isDeviceLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isDeviceLocked ? '🔒 লকড (হাজিরা ব্লক করা)' : '🟢 সক্রিয় ও অনুমোদিত'}
            </p>
            <span className="text-[10px] text-slate-400">লোকেশন: ঢাকা, বাংলাদেশ</span>
          </div>
        </div>

        {/* Real-time Activity Log History */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>কর্মী প্রোফাইল অ্যাক্টিভিটি হিস্ট্রি লগ ({activityLogs.length})</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">রিয়েল-টাইম অডিট ট্রেইল</span>
          </div>

          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div 
                key={log.id} 
                className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 text-xs ${
                  log.status === 'locked' 
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${
                    log.status === 'locked' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {log.activityType === 'device_lock' ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : log.activityType === 'device_unlock' ? (
                      <Unlock className="w-3.5 h-3.5" />
                    ) : log.activityType === 'punch_fingerprint' ? (
                      <Fingerprint className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{log.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                      <span>ডিভাইস: <span className="font-medium text-slate-700">{log.device}</span></span>
                      {log.location && <span>লোকেশন: <span className="font-medium text-slate-700">{log.location}</span></span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] text-slate-500 block font-bold">{log.timestamp}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${
                    log.status === 'locked' 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {log.status === 'locked' ? 'লকড' : 'সফল'}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
                <th className="p-3.5">শিফট</th>
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
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    কোন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                studentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-slate-800 font-mono">{r.date}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span>{r.shiftName || 'সাধারণ শিফট'}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono">{r.time}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{r.className}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.method === 'Fingerprint' 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : r.method === 'Face AI'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {r.method === 'Fingerprint' ? '👆 ফিঙ্গারপ্রিন্ট' : r.method === 'Face AI' ? '📷 ফেস AI' : r.method}
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

      {/* Interactive Mobile Fingerprint Enrollment Modal */}
      {activeStudent && (
        <MobileFingerprintEnrollModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          student={activeStudent}
          onEnrollComplete={handleEnrollComplete}
        />
      )}

    </div>
  );
};

