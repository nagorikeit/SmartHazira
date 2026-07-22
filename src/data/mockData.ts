import { Student, ClassSubject, AttendanceRecord, RegisteredCompany } from '../types';
import { OrgCategoryKey } from '../utils/organizationConfig';

const createAvatar = (seed: string, color: string) => 
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${encodeURIComponent(color)}"/><circle cx="100" cy="80" r="42" fill="%23fce7f3"/><circle cx="85" cy="72" r="6" fill="%231e293b"/><circle cx="115" cy="72" r="6" fill="%231e293b"/><path d="M85 98 Q100 112 115 98" stroke="%231e293b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 180 C40 135 160 135 160 180 Z" fill="%233b82f6"/><text x="100" y="192" font-size="12" font-family="sans-serif" text-anchor="middle" fill="white" font-weight="bold">${encodeURIComponent(seed)}</text></svg>`;

export const CATEGORY_CLASSES: Record<OrgCategoryKey, ClassSubject[]> = {
  educational: [
    {
      id: 'class-10-phy',
      className: 'Class 10',
      classNameBangla: '১০ম শ্রেণী',
      section: 'A',
      subjectName: 'পদার্থবিজ্ঞান (Physics)',
      teacherName: 'ড. আব্দুর রহিম',
      totalStudents: 8,
      roomNo: '২০১ নম্বর কক্ষ',
      scheduleTime: '০৯:০০ AM - ১০:০০ AM'
    },
    {
      id: 'class-9-math',
      className: 'Class 9',
      classNameBangla: '৯ম শ্রেণী',
      section: 'B',
      subjectName: 'উচ্চতর গণিত (Higher Math)',
      teacherName: 'মোসাম্মাৎ ফারজানা আক্তার',
      totalStudents: 6,
      roomNo: '১০৪ নম্বর কক্ষ',
      scheduleTime: '১০:১৫ AM - ১১:১৫ AM'
    },
    {
      id: 'class-12-ict',
      className: 'Class 12',
      classNameBangla: 'দ্বাদশ শ্রেণী',
      section: 'Science',
      subjectName: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
      teacherName: 'প্রকৌশলী তানভীর আহমেদ',
      totalStudents: 6,
      roomNo: 'কম্পিউটার ল্যাব-১',
      scheduleTime: '১১:৩০ AM - ১২:৩০ PM'
    }
  ],
  corporate: [
    {
      id: 'dept-it-dev',
      className: 'Software Engineering',
      classNameBangla: 'আইটি ও সফটওয়্যার বিভাগ',
      section: 'IT',
      subjectName: 'সফটওয়্যার ডেভেলপমেন্ট টিম',
      teacherName: 'সৈয়দ আহসান হাবীব (CTO)',
      totalStudents: 8,
      roomNo: '৪র্থ তলা (লেভেল-৪)',
      scheduleTime: '০৯:০০ AM - ০৬:০০ PM'
    },
    {
      id: 'dept-hr-admin',
      className: 'HR & Management',
      classNameBangla: 'এইচআর ও এডমিন বিভাগ',
      section: 'HR',
      subjectName: 'মানবসম্পদ ও প্রশাসন',
      teacherName: 'নাজমা পারভীন (HR Head)',
      totalStudents: 6,
      roomNo: '৩য় তলা (এইচআর রুম)',
      scheduleTime: '০৯:০০ AM - ০৫:৩০ PM'
    },
    {
      id: 'dept-sales-mkt',
      className: 'Sales & Marketing',
      classNameBangla: 'সেলস ও মার্কেটিং টিম',
      section: 'Sales',
      subjectName: 'মার্কেটিং ও বিজনেস ডেভেলপমেন্ট',
      teacherName: 'আরিফুর রহমান (Sales Director)',
      totalStudents: 6,
      roomNo: '২য় তলা (সেলস কার্নিভাল)',
      scheduleTime: '০৯:৩০ AM - ০৬:৩০ PM'
    }
  ],
  factory: [
    {
      id: 'line-garments-1',
      className: 'Sewing Line 1',
      classNameBangla: 'সুইং সেকশন (লাইন-১)',
      section: 'Floor-A',
      subjectName: 'পোশাক সেলাই ও অ্যাসেম্বলি',
      teacherName: 'সুপারভাইজার মোঃ জাহাঙ্গীর',
      totalStudents: 8,
      roomNo: 'ফ্লোর-১ (সুইং ইউনিট)',
      scheduleTime: '০৮:০০ AM - ০৫:০০ PM'
    },
    {
      id: 'line-embroidery-2',
      className: 'Embroidery Line 2',
      classNameBangla: 'এম্ব্রয়ডারি ও প্রিন্টিং লাইন',
      section: 'Floor-B',
      subjectName: 'ডিজাইন এম্ব্রয়ডারি কারিগরি',
      teacherName: 'ইনচার্জ মোশতাক আহমেদ',
      totalStudents: 6,
      roomNo: 'ফ্লোর-২ (এম্ব্রয়ডারি)',
      scheduleTime: '০৮:০০ AM - ০৫:০০ PM'
    },
    {
      id: 'line-quality-check',
      className: 'Quality Control',
      classNameBangla: 'কোয়ালিটি কন্ট্রোল (QC)',
      section: 'QC',
      subjectName: 'মান নিয়ন্ত্রণ ও প্যাকিং',
      teacherName: 'সুপারভাইজার শাহিন আলম',
      totalStudents: 6,
      roomNo: 'প্যাকিং জোন-৩',
      scheduleTime: '০৮:৩০ AM - ০৫:৩০ PM'
    }
  ],
  medical: [
    {
      id: 'unit-icu-emergency',
      className: 'Emergency Unit',
      classNameBangla: 'জরুরী বিভাগ ও আইসিইউ',
      section: 'ER',
      subjectName: 'ইমার্জেন্সি ও ক্রিটিক্যাল কেয়ার',
      teacherName: 'ড. সাইফুর রহমান (মেডিকেল অফিসার)',
      totalStudents: 8,
      roomNo: 'জরুরী ব্লক (গ্রাউন্ড ফ্লোর)',
      scheduleTime: '২৪/৭ শিফট রোস্টার'
    },
    {
      id: 'unit-opd-nursing',
      className: 'OPD Nursing Unit',
      classNameBangla: 'বহির্বিভাগ ও নার্সিং টিম',
      section: 'OPD',
      subjectName: 'পেশেন্ট কেয়ার ও নার্সিং',
      teacherName: 'ইনচার্জ নার্স রুমানা পারভীন',
      totalStudents: 6,
      roomNo: 'বহির্বিভাগ ২য় তলা',
      scheduleTime: '০৮:০০ AM - ০২:০০ PM'
    }
  ],
  general: [
    {
      id: 'shop-main-branch',
      className: 'Main Showroom',
      classNameBangla: 'প্রধান শোরুম কাউন্টার',
      section: 'Main',
      subjectName: 'সেলস ও কাস্টমার সার্ভিস',
      teacherName: 'ম্যানেজার তারেক মাহমুদ',
      totalStudents: 8,
      roomNo: 'প্রধান আউটলেট',
      scheduleTime: '১০:০০ AM - ০৮:০০ PM'
    },
    {
      id: 'shop-store-warehouse',
      className: 'Warehouse Store',
      classNameBangla: 'ওয়্যারহাউস ও স্টক ডিপো',
      section: 'Store',
      subjectName: 'ইনভেন্টরি ও পণ্য ইন/আউট',
      teacherName: 'স্টোর ইনচার্জ মোশাররফ',
      totalStudents: 6,
      roomNo: 'গুদামঘর ১',
      scheduleTime: '০৯:৩০ AM - ০৬:৩০ PM'
    }
  ],
  somity: [
    {
      id: 'somity-zone-1',
      className: 'Zone 1 Central',
      classNameBangla: 'নাগরিক সমিতি - কেন্দ্রীয় জোন ১',
      section: 'A',
      subjectName: 'সাপ্তাহিক ও মাসিক সাধারণ সভা',
      teacherName: 'হাজী মোঃ নুরুল ইসলাম (সভাপতি)',
      totalStudents: 8,
      roomNo: 'সমিতি মিলনায়তন (লেভেল ২)',
      scheduleTime: 'প্রতি শুক্রবার বিকাল ০৪:০০ টা'
    },
    {
      id: 'somity-zone-2',
      className: 'Zone 2 North',
      classNameBangla: 'নাগরিক সমিতি - উত্তর জোন ২',
      section: 'B',
      subjectName: 'ক্ষুদ্র ঋণ ও সঞ্চয় হিসাব জোন',
      teacherName: 'আব্দুস সাত্তার (সাধারণ সম্পাদক)',
      totalStudents: 6,
      roomNo: 'উত্তর শাখা কার্যালয়',
      scheduleTime: 'প্রতি শনিবার বিকাল ০৫:০০ টা'
    }
  ]
};

