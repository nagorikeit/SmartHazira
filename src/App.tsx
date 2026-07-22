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
  Lock
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('teacher');
  const [orgCategory, setOrgCategory] = useState<OrgCategoryKey>('educational');
  
  const [classes, setClasses] = useState<ClassSubject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // System feature datasets
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(MOCK_PAYROLL_RECORDS);
  const [somityTransactions, setSomityTransactions] = useState<SomityTransaction[]>(MOCK_SOMITY_TRANSACTIONS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [registeredCompanies, setRegisteredCompanies] = useState<RegisteredCompany[]>(MOCK_COMPANIES);

  const handleAddCompany = (newCompany: RegisteredCompany) => {
    setRegisteredCompanies(prev => [newCompany, ...prev]);
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
  };

  const handleUpdateCompanyStatus = (companyId: string, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    setRegisteredCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: newStatus } : c));
  };

  const handleSelectCompanyToManage = (company: RegisteredCompany) => {
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
    setRegisteredCompanies(prev => prev.map(c => c.id === companyId ? { ...c, totalMembers: c.totalMembers + 1 } : c));

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
  };

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payroll' | 'somity' | 'leave' | 'academic' | 'ai' | 'analytics'>('dashboard');

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
  const [selectedLoggedInStudentId, setSelectedLoggedInStudentId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize data and organization category on mount
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
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = newRecord;
        return copy;
      }
      return [newRecord, ...prev];
    });

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
  };

  const handleStudentAdded = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
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

  return (
    <div className="min-h-screen bg-slate-950/5 text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        orgInfo={orgInfo}
        onOpenOrgSelector={() => setIsOrgSelectorOpen(true)}
        onOpenAuthPortal={() => setIsAuthModalOpen(true)}
      />

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
          
          {/* Top Summary Stats */}
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

          {/* Admin Comprehensive System Navigation Tabs */}
          {currentRole === 'teacher' && (
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>উপস্থিতি ড্যাশবোর্ড</span>
              </button>

              <button
                onClick={() => setActiveTab('payroll')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'payroll'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>বেতন ও পে-রোল</span>
              </button>

              <button
                onClick={() => setActiveTab('somity')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'somity'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-400" />
                <span>সমিতি সঞ্চয় ও ঋণ</span>
              </button>

              <button
                onClick={() => setActiveTab('leave')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'leave'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>ছুটি ব্যবস্থাপনা</span>
              </button>

              {orgCategory === 'educational' && (
                <button
                  onClick={() => setActiveTab('academic')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    activeTab === 'academic'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  <span>ক্লাস রুটিন & শিক্ষা</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'ai'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>AI রিপোর্ট & হেলপার</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'analytics'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>এনালিটিক্স</span>
              </button>

            </div>
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
        onAddMemberToCompany={handleAddMemberToCompany}
        onRoleChange={setCurrentRole}
        onSelectCompany={handleSelectCompanyToManage}
        onSelectLoggedInStudent={(std) => setSelectedLoggedInStudentId(std.id)}
        orgCategory={orgCategory}
      />

    </div>
  );
}
