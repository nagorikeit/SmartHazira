import { OrgCategoryKey } from './utils/organizationConfig';

export type UserRole = 'super_admin' | 'teacher' | 'student' | 'kiosk';

export interface RegisteredCompany {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  category: OrgCategoryKey;
  code: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  totalMembers: number;
  status: 'Active' | 'Pending' | 'Suspended';
  registeredDate: string;
  adminName: string;
  password?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export type AttendanceMethod = 'Face AI' | 'GPS Selfie' | 'QR Scan' | 'Fingerprint' | 'Manual' | 'Self Kiosk' | 'Automated AI';

export interface Student {
  id: string;
  name: string;
  nameBangla: string;
  nameEnglish?: string;
  roll: string; // Roll number, Staff ID, Card No, or Somity Passbook No
  classId: string;
  className: string;
  companyId?: string;
  companyName?: string;
  photoUrl: string;
  faceImage?: string;
  faceRegistered: boolean;
  faceDescriptor?: number[];
  faceBiometricCode?: string;
  fingerprintRegistered?: boolean;
  fingerprintTemplate?: string;
  fingerprintFingerName?: string;
  fingerprintStatus?: 'None' | 'Pending' | 'Approved' | 'Rejected';
  fingerprintDeviceId?: string;
  fingerprintDeviceModel?: string;
  fingerprintRegisteredAt?: string;
  fingerprintApprovedAt?: string;
  fingerprintApprovedBy?: string;
  gender: 'Male' | 'Female' | 'Other';
  guardianPhone: string;
  parentPhone?: string;
  email?: string;
  attendanceStreak: number;
  active?: boolean;
  
  // Extended Employee / Member Fields
  designation?: string;
  department?: string;
  nidNumber?: string;
  joinDate?: string;
  monthlySalary?: number;
  dailyWage?: number;
  hourlyRate?: number;
  
  // Security & Device Locking
  isDeviceLocked?: boolean;
  lockedDevices?: string[];
  lastLoginDevice?: string;
  lastLoginTime?: string;
  lastLoginIp?: string;
  
  // Extended Somity Fields
  savingsBalance?: number;
  loanBalance?: number;
  shareCount?: number;
}

export interface ClassSubject {
  id: string;
  className: string;
  classNameBangla: string;
  section: string;
  subjectName: string;
  teacherName: string;
  totalStudents: number;
  roomNo: string;
  scheduleTime: string;
}

export interface AttendancePunch {
  id: string;
  time: string;
  type: 'Entry' | 'Exit' | 'Check';
  method: AttendanceMethod;
  confidenceScore?: number;
  snapshotUrl?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  roll: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  time: string; // Primary / Latest attendance time
  entryTime?: string; // প্রথম হাজিরা / প্রবেশ সময়
  exitTime?: string; // পরবর্তী হাজিরা / বাহির / প্রস্থান সময়
  totalDuration?: string; // মোট অবস্থিত সময় (e.g., "৭ ঘণ্টা ৩০ মিনিট")
  totalDurationMinutes?: number; // মোট মিনিট
  punchCount?: number; // মোট স্ক্যান সংখ্যা
  punches?: AttendancePunch[]; // সকল স্ক্যানের টাইমলাইন
  status: AttendanceStatus;
  method: AttendanceMethod;
  confidenceScore?: number;
  snapshotUrl?: string;
  verifiedByAI?: boolean;
  notes?: string;
  updatedAt?: number; // Timestamp of latest entry/punch for sorting
  
  // Shift Information (শিফট তথ্য)
  shiftId?: string;
  shiftName?: string; // e.g. "ডে শিফট", "মর্নিং শিফট", "নাইট শিফট"
  shiftCode?: string; // e.g. "DAY", "MORNING", "NIGHT"
  shiftTiming?: string; // e.g. "০৯:০০ - ১৭:০০"
  
