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
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export type AttendanceMethod = 'Face AI' | 'GPS Selfie' | 'QR Scan' | 'Fingerprint' | 'Manual' | 'Self Kiosk' | 'Automated AI';

export interface Student {
  id: string;
  name: string;
  nameBangla: string;
  roll: string; // Roll number, Staff ID, Card No, or Somity Passbook No
  classId: string;
  className: string;
  companyId?: string;
  companyName?: string;
  photoUrl: string;
  faceRegistered: boolean;
  faceDescriptor?: number[];
  gender: 'Male' | 'Female' | 'Other';
  guardianPhone: string;
  email?: string;
  attendanceStreak: number;
  
  // Extended Employee / Member Fields
  designation?: string;
  department?: string;
  nidNumber?: string;
  joinDate?: string;
  monthlySalary?: number;
  dailyWage?: number;
  hourlyRate?: number;
  
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

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  roll: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss AM/PM
  status: AttendanceStatus;
  method: AttendanceMethod;
  confidenceScore?: number;
  snapshotUrl?: string;
  verifiedByAI?: boolean;
  notes?: string;
  
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
