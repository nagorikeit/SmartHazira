import { Student, ClassSubject, AttendanceRecord, AttendanceStatus, AttendanceMethod, DailyClassSummary, AttendancePunch } from '../types';
import { INITIAL_CLASSES, INITIAL_STUDENTS, generateInitialAttendanceRecords } from '../data/mockData';
import { calculateStayDuration } from './timeUtils';

const KEYS = {
  CLASSES: 'smart_hazira_classes_v2',
  STUDENTS: 'smart_hazira_students_v2',
  ATTENDANCE: 'smart_hazira_attendance_v2',
  SETTINGS: 'smart_hazira_settings_v2',
};

export const getStoredClasses = (): ClassSubject[] => {
  const data = localStorage.getItem(KEYS.CLASSES);
  if (!data) {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CLASSES;
  }
};

export const getStoredStudents = (): Student[] => {
  const data = localStorage.getItem(KEYS.STUDENTS);
  if (!data) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem(KEYS.ATTENDANCE);
  if (!data) {
    const initial = generateInitialAttendanceRecords();
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    const initial = generateInitialAttendanceRecords();
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(initial));
    return initial;
  }
};

export const saveAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
  const records = getStoredAttendance();
  const id = `att-${record.studentId}-${record.date}-${Date.now()}`;
  
  // Check if a record already exists for this student on this date
  const existingIndex = records.findIndex(r => r.studentId === record.studentId && r.date === record.date);
  
  let newRecord: AttendanceRecord;

  if (existingIndex >= 0) {
    const existing = records[existingIndex];
    // First scan is considered Entry (প্রবেশ)
    const entryTime = record.entryTime || existing.entryTime || existing.time;
    // Subsequent scan is considered Exit (বাহির / প্রস্থান)
    const exitTime = record.exitTime || record.time;

    const { durationText, totalMinutes } = calculateStayDuration(entryTime, exitTime);
    const existingPunches = existing.punches && existing.punches.length > 0 
      ? existing.punches 
      : [{
          id: `p-${existing.id}-1`,
          time: entryTime,
          type: 'Entry' as const,
          method: existing.method,
          confidenceScore: existing.confidenceScore,
          snapshotUrl: existing.snapshotUrl,
          notes: 'প্রথম প্রবেশ হাজিরা',
        }];

    const newPunch: AttendancePunch = {
      id: `p-${Date.now()}`,
      time: exitTime,
      type: 'Exit',
      method: record.method,
      confidenceScore: record.confidenceScore,
      snapshotUrl: record.snapshotUrl,
      notes: record.notes || 'প্রস্থান / বাহির স্ক্যান',
    };

    newRecord = {
      ...existing,
      ...record,
      id: existing.id,
      entryTime: entryTime,
      exitTime: exitTime,
      totalDuration: durationText || '০ মিনিট',
      totalDurationMinutes: totalMinutes,
      punchCount: (existing.punchCount || existingPunches.length) + 1,
      punches: [...existingPunches, newPunch],
      time: exitTime, // show latest activity time
      status: record.status || existing.status || 'Present',
      notes: record.notes || `প্রস্থান চিহ্নিত (মোট অবস্থান: ${durationText})`,
      updatedAt: Date.now(),
    };

    // Remove from previous index and move to the very top so newest activity is at the top
    records.splice(existingIndex, 1);
    records.unshift(newRecord);
  } else {
    // First attendance scan of the day -> Check-In / প্রবেশ
    const entryTime = record.entryTime || record.time;
    const exitTime = record.exitTime;
    const { durationText, totalMinutes } = calculateStayDuration(entryTime, exitTime);

    const firstPunch: AttendancePunch = {
      id: `p-${Date.now()}`,
      time: entryTime,
      type: 'Entry',
      method: record.method,
      confidenceScore: record.confidenceScore,
      snapshotUrl: record.snapshotUrl,
      notes: record.notes || 'প্রথম প্রবেশ হাজিরা',
    };

    newRecord = {
      ...record,
      id,
      entryTime: entryTime,
      exitTime: exitTime,
      totalDuration: exitTime ? durationText : 'অবস্থানরত',
      totalDurationMinutes: totalMinutes,
      punchCount: 1,
      punches: [firstPunch],
      time: entryTime,
      updatedAt: Date.now(),
    };

    records.unshift(newRecord);
  }

  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  
  // Update student attendance streak if present
  if (record.status === 'Present') {
    const students = getStoredStudents();
    const student = students.find(s => s.id === record.studentId);
    if (student) {
      student.attendanceStreak = (student.attendanceStreak || 0) + 1;
      saveStudents(students);
    }
  }

  return newRecord;
};

