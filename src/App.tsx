import React, { useState, useEffect } from 'react';
import { UserRole, ClassSubject, Student, AttendanceRecord, PayrollRecord, SomityTransaction, LeaveRequest, AuditLogItem, RegisteredCompany } from './types';
import { getStoredClasses, getStoredStudents, getStoredAttendance, getDailySummaryForClass } from './utils/storage';
import { OrgCategoryKey, ORG_CATEGORIES, getStoredOrgCategory, saveOrgCategory } from './utils/organizationConfig';
import {
  CATEGORY_CLASSES,
  CATEGORY_MEMBERS,
  generateInitialAttendanceRecords,
  MOCK_PAYROLL_RECORDS,
  MOCK_SOMITY_TRANSACTIONS,
  MOCK_LEAVE_REQUESTS,
  MOCK_AUDIT_LOGS,
  MOCK_ACADEMIC_SCHEDULE,
  MOCK_COMPANIES
} from './data/mockData';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { KioskMode } from './components/KioskMode';
import { FaceScannerModal } from './components/FaceScannerModal';
import { StudentFaceRegisterModal } from './components/StudentFaceRegisterModal';
import { OrgCategorySelectorModal } from './components/OrgCategorySelectorModal';
import { AnalyticsView } from './components/AnalyticsView';

// New Comprehensive System Modules
import { GeofenceScannerModal } from './components/GeofenceScannerModal';
import { PayrollView } from './components/PayrollView';
import { SomityView } from './components/SomityView';
import { LeaveManagementView } from './components/LeaveManagementView';
import { AIAssistantView } from './components/AIAssistantView';
import { AcademicView } from './components/AcademicView';
import { NotificationSmsModal } from './components/NotificationSmsModal';
import { SmartIdCardModal } from './components/SmartIdCardModal';
import { AuditLogModal } from './components/AuditLogModal';
import { FingerprintScannerModal } from './components/FingerprintScannerModal';
import { AuthRegistrationModal } from './components/AuthRegistrationModal';
import { MandatoryLoginGate } from './components/MandatoryLoginGate';
import { NavigationMenu } from './components/NavigationMenu';
import { CompanyAdminNavbar } from './components/CompanyAdminNavbar';
import { UserDirectoryView } from './components/UserDirectoryView';
import { CompanyProfileModal } from './components/CompanyProfileModal';
import { exportAttendanceCSV } from './utils/storage';

import {
  BarChart3,
  LayoutDashboard,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  GraduationCap,
  MapPin,
  MessageSquare,
  QrCode,
  Lock,
  Camera,
  Fingerprint,
  CheckCircle2,
  Zap
} from 'lucide-react';

