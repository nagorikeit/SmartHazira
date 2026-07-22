import { Student, ClassSubject, AttendanceRecord, AttendanceStatus, DailyClassSummary } from '../types';
import { INITIAL_CLASSES, INITIAL_STUDENTS, generateInitialAttendanceRecords } from '../data/mockData';

const KEYS = {
  CLASSES: 'smart_hazira_classes_v1',
  STUDENTS: 'smart_hazira_students_v1',
  ATTENDANCE: 'smart_hazira_attendance_v1',
  SETTINGS: 'smart_hazira_settings_v1',
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
  
  const newRecord: AttendanceRecord = {
    ...record,
    id: existingIndex >= 0 ? records[existingIndex].id : id,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = newRecord;
  } else {
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