export const addStudent = (studentData: Omit<Student, 'id' | 'attendanceStreak'>): Student => {
  const students = getStoredStudents();
  const newStudent: Student = {
    ...studentData,
    id: `std-${Date.now()}`,
    attendanceStreak: 0,
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
};

export const updateStudentFace = (studentId: string, photoUrl: string): boolean => {
  const students = getStoredStudents();
  const student = students.find(s => s.id === studentId);
  if (student) {
    student.photoUrl = photoUrl;
    student.faceRegistered = true;
    saveStudents(students);
    return true;
  }
  return false;
};

export const getDailySummaryForClass = (classId: string, date: string): DailyClassSummary => {
  const students = getStoredStudents().filter(s => s.classId === classId);
  const records = getStoredAttendance().filter(r => r.classId === classId && r.date === date);

  const totalEnrolled = students.length || 1;
  let present = 0;
  let absent = 0;
  let late = 0;

  records.forEach(r => {
    if (r.status === 'Present') present++;
    else if (r.status === 'Late') late++;
    else if (r.status === 'Absent') absent++;
  });

  // Default unrecorded students to Absent if date is today or past
  const unrecorded = totalEnrolled - (present + late + absent);
  if (unrecorded > 0) {
    absent += unrecorded;
  }

  const percentage = Math.round(((present + late) / totalEnrolled) * 100);

  return {
    date,
    classId,
    totalEnrolled,
    present,
    absent,
    late,
    percentage,
    autoSaved: true
  };
};

export const updateAttendanceHistoryRecord = (
  student: Student,
  date: string,
  updatedData: {
    entryTime?: string;
    exitTime?: string;
    status: AttendanceStatus;
    method?: AttendanceMethod;
    notes?: string;
  }
): AttendanceRecord => {
  const records = getStoredAttendance();
  const existingIndex = records.findIndex(r => r.studentId === student.id && r.date === date);

  const entryTime = updatedData.entryTime || '';
  const exitTime = updatedData.exitTime || '';
  const { durationText, totalMinutes } = calculateStayDuration(entryTime, exitTime);

  let newOrUpdatedRecord: AttendanceRecord;

  if (existingIndex >= 0) {
    const existing = records[existingIndex];
    newOrUpdatedRecord = {
      ...existing,
      entryTime: entryTime,
      exitTime: exitTime,
      time: exitTime || entryTime || existing.time || '10:00 AM',
      totalDuration: exitTime ? durationText : (entryTime ? 'অবস্থানরত' : '০ মিনিট'),
      totalDurationMinutes: totalMinutes,
      status: updatedData.status,
      method: updatedData.method || existing.method || 'Manual',
      notes: updatedData.notes !== undefined ? updatedData.notes : existing.notes,
      updatedAt: Date.now(),
    };
    records[existingIndex] = newOrUpdatedRecord;
  } else {
    newOrUpdatedRecord = {
      id: `att-${student.id}-${date}-${Date.now()}`,
      studentId: student.id,
      studentName: student.nameBangla,
      roll: student.roll,
      classId: student.classId,
      className: student.className,
      date: date,
      time: entryTime || exitTime || '10:00 AM',
      entryTime: entryTime,
      exitTime: exitTime,
      totalDuration: exitTime ? durationText : (entryTime ? 'অবস্থানরত' : '০ মিনিট'),
      totalDurationMinutes: totalMinutes,
      punchCount: exitTime && entryTime ? 2 : (entryTime || exitTime ? 1 : 0),
      status: updatedData.status,
      method: updatedData.method || 'Manual',
      notes: updatedData.notes || 'অ্যাডমিন কর্তৃক সংরক্ষিত হাজিরা রেকর্ড',
      updatedAt: Date.now(),
    };
    records.unshift(newOrUpdatedRecord);
  }

  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  return newOrUpdatedRecord;
};

export const exportAttendanceCSV = (records: AttendanceRecord[], fileName = 'attendance_report.csv') => {
  const headers = ['তারিখ (Date)', 'সময় (Time)', 'শিক্ষার্থীর নাম (Name)', 'রোল (Roll)', 'শ্রেণী (Class)', 'উপস্থিতি স্ট্যাটাস (Status)', 'পদ্ধতি (Method)'];
  const rows = records.map(r => [
    r.date,
    r.time,
    r.studentName,
    r.roll,
    r.className,
    r.status === 'Present' ? 'উপস্থিত (Present)' : r.status === 'Late' ? 'বিলম্ব (Late)' : 'অনুপস্থিত (Absent)',
    r.method
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