import {
  testFirestoreConnection,
  subscribeToCompanies,
  saveCompanyToFirestore,
  subscribeToMembers,
  saveMemberToFirestore,
  subscribeToAttendance,
  saveAttendanceToFirestore,
  saveAuditLogToFirestore,
  subscribeToAuth,
  signInWithGoogle,
  signOutUser
} from './lib/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('teacher');
  const [orgCategory, setOrgCategory] = useState<OrgCategoryKey>('educational');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [classes, setClasses] = useState<ClassSubject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // System feature datasets
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(MOCK_PAYROLL_RECORDS);
  const [somityTransactions, setSomityTransactions] = useState<SomityTransaction[]>(MOCK_SOMITY_TRANSACTIONS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [registeredCompanies, setRegisteredCompanies] = useState<RegisteredCompany[]>(MOCK_COMPANIES);
  const [activeCompany, setActiveCompany] = useState<RegisteredCompany | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setCurrentUser(user);
        const newLog: AuditLogItem = {
          id: `log-auth-${Date.now()}`,
          userRole: currentRole,
          action: 'Google Authentication Sign In',
          targetMember: user.displayName || user.email || 'User',
          timestamp: new Date().toLocaleTimeString('bn-BD'),
          details: `Google ID: ${user.email} সফলভাবে লগইন করেছেন`,
          status: 'Success'
        };
        setAuditLogs(prev => [newLog, ...prev]);
        saveAuditLogToFirestore(newLog);
      }
    } catch (error) {
      console.error('Google Sign In failed:', error);
      setIsAuthModalOpen(true);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      const newLog: AuditLogItem = {
        id: `log-out-${Date.now()}`,
        userRole: currentRole,
        action: 'Google Authentication Sign Out',
        targetMember: currentUser?.displayName || currentUser?.email || 'User',
        timestamp: new Date().toLocaleTimeString('bn-BD'),
        details: `সফলভাবে লগআউট সম্পন্ন হয়েছে`,
        status: 'Success'
      };
      setAuditLogs(prev => [newLog, ...prev]);
      saveAuditLogToFirestore(newLog);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  const handleAddCompany = (newCompany: RegisteredCompany) => {
    setRegisteredCompanies(prev => [newCompany, ...prev]);
    setActiveCompany(newCompany);
    saveCompanyToFirestore(newCompany);

    const newLog: AuditLogItem = {
      id: `log-cmp-${Date.now()}`,
      userRole: 'Super Admin',
      action: 'New Company Registered',
      targetMember: newCompany.nameBangla,
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      details: `ক্যাটাগরি: ${newCompany.category}, কোড: ${newCompany.code} নিবন্ধিত হয়েছে`,
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToFirestore(newLog);
  };

  const handleUpdateCompanyStatus = (companyId: string, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    setRegisteredCompanies(prev => {
      const updated = prev.map(c => c.id === companyId ? { ...c, status: newStatus } : c);
      const targetCompany = updated.find(c => c.id === companyId);
      if (targetCompany) {
        saveCompanyToFirestore(targetCompany);
      }
      return updated;
    });
  };

  const handleSelectCompanyToManage = (company: RegisteredCompany) => {
    setActiveCompany(company);
    handleSelectOrgCategory(company.category, true);
    setCurrentRole('teacher');
    const newLog: AuditLogItem = {
      id: `log-sw-${Date.now()}`,
      userRole: 'Super Admin',
      action: 'Switched to Company Dashboard',
      targetMember: company.nameBangla,
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      details: `কোম্পানি ${company.nameBangla} ড্যাশবোর্ডে প্রবেশ করা হয়েছে`,
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToFirestore(newLog);
  };

  const handleAddMemberToCompany = (memberData: Partial<Student>, companyId: string) => {
    const company = registeredCompanies.find(c => c.id === companyId);
    const companyCat = company ? company.category : orgCategory;
    const targetClasses = CATEGORY_CLASSES[companyCat] || classes;
    const defaultClass = targetClasses[0] || classes[0];

    const newMember: Student = {
      id: `std-${Date.now()}`,
      name: memberData.name || memberData.nameBangla || 'New Member',
      nameBangla: memberData.nameBangla || 'নতুন সদস্য',
      roll: memberData.roll || `ID-${Math.floor(100 + Math.random() * 900)}`,
      classId: defaultClass ? defaultClass.id : 'class-default',
      className: defaultClass ? defaultClass.classNameBangla : 'সাধারণ বিভাগ',
      companyId: companyId,
      companyName: company?.nameBangla,
      photoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%2310b981"/><circle cx="100" cy="80" r="42" fill="%23fce7f3"/><text x="100" y="192" font-size="12" font-family="sans-serif" text-anchor="middle" fill="white">${encodeURIComponent(memberData.nameBangla || 'সদস্য')}</text></svg>`,
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: memberData.guardianPhone || '01700000000',
      attendanceStreak: 1,
      department: memberData.department,
      designation: memberData.designation
    };

    setStudents(prev => [newMember, ...prev]);
    saveMemberToFirestore(newMember);

    setRegisteredCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const updated = { ...c, totalMembers: c.totalMembers + 1 };
        saveCompanyToFirestore(updated);
        return updated;
      }
      return c;
    }));

    const newLog: AuditLogItem = {
      id: `log-mem-${Date.now()}`,
      userRole: 'Admin',
      action: 'Member Attached to Company',
      targetMember: `${newMember.nameBangla} (${company?.nameBangla})`,
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      details: `কোম্পানি আইডি: ${companyId}, রোল: ${newMember.roll}`,
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToFirestore(newLog);
  };

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'payroll' | 'somity' | 'leave' | 'academic' | 'ai' | 'analytics'>('dashboard');

  // Modals state
  const [isFaceScannerOpen, setIsFaceScannerOpen] = useState<boolean>(false);
  const [isGeofenceScannerOpen, setIsGeofenceScannerOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isOrgSelectorOpen, setIsOrgSelectorOpen] = useState<boolean>(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);
  const [isSmartIdCardOpen, setIsSmartIdCardOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isFingerprintScannerOpen, setIsFingerprintScannerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);
  const [isCompanyProfileModalOpen, setIsCompanyProfileModalOpen] = useState<boolean>(false);
  const [selectedLoggedInStudentId, setSelectedLoggedInStudentId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize data, Firebase subscriptions, and organization category on mount
  useEffect(() => {
    const savedCategory = getStoredOrgCategory();
    setOrgCategory(savedCategory);

    const loadedClasses = getStoredClasses();
    const loadedStudents = getStoredStudents();
    const loadedAttendance = getStoredAttendance();

    setClasses(loadedClasses);
    setStudents(loadedStudents);
    setAttendanceRecords(loadedAttendance);

    if (loadedClasses.length > 0) {
      setSelectedClassId(loadedClasses[0].id);
    }

    // Test Firestore Connection
    testFirestoreConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });

    // Subscribe to real-time Firestore updates
    const unsubCompanies = subscribeToCompanies((cloudCompanies) => {
      if (cloudCompanies && cloudCompanies.length > 0) {
        setRegisteredCompanies(prev => {
          // Merge unique companies
          const map = new Map<string, RegisteredCompany>();
          prev.forEach(c => map.set(c.id, c));
          cloudCompanies.forEach(c => map.set(c.id, c));
          return Array.from(map.values());
        });
      }
    });

    const unsubMembers = subscribeToMembers((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setStudents(prev => {
          const map = new Map<string, Student>();
          prev.forEach(s => map.set(s.id, s));
          cloudMembers.forEach(s => map.set(s.id, s));
          const merged = Array.from(map.values());
          localStorage.setItem('smart_hazira_students_v1', JSON.stringify(merged));
          return merged;
        });
      }
    });

    const unsubAttendance = subscribeToAttendance((cloudAttendance) => {
      if (cloudAttendance && cloudAttendance.length > 0) {
        setAttendanceRecords(prev => {
          const map = new Map<string, AttendanceRecord>();
          prev.forEach(a => map.set(a.id, a));
          cloudAttendance.forEach(a => map.set(a.id, a));
          const merged = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
          localStorage.setItem('smart_hazira_attendance_v1', JSON.stringify(merged));
          return merged;
        });
      }
    });

    // Subscribe to Auth state
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubCompanies();
      unsubMembers();
      unsubAttendance();
      unsubAuth();
    };
  }, []);

  const orgInfo = ORG_CATEGORIES[orgCategory] || ORG_CATEGORIES.educational;

  const handleSelectOrgCategory = (newCategoryKey: OrgCategoryKey, loadDefaults: boolean) => {
    setOrgCategory(newCategoryKey);
    saveOrgCategory(newCategoryKey);

    if (loadDefaults) {
      const newClasses = CATEGORY_CLASSES[newCategoryKey] || CATEGORY_CLASSES.educational;
      const newMembers = CATEGORY_MEMBERS[newCategoryKey] || CATEGORY_MEMBERS.educational;
      const newAttendance = generateInitialAttendanceRecords(newCategoryKey);

      setClasses(newClasses);
      setStudents(newMembers);
      setAttendanceRecords(newAttendance);

      if (newClasses.length > 0) {
        setSelectedClassId(newClasses[0].id);
      }

      localStorage.setItem('smart_hazira_classes_v1', JSON.stringify(newClasses));
      localStorage.setItem('smart_hazira_students_v1', JSON.stringify(newMembers));
      localStorage.setItem('smart_hazira_attendance_v1', JSON.stringify(newAttendance));
    }
  };

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Daily Summary statistics
  const dailySummary = selectedClassId
    ? getDailySummaryForClass(selectedClassId, todayDateStr)
    : {
        date: todayDateStr,
        classId: '',
        totalEnrolled: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
        autoSaved: true,
      };

  const handleAttendanceUpdated = (newRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => {
      const index = prev.findIndex(r => r.id === newRecord.id);
      let updated: AttendanceRecord[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = newRecord;
      } else {
        updated = [newRecord, ...prev];
      }
      localStorage.setItem('smart_hazira_attendance_v1', JSON.stringify(updated));
      return updated;
    });

    // Save to Firestore Cloud
    saveAttendanceToFirestore(newRecord);

    // Add Audit Log
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      action: 'Attendance Updated',
      userRole: currentRole,
      targetMember: newRecord.studentName,
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      details: `${newRecord.method} মেথডে স্ট্যাটাস ${newRecord.status} রেকর্ড করা হয়েছে`,
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToFirestore(newLog);
  };

  const handleStudentAdded = (newStudent: Student) => {
    setStudents(prev => {
      const updated = [...prev, newStudent];
      localStorage.setItem('smart_hazira_students_v1', JSON.stringify(updated));
      return updated;
    });
    saveMemberToFirestore(newStudent);

    const newLog: AuditLogItem = {
      id: `log-std-${Date.now()}`,
      action: 'New Member Registered',
      userRole: currentRole,
      targetMember: newStudent.nameBangla,
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      details: `আইডি: ${newStudent.roll}, বিভাগ: ${newStudent.className}`,
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToFirestore(newLog);
  };

  // Payroll handlers
  const handleUpdatePayrollStatus = (recordId: string, status: 'Paid' | 'Pending', method?: any) => {
    setPayrollRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, status, paymentMethod: method || r.paymentMethod } : r))
    );
  };

  const handleAddPayrollRecord = (record: PayrollRecord) => {
    setPayrollRecords(prev => [record, ...prev]);
  };

  // Somity handlers
  const handleAddSomityTransaction = (tx: SomityTransaction) => {
    setSomityTransactions(prev => [tx, ...prev]);
  };

  // Leave handlers
  const handleUpdateLeaveStatus = (requestId: string, status: 'Approved' | 'Rejected') => {
    setLeaveRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status } : r))
    );
  };

  const handleAddLeaveRequest = (request: LeaveRequest) => {
    setLeaveRequests(prev => [request, ...prev]);
  };

  // If user is not logged in, render the Authentication & Company Registration portal directly as the page
  if (!currentUser) {
    return (
      <MandatoryLoginGate
        onGoogleSignIn={handleGoogleSignIn}
        companies={registeredCompanies}
        students={students}
        onAddCompany={handleAddCompany}
        onRoleChange={setCurrentRole}
        onSelectCompany={handleSelectCompanyToManage}
        onSelectLoggedInStudent={(std) => setSelectedLoggedInStudentId(std.id)}
        onSetCurrentUser={setCurrentUser}
        orgCategory={orgCategory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950/5 text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Main Navigation Bar for Company Admin & Users */}
      {currentRole === 'teacher' ? (
        <CompanyAdminNavbar
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab as any)}
          orgInfo={orgInfo}
          activeCompany={activeCompany || registeredCompanies[0] || null}
          currentUser={currentUser}
          isFirebaseConnected={isFirebaseConnected}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          onOpenOrgSelector={() => setIsOrgSelectorOpen(true)}
          onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          onOpenProfileModal={() => setIsCompanyProfileModalOpen(true)}
          onOpenAuditLog={() => setIsAuditLogOpen(true)}
          onOpenSmsModal={() => setIsSmsModalOpen(true)}
          onSignOut={handleGoogleSignOut}
        />
      ) : (
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          orgInfo={orgInfo}
          onOpenOrgSelector={() => setIsOrgSelectorOpen(true)}
          onOpenAuthPortal={() => setIsAuthModalOpen(true)}
          onOpenNavigationMenu={() => setIsNavMenuOpen(true)}
          isFirebaseConnected={isFirebaseConnected}
          currentUser={currentUser}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
        />
      )}

      {/* Main Content Area */}
      {currentRole === 'kiosk' ? (
        <KioskMode
          classes={classes}
          students={students}
          onExitKiosk={() => setCurrentRole('teacher')}
          onAttendanceUpdated={handleAttendanceUpdated}
          soundEnabled={soundEnabled}
          orgInfo={orgInfo}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Quick Biometric & Face Attendance Action Buttons Directly Above Summary */}
          {activeTab === 'dashboard' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Zap className="w-4 h-4 fill-emerald-500/20" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      দ্রুত বায়োমেট্রিক ও ফেস হাজিরা গ্রহণ
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      নিচের বাটন থেকে ক্যামেরা বা আঙুলের ছাপ ব্যবহার করে তাৎক্ষণিক উপস্থিতি নিশ্চিত করুন
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  লাইভ বায়োমেট্রিক সিস্টেম
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Button 1: Face Scan (পেজ স্ক্যান / ফেস স্ক্যান) */}
                <button
                  onClick={() => setIsFaceScannerOpen(true)}
                  className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 text-white font-bold transition-all shadow-md hover:shadow-xl hover:shadow-emerald-600/25 flex items-center justify-between text-left cursor-pointer border border-emerald-400/30 transform active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5 z-10">
                    <div className="p-3 bg-white/20 group-hover:bg-white/30 backdrop-blur-md rounded-2xl text-white shadow-inner transition-colors">
                      <Camera className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black tracking-wide">ফেস স্ক্যান হাজিরা</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/25 text-white">
                          AI স্ক্যান
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 font-medium mt-0.5">
                        ক্যামেরা দিয়ে স্বয়ংক্রিয় ফেস রিকগনিশন
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-white/10 group-hover:bg-white/20 rounded-xl transition z-10 shrink-0 ml-2">
                    <span className="text-xs font-black">স্ক্যান শুরু &rarr;</span>
                  </div>
                  {/* Subtle decorative glow */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                </button>

                {/* Button 2: Fingerprint Scan (ফিঙ্গারপ্রিন্ট) */}
                <button
                  onClick={() => setIsFingerprintScannerOpen(true)}
                  className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-slate-800 to-teal-700 hover:from-indigo-500 hover:via-slate-700 hover:to-teal-600 text-white font-bold transition-all shadow-md hover:shadow-xl hover:shadow-indigo-600/25 flex items-center justify-between text-left cursor-pointer border border-indigo-400/30 transform active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5 z-10">
                    <div className="p-3 bg-white/20 group-hover:bg-white/30 backdrop-blur-md rounded-2xl text-white shadow-inner transition-colors">
                      <Fingerprint className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black tracking-wide">ফিঙ্গারপ্রিন্ট হাজিরা</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/25 text-white">
                          বায়োমেট্রিক
                        </span>
                      </div>
                      <p className="text-xs text-indigo-100 font-medium mt-0.5">
                        আঙুলের ছাপ ও ডিজিটাল সেন্সরে হাজিরা
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-white/10 group-hover:bg-white/20 rounded-xl transition z-10 shrink-0 ml-2">
                    <span className="text-xs font-black">স্ক্যান শুরু &rarr;</span>
                  </div>
                  {/* Subtle decorative glow */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                </button>
              </div>
            </div>
          )}

          {/* Top Summary Stats (Only on Attendance Dashboard tab) */}
          {activeTab === 'dashboard' && (
            <StatsOverview
              totalStudents={dailySummary.totalEnrolled}
              presentCount={dailySummary.present}
              lateCount={dailySummary.late}
              absentCount={dailySummary.absent}
              attendancePercentage={dailySummary.percentage}
              selectedClassName={currentClass ? currentClass.classNameBangla : orgInfo.terminology.groupLabel}
              autoSaved={dailySummary.autoSaved}
              orgInfo={orgInfo}
            />
          )}

          {/* View Selection */}
          {currentRole === 'super_admin' ? (
            <SuperAdminDashboard
              companies={registeredCompanies}
              onAddCompany={handleAddCompany}
              onUpdateCompanyStatus={handleUpdateCompanyStatus}
              onSelectCompanyToManage={handleSelectCompanyToManage}
              onAddMemberToCompany={handleAddMemberToCompany}
              totalMembersCount={students.length}
              auditLogs={auditLogs}
            />
          ) : currentRole === 'teacher' ? (
            activeTab === 'dashboard' ? (
              <TeacherDashboard
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                students={students}
                attendanceRecords={attendanceRecords}
                onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onAttendanceUpdated={handleAttendanceUpdated}
                orgInfo={orgInfo}
                onOpenGeofenceModal={() => setIsGeofenceScannerOpen(true)}
                onOpenSmsModal={() => setIsSmsModalOpen(true)}
                onOpenSmartIdCard={() => setIsSmartIdCardOpen(true)}
                onOpenAuditLog={() => setIsAuditLogOpen(true)}
                onOpenFingerprintScanner={() => setIsFingerprintScannerOpen(true)}
              />
            ) : activeTab === 'users' ? (
              <UserDirectoryView
                students={students}
                classes={classes}
                orgInfo={orgInfo}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onOpenSmartIdCard={() => setIsSmartIdCardOpen(true)}
                onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
              />
            ) : activeTab === 'payroll' ? (
              <PayrollView
                students={students}
                payrollRecords={payrollRecords}
                orgInfo={orgInfo}
                onUpdatePayrollStatus={handleUpdatePayrollStatus}
                onAddPayrollRecord={handleAddPayrollRecord}
              />
            ) : activeTab === 'somity' ? (
              <SomityView
                students={students}
                transactions={somityTransactions}
                orgInfo={orgInfo}
                onAddTransaction={handleAddSomityTransaction}
              />
            ) : activeTab === 'leave' ? (
              <LeaveManagementView
                students={students}
                leaveRequests={leaveRequests}
                orgInfo={orgInfo}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                onAddLeaveRequest={handleAddLeaveRequest}
              />
            ) : activeTab === 'academic' ? (
              <AcademicView
                schedules={MOCK_ACADEMIC_SCHEDULE}
                orgInfo={orgInfo}
              />
            ) : activeTab === 'ai' ? (
              <AIAssistantView
                students={students}
                attendanceRecords={attendanceRecords}
                orgInfo={orgInfo}
              />
            ) : (
              <AnalyticsView
                classes={classes}
                students={students}
                attendanceRecords={attendanceRecords}
                orgInfo={orgInfo}
              />
            )
          ) : (
            <StudentDashboard
              students={students}
              attendanceRecords={attendanceRecords}
              onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
              orgInfo={orgInfo}
              selectedStudentId={selectedLoggedInStudentId}
            />
          )}

        </main>
      )}

      {/* AI Face Scanner Modal */}
      <FaceScannerModal
        isOpen={isFaceScannerOpen}
        onClose={() => setIsFaceScannerOpen(false)}
        students={students.filter(s => s.classId === selectedClassId)}
        selectedClassId={selectedClassId}
        selectedClassName={currentClass ? currentClass.classNameBangla : orgInfo.terminology.groupLabel}
        onAttendanceUpdated={handleAttendanceUpdated}
        soundEnabled={soundEnabled}
        orgInfo={orgInfo}
      />

      {/* GPS Location & Selfie Scanner Modal */}
      <GeofenceScannerModal
        isOpen={isGeofenceScannerOpen}
        onClose={() => setIsGeofenceScannerOpen(false)}
        students={students}
        selectedClassId={selectedClassId}
        selectedClassName={currentClass ? currentClass.classNameBangla : orgInfo.terminology.groupLabel}
        onAttendanceUpdated={handleAttendanceUpdated}
        orgInfo={orgInfo}
      />

      {/* Student Face Register Modal */}
      <StudentFaceRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        classes={classes}
        selectedClassId={selectedClassId}
        onStudentAdded={handleStudentAdded}
        orgInfo={orgInfo}
        companyId={activeCompany?.id || registeredCompanies[0]?.id}
        companyName={activeCompany?.nameBangla || registeredCompanies[0]?.nameBangla}
      />

      {/* Organization Category Selector Modal */}
      <OrgCategorySelectorModal
        isOpen={isOrgSelectorOpen}
        onClose={() => setIsOrgSelectorOpen(false)}
        currentCategory={orgCategory}
        onSelectCategory={handleSelectOrgCategory}
      />

      {/* SMS / WhatsApp Notification Modal */}
      <NotificationSmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        students={students}
        orgInfo={orgInfo}
      />

      {/* Smart ID Card Modal */}
      <SmartIdCardModal
        isOpen={isSmartIdCardOpen}
        onClose={() => setIsSmartIdCardOpen(false)}
        students={students}
        orgInfo={orgInfo}
      />

      {/* Security Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        auditLogs={auditLogs}
      />

      {/* Biometric Fingerprint Scanner Modal */}
      <FingerprintScannerModal
        isOpen={isFingerprintScannerOpen}
        onClose={() => setIsFingerprintScannerOpen(false)}
        students={students.filter(s => s.classId === selectedClassId || !selectedClassId)}
        selectedClassId={selectedClassId}
        selectedClassName={currentClass ? currentClass.classNameBangla : orgInfo.terminology.groupLabel}
        onAttendanceUpdated={handleAttendanceUpdated}
        soundEnabled={soundEnabled}
        orgInfo={orgInfo}
      />

      {/* Auth & Registration Portal Modal */}
      <AuthRegistrationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        companies={registeredCompanies}
        students={students}
        onAddCompany={handleAddCompany}
        onRoleChange={setCurrentRole}
        onSelectCompany={handleSelectCompanyToManage}
        onSelectLoggedInStudent={(std) => setSelectedLoggedInStudentId(std.id)}
        orgCategory={orgCategory}
        currentUser={currentUser}
        currentRole={currentRole}
        isCompanyLoggedIn={currentRole === 'teacher'}
        onSetCurrentUser={setCurrentUser}
      />

      {/* Central App Navigation & Tools Drawer Menu */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentRole={currentRole}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        orgInfo={orgInfo}
        onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
        onOpenFingerprintScanner={() => setIsFingerprintScannerOpen(true)}
        onOpenGeofenceModal={() => setIsGeofenceScannerOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenSmartIdCard={() => setIsSmartIdCardOpen(true)}
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onExportCSV={() => {
          exportAttendanceCSV(attendanceRecords, `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        }}
        onMarkAllPresent={() => {
          const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
          const classStudents = students.filter(s => s.classId === selectedClassId);
          const today = new Date().toISOString().split('T')[0];
          const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
          classStudents.forEach(student => {
            const record: AttendanceRecord = {
              id: `att-${Date.now()}-${student.id}`,
              studentId: student.id,
              studentName: student.nameBangla,
              roll: student.roll,
              classId: selectedClassId,
              className: currentClass ? currentClass.classNameBangla : orgInfo.terminology.groupLabel,
              date: today,
              time: nowTime,
              status: 'Present',
              method: 'Manual',
              notes: 'মেনু থেকে এক ক্লিকে সকল কর্মী উপস্থিত করা হয়েছে'
            };
            handleAttendanceUpdated(record);
          });
        }}
        onOpenOrgSelector={() => setIsOrgSelectorOpen(true)}
        onRoleChange={setCurrentRole}
      />

      {/* Company Admin Profile & Settings Modal */}
      <CompanyProfileModal
        isOpen={isCompanyProfileModalOpen}
        onClose={() => setIsCompanyProfileModalOpen(false)}
        company={activeCompany || registeredCompanies[0] || null}
        currentUser={currentUser}
        orgInfo={orgInfo}
        totalMembersCount={students.length}
        onUpdateCompany={(updated) => {
          handleAddCompany(updated);
        }}
        onOpenOrgSelector={() => setIsOrgSelectorOpen(true)}
        onSignOut={handleGoogleSignOut}
        onOpenAuditLogs={() => setIsAuditLogOpen(true)}
      />

    </div>
  );
}