  // GPS & Smart Selfie Fields
  latitude?: number;
  longitude?: number;
  locationName?: string;
  geofenceValid?: boolean;
  fakeGpsDetected?: boolean;
}

export interface PayrollRecord {
  id: string;
  memberId: string;
  memberName: string;
  roll: string;
  monthYear: string; // e.g., "July 2026"
  baseSalary: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeHours: number;
  overtimeRate: number;
  bonusAmount: number;
  fineDeduction: number;
  advanceLoanDeduction: number;
  netPayable: number;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentMethod?: 'bKash' | 'Nagad' | 'Bank' | 'Cash';
  paidDate?: string;
  transactionRef?: string;
}

export interface SomityTransaction {
  id: string;
  memberId: string;
  memberName: string;
  passbookNo: string;
  date: string;
  time: string;
  savingsDeposit: number;
  loanInstallment: number;
  fineAmount: number;
  meetingAttended: boolean;
  receiptNo: string;
  collectedBy: string;
}

export interface LeaveRequest {
  id: string;
  memberId: string;
  memberName: string;
  roll: string;
  leaveType: 'Medical' | 'Casual' | 'Annual' | 'Maternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  approvedBy?: string;
  remarks?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userRole: string;
  action: string;
  targetMember: string;
  details: string;
  status: 'Success' | 'Warning' | 'Security Alert';
}

export interface AcademicSchedule {
  id: string;
  subjectName: string;
  teacherName: string;
  timeSlot: string;
  roomNo: string;
  examName?: string;
  passMark?: number;
}

export interface EmployeeDeviceSession {
  id: string;
  studentId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActive: string;
  isCurrentDevice: boolean;
  isLocked: boolean;
  lockReason?: string;
  lockedAt?: string;
}

export interface EmployeeActivityLog {
  id: string;
  studentId: string;
  timestamp: string;
  activityType: 'login' | 'punch_face' | 'punch_fingerprint' | 'device_lock' | 'device_unlock' | 'security_check';
  description: string;
  device: string;
  ipAddress?: string;
  location?: string;
  status: 'success' | 'warning' | 'locked';
}

export interface DailyClassSummary {
  date: string;
  classId: string;
  totalEnrolled: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  autoSaved: boolean;
}

export interface CameraScanResult {
  matchedStudent: Student | null;
  confidence: number;
  status: AttendanceStatus;
  message: string;
  capturedSnapshot: string;
}

export interface WorkShift {
  id: string;
  name: string;
  nameBangla: string;
  code: string; // 'MORNING' | 'DAY' | 'EVENING' | 'NIGHT' | 'CUSTOM'
  startTime: string; // '08:00'
  endTime: string; // '16:00'
  dutyDurationHours: number; // e.g. 8
  gracePeriodMinutes: number; // e.g. 15 (minutes after startTime before marked Late)
  halfDayMinutes: number; // e.g. 240 (minimum 4 hours)
  isOvernight: boolean; // crosses midnight (e.g. 22:00 to 06:00)
  activeDays: number[]; // [0, 1, 2, 3, 4] 0=Sunday, 1=Monday... 6=Saturday
  department?: string; // Optional specific department or all
  color: string; // Badge styling color
  isActive: boolean;
}

export interface GeofenceSettings {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationName: string;
  address: string;
  enforceGeofence: boolean;
  allowRemoteCheckIn: boolean;
  wifiSsid?: string;
  wifiSSID?: string;
  wifiNetworks?: string[];
  requireWifi?: boolean;
  ipWhitelist?: string;
  bssid?: string;
  enabled?: boolean;
  strictMode?: boolean;
  blockMockLocations?: boolean;
}

export interface OrganizationScheduleSettings {
  autoDetectShift: boolean;
  activeShiftId: string; // Specific shift ID or 'auto'
  shifts: WorkShift[];
  geofence: GeofenceSettings;
  overtimeEnabled: boolean;
  overtimeThresholdMinutes: number; // e.g. 30 minutes after shift
  overtimeHourlyMultiplier: number; // e.g. 1.5
  weeklyHolidays: number[]; // e.g. [5] for Friday or [5, 6] for Fri+Sat
  autoCheckoutEnabled: boolean;
  autoCheckoutTime: string; // e.g. '23:59'
}