export const CATEGORY_MEMBERS: Record<OrgCategoryKey, Student[]> = {
  educational: [
    {
      id: 'std-101',
      name: 'Rafiqul Islam',
      nameBangla: 'রফিকুল ইসলাম',
      roll: '১০১',
      classId: 'class-10-phy',
      className: '১০ম শ্রেণী (Physics)',
      photoUrl: createAvatar('রফিকুল', '#3b82f6'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01711223344',
      email: 'rafiqul@school.edu.bd',
      attendanceStreak: 12
    },
    {
      id: 'std-102',
      name: 'Nusrat Jahan',
      nameBangla: 'নুসরাত জাহান',
      roll: '১০২',
      classId: 'class-10-phy',
      className: '১০ম শ্রেণী (Physics)',
      photoUrl: createAvatar('নুসরাত', '#ec4899'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01812345678',
      email: 'nusrat@school.edu.bd',
      attendanceStreak: 18
    },
    {
      id: 'std-103',
      name: 'Tanvir Hossain',
      nameBangla: 'তানভীর হোসেন',
      roll: '১০৩',
      classId: 'class-10-phy',
      className: '১০ম শ্রেণী (Physics)',
      photoUrl: createAvatar('তানভীর', '#10b981'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01911887766',
      email: 'tanvir@school.edu.bd',
      attendanceStreak: 5
    },
    {
      id: 'std-104',
      name: 'Sumaiya Akter',
      nameBangla: 'সুমাইয়া আক্তার',
      roll: '১০৪',
      classId: 'class-10-phy',
      className: '১০ম শ্রেণী (Physics)',
      photoUrl: createAvatar('সুমাইয়া', '#8b5cf6'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01511223344',
      email: 'sumaiya@school.edu.bd',
      attendanceStreak: 21
    },
    {
      id: 'std-105',
      name: 'Arif Hasan',
      nameBangla: 'আরিফ হাসান',
      roll: '১০৫',
      classId: 'class-10-phy',
      className: '১০ম শ্রেণী (Physics)',
      photoUrl: createAvatar('আরিফ', '#f59e0b'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01611223344',
      email: 'arif@school.edu.bd',
      attendanceStreak: 9
    }
  ],
  corporate: [
    {
      id: 'corp-101',
      name: 'Tawhid Hasan',
      nameBangla: 'তৌহিদ হাসান',
      roll: 'EMP-101',
      classId: 'dept-it-dev',
      className: 'আইটি ও সফটওয়্যার বিভাগ',
      photoUrl: createAvatar('তৌহিদ', '#3b82f6'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01711223344',
      email: 'tawhid@company.com',
      attendanceStreak: 24
    },
    {
      id: 'corp-102',
      name: 'Sharmin Sultana',
      nameBangla: 'শারমিন সুলতানা',
      roll: 'EMP-102',
      classId: 'dept-it-dev',
      className: 'আইটি ও সফটওয়্যার বিভাগ',
      photoUrl: createAvatar('শারমিন', '#ec4899'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01812345678',
      email: 'sharmin@company.com',
      attendanceStreak: 19
    },
    {
      id: 'corp-103',
      name: 'Kamrul Islam',
      nameBangla: 'কামরুল ইসলাম',
      roll: 'EMP-103',
      classId: 'dept-it-dev',
      className: 'আইটি ও সফটওয়্যার বিভাগ',
      photoUrl: createAvatar('কামরুল', '#10b981'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01911887766',
      email: 'kamrul@company.com',
      attendanceStreak: 11
    },
    {
      id: 'corp-104',
      name: 'Farhana Chowdhury',
      nameBangla: 'ফারহানা চৌধুরী',
      roll: 'EMP-104',
      classId: 'dept-it-dev',
      className: 'আইটি ও সফটওয়্যার বিভাগ',
      photoUrl: createAvatar('ফারহানা', '#8b5cf6'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01511223344',
      email: 'farhana@company.com',
      attendanceStreak: 30
    }
  ],
  factory: [
    {
      id: 'wrk-101',
      name: 'Abul Kalam',
      nameBangla: 'আবুল কালাম',
      roll: 'CARD-501',
      classId: 'line-garments-1',
      className: 'সুইং সেকশন (লাইন-১)',
      photoUrl: createAvatar('কালাম', '#3b82f6'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01711223344',
      attendanceStreak: 15
    },
    {
      id: 'wrk-102',
      name: 'Rina Begum',
      nameBangla: 'রিনা বেগম',
      roll: 'CARD-502',
      classId: 'line-garments-1',
      className: 'সুইং সেকশন (লাইন-১)',
      photoUrl: createAvatar('রিনা', '#ec4899'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01812345678',
      attendanceStreak: 22
    },
    {
      id: 'wrk-103',
      name: 'Mizanur Rahman',
      nameBangla: 'মিজানুর রহমান',
      roll: 'CARD-503',
      classId: 'line-garments-1',
      className: 'সুইং সেকশন (লাইন-১)',
      photoUrl: createAvatar('মিজানুর', '#10b981'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01911887766',
      attendanceStreak: 8
    }
  ],
  medical: [
    {
      id: 'med-101',
      name: 'Dr. Sajjad Hossain',
      nameBangla: 'ড. সাজ্জাদ হোসেন',
      roll: 'DOC-201',
      classId: 'unit-icu-emergency',
      className: 'জরুরী বিভাগ ও আইসিইউ',
      photoUrl: createAvatar('সাজ্জাদ', '#06b6d4'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01711223344',
      attendanceStreak: 28
    },
    {
      id: 'med-102',
      name: 'Nurse Salma Akter',
      nameBangla: 'সালমা আক্তার (নার্স)',
      roll: 'NRS-301',
      classId: 'unit-icu-emergency',
      className: 'জরুরী বিভাগ ও আইসিইউ',
      photoUrl: createAvatar('সালমা', '#ec4899'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01812345678',
      attendanceStreak: 14
    }
  ],
  general: [
    {
      id: 'gen-101',
      name: 'Jahidul Islam',
      nameBangla: 'জাহিদুল ইসলাম',
      roll: 'STF-01',
      classId: 'shop-main-branch',
      className: 'প্রধান শোরুম কাউন্টার',
      photoUrl: createAvatar('জাহিদ', '#f59e0b'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01711223344',
      attendanceStreak: 12
    },
    {
      id: 'gen-102',
      name: 'Sabrina Yasmine',
      nameBangla: 'সাবরিনা ইয়াসমিন',
      roll: 'STF-02',
      classId: 'shop-main-branch',
      className: 'প্রধান শোরুম কাউন্টার',
      photoUrl: createAvatar('সাবরিনা', '#8b5cf6'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01812345678',
      attendanceStreak: 18
    }
  ],
  somity: [
    {
      id: 'som-001',
      name: 'Mohammad Faruk',
      nameBangla: 'ফারুক হোসেন',
      roll: 'SOM-001',
      classId: 'somity-zone-1',
      className: 'নাগরিক সমিতি - কেন্দ্রীয় জোন ১',
      photoUrl: createAvatar('ফারুক', '#0284c7'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01715001122',
      attendanceStreak: 15,
      designation: 'সাধারণ সদস্য',
      department: 'কেন্দ্রীয় জোন',
      nidNumber: '1992261234567890',
      joinDate: '2023-01-15',
      savingsBalance: 45000,
      loanBalance: 12000,
      shareCount: 5
    },
    {
      id: 'som-002',
      name: 'Begum Rashida',
      nameBangla: 'রাশিদা বেগম',
      roll: 'SOM-002',
      classId: 'somity-zone-1',
      className: 'নাগরিক সমিতি - কেন্দ্রীয় জোন ১',
      photoUrl: createAvatar('রাশিদা', '#db2777'),
      faceRegistered: true,
      gender: 'Female',
      guardianPhone: '01819002233',
      attendanceStreak: 20,
      designation: 'জীবনসূচক সদস্য',
      department: 'কেন্দ্রীয় জোন',
      nidNumber: '1988269876543210',
      joinDate: '2022-05-10',
      savingsBalance: 82000,
      loanBalance: 0,
      shareCount: 10
    },
    {
      id: 'som-003',
      name: 'Kamal Hossain',
      nameBangla: 'কামাল হোসেন',
      roll: 'SOM-003',
      classId: 'somity-zone-2',
      className: 'নাগরিক সমিতি - উত্তর জোন ২',
      photoUrl: createAvatar('কামাল', '#16a34a'),
      faceRegistered: true,
      gender: 'Male',
      guardianPhone: '01911883344',
      attendanceStreak: 8,
      designation: 'সদস্য',
      department: 'উত্তর জোন',
      nidNumber: '1995261122334455',
      joinDate: '2024-02-01',
      savingsBalance: 18500,
      loanBalance: 25000,
      shareCount: 2
    }
  ]
};

export const INITIAL_CLASSES = CATEGORY_CLASSES.educational;
export const INITIAL_STUDENTS = CATEGORY_MEMBERS.educational;

export const generateInitialAttendanceRecords = (categoryKey: OrgCategoryKey = 'educational'): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const members = CATEGORY_MEMBERS[categoryKey] || CATEGORY_MEMBERS.educational;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay();
    if (dayOfWeek === 5) continue; // Skip Friday

    members.forEach((std, idx) => {
      let status: 'Present' | 'Absent' | 'Late' = 'Present';
      if ((idx + i) % 7 === 0) status = 'Late';
      if ((idx + i) % 9 === 0) status = 'Absent';

      const hour = status === 'Late' ? 9 : 8;
      const min = status === 'Late' ? Math.floor(Math.random() * 20) + 15 : Math.floor(Math.random() * 45) + 10;

      records.push({
        id: `att-${std.id}-${dateStr}`,
        studentId: std.id,
        studentName: std.nameBangla,
        roll: std.roll,
        classId: std.classId,
        className: std.className,
        date: dateStr,
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:15 ${hour >= 12 ? 'PM' : 'AM'}`,
        status,
        method: i === 0 ? 'Face AI' : 'Automated AI',
        confidenceScore: 0.92 + (Math.random() * 0.07),
        verifiedByAI: true,
        notes: status === 'Late' ? '১০ মিনিট দেরিতে ইন করেছে' : status === 'Absent' ? 'অনুপস্থিত' : 'সময়মতো উপস্থিত'
      });
    });
  }

  return records;
};

export const MOCK_PAYROLL_RECORDS = [
  {
    id: 'pay-001',
    memberId: 'emp-101',
    memberName: 'আরিফুল ইসলাম',
    roll: 'STF-101',
    monthYear: 'জুলাই ২০২৬',
    baseSalary: 45000,
    presentDays: 22,
    absentDays: 1,
    lateDays: 2,
    overtimeHours: 12,
    overtimeRate: 350,
    bonusAmount: 3000,
    fineDeduction: 500,
    advanceLoanDeduction: 2000,
    netPayable: 49700,
    status: 'Paid' as const,
    paymentMethod: 'bKash' as const,
    paidDate: '2026-07-20',
    transactionRef: 'BKASH-9X8821'
  },
  {
    id: 'pay-002',
    memberId: 'emp-102',
    memberName: 'মাহমুদা সুলতানা',
    roll: 'STF-102',
    monthYear: 'জুলাই ২০২৬',
    baseSalary: 38000,
    presentDays: 24,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: 8,
    overtimeRate: 300,
    bonusAmount: 2500,
    fineDeduction: 0,
    advanceLoanDeduction: 0,
    netPayable: 42900,
    status: 'Paid' as const,
    paymentMethod: 'Bank' as const,
    paidDate: '2026-07-21',
    transactionRef: 'DBBL-771239'
  },
  {
    id: 'pay-003',
    memberId: 'fct-201',
    memberName: 'আব্দুল কুদ্দুস',
    roll: 'LNE-101',
    monthYear: 'জুলাই ২০২৬',
    baseSalary: 22000,
    presentDays: 21,
    absentDays: 2,
    lateDays: 3,
    overtimeHours: 24,
    overtimeRate: 200,
    bonusAmount: 1500,
    fineDeduction: 600,
    advanceLoanDeduction: 1000,
    netPayable: 26700,
    status: 'Pending' as const,
    paymentMethod: 'Nagad' as const
  }
];

export const MOCK_SOMITY_TRANSACTIONS = [
  {
    id: 'som-tx-01',
    memberId: 'som-001',
    memberName: 'ফারুক হোসেন',
    passbookNo: 'SOM-001',
    date: '2026-07-18',
    time: '04:30 PM',
    savingsDeposit: 1000,
    loanInstallment: 1500,
    fineAmount: 0,
    meetingAttended: true,
    receiptNo: 'RCT-10021',
    collectedBy: 'কোষাধ্যক্ষ স্বপন কান্তি'
  },
  {
    id: 'som-tx-02',
    memberId: 'som-002',
    memberName: 'রাশিদা বেগম',
    passbookNo: 'SOM-002',
    date: '2026-07-18',
    time: '04:35 PM',
    savingsDeposit: 2000,
    loanInstallment: 0,
    fineAmount: 0,
    meetingAttended: true,
    receiptNo: 'RCT-10022',
    collectedBy: 'কোষাধ্যক্ষ স্বপন কান্তি'
  },
  {
    id: 'som-tx-03',
    memberId: 'som-003',
    memberName: 'কামাল হোসেন',
    passbookNo: 'SOM-003',
    date: '2026-07-11',
    time: '05:10 PM',
    savingsDeposit: 500,
    loanInstallment: 2000,
    fineAmount: 100,
    meetingAttended: false,
    receiptNo: 'RCT-10015',
    collectedBy: 'হিসাবরক্ষক হাবিব'
  }
];

export const MOCK_LEAVE_REQUESTS = [
  {
    id: 'lv-001',
    memberId: 'std-101',
    memberName: 'রফিকুল ইসলাম',
    roll: '১০১',
    leaveType: 'Medical' as const,
    startDate: '2026-07-22',
    endDate: '2026-07-24',
    totalDays: 3,
    reason: 'জ্বর ও ঠান্ডা কাশির কারণে ৩ দিনের ডাক্তার পরামর্শকৃত ছুটি',
    status: 'Pending' as const,
    appliedDate: '2026-07-21'
  },
  {
    id: 'lv-002',
    memberId: 'emp-102',
    memberName: 'মাহমুদা সুলতানা',
    roll: 'STF-102',
    leaveType: 'Casual' as const,
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    totalDays: 2,
    reason: 'পারিবারিক অনুষ্ঠান উপলক্ষ্যে নৈমিত্তিক ছুটি',
    status: 'Approved' as const,
    appliedDate: '2026-07-12',
    approvedBy: 'প্রশাসন বিভাগ'
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    id: 'log-001',
    timestamp: '2026-07-21 09:15:22 AM',
    userRole: 'Teacher / Manager',
    action: 'Face AI Attendance Verified',
    targetMember: 'রফিকুল ইসলাম (১০১)',
    details: 'কনফিডেন্স স্কোর ৯৬% - ফেস রিকগনিশন সফল',
    status: 'Success' as const
  },
  {
    id: 'log-002',
    timestamp: '2026-07-21 09:22:10 AM',
    userRole: 'Kiosk System',
    action: 'GPS Selfie Geofence Check',
    targetMember: 'তানভীর হোসেন (১০৩)',
    details: 'লোকেশন: ধানমন্ডি ক্যাম্পাস (ব্যাসার্ধ ৫০মি এর ভেতরে সফল)',
    status: 'Success' as const
  },
  {
    id: 'log-003',
    timestamp: '2026-07-21 09:40:05 AM',
    userRole: 'Security AI',
    action: 'Fake GPS Fraud Warning',
    targetMember: 'Unknown Device',
    details: 'সেলফি জিওফেন্স দূরত্ব সীমা লঙ্ঘন (Fake Location Simulated)',
    status: 'Security Alert' as const
  }
];

export const MOCK_ACADEMIC_SCHEDULE = [
  {
    id: 'sch-01',
    subjectName: 'পদার্থবিজ্ঞান ১ম পত্র',
    teacherName: 'ড. আব্দুর রহিম',
    timeSlot: '০৯:০০ AM - ১০:০০ AM',
    roomNo: '২০১ নম্বর কক্ষ',
    examName: 'মিডটার্ম পরীক্ষা',
    passMark: 40
  },
  {
    id: 'sch-02',
    subjectName: 'উচ্চতর গণিত',
    teacherName: 'মোসাম্মাৎ ফারজানা আক্তার',
    timeSlot: '১০:১৫ AM - ১১:১৫ AM',
    roomNo: '১০৪ নম্বর কক্ষ',
    examName: 'শ্রেণী মূল্যায়ন тест',
    passMark: 33
  }
];

export const MOCK_COMPANIES: RegisteredCompany[] = [
  {
    id: 'cmp-001',
    nameBangla: 'স্কাইটেক আইটি సొলিউশনস লিমিটেড',
    nameEnglish: 'SkyTech IT Solutions Ltd.',
    category: 'corporate',
    code: 'ST-CORP-01',
    contactEmail: 'admin@skytechbd.com',
    contactPhone: '01711002233',
    address: 'লেভেল-৪, গুলশান ট্রেড টাওয়ার, ঢাকা',
    totalMembers: 4,
    status: 'Active',
    registeredDate: '2025-01-10',
    adminName: 'তানভীর আহমেদ (HR Head)'
  },
  {
    id: 'cmp-002',
    nameBangla: 'মিরপুর ক্যানটনমেন্ট স্কুল অ্যান্ড কলেজ',
    nameEnglish: 'Mirpur Cantonment School & College',
    category: 'educational',
    code: 'MCS-EDU-02',
    contactEmail: 'info@mcsc.edu.bd',
    contactPhone: '01819887766',
    address: 'মিরপুর ডিওএইচএস, ঢাকা',
    totalMembers: 5,
    status: 'Active',
    registeredDate: '2025-02-15',
    adminName: 'ড. আব্দুর রহিম (প্রিন্সিপাল)'
  },
  {
    id: 'cmp-003',
    nameBangla: 'গ্রিনল্যান্ড গার্মেন্টস অ্যান্ড টেক্সটাইল',
    nameEnglish: 'Greenland Garments & Textile Ltd.',
    category: 'factory',
    code: 'GGL-FCT-03',
    contactEmail: 'hr@greenlandgarments.com',
    contactPhone: '01911334455',
    address: 'কোনাবাড়ী বিসিক শিল্পনগরী, গাজীপুর',
    totalMembers: 3,
    status: 'Active',
    registeredDate: '2025-03-01',
    adminName: 'মোঃ জাহাঙ্গীর (ফ্যাক্টরি জিএম)'
  },
  {
    id: 'cmp-004',
    nameBangla: 'সিটি জেনারেল হাসপাতাল ও ডায়াগনস্টিক',
    nameEnglish: 'City General Hospital Ltd.',
    category: 'medical',
    code: 'CGH-MED-04',
    contactEmail: 'admin@cityhospital.com.bd',
    contactPhone: '01511223344',
    address: 'ধানমন্ডি ২৭, ঢাকা',
    totalMembers: 2,
    status: 'Active',
    registeredDate: '2025-04-12',
    adminName: 'ড. সাইফুর রহমান (পরিচালক)'
  },
  {
    id: 'cmp-005',
    nameBangla: 'নাগরিক বহুমুখী সমবায় সমিতি লিঃ',
    nameEnglish: 'Nagorik Multipurpose Co-operative Somity',
    category: 'somity',
    code: 'NMC-SOM-05',
    contactEmail: 'contact@nagoriksomity.org',
    contactPhone: '01715001122',
    address: 'নাগরিক ভবন, লালমাটিয়া, ঢাকা',
    totalMembers: 3,
    status: 'Active',
    registeredDate: '2025-05-20',
    adminName: 'হাজী মোঃ নুরুল ইসলাম (সভাপতি)'
  }
];
