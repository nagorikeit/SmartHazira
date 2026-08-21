import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Camera, 
  ChevronRight, 
  Download,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpDown,
  Fingerprint,
  Edit3,
  Trash2,
  Zap
} from 'lucide-react';
import { Student, ClassSubject } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { isFaceActuallyRegistered, isFingerprintActuallyRegistered } from '../utils/faceMatching';

interface UserDirectoryViewProps {
  students: Student[];
  classes: ClassSubject[];
  orgInfo: OrgCategoryInfo;
  onOpenRegisterModal: () => void;
  onOpenSmartIdCard?: () => void;
  onOpenFaceScanner?: () => void;
  onOpenBiometricsModal?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const UserDirectoryView: React.FC<UserDirectoryViewProps> = ({
  students,
  classes,
  orgInfo,
  onOpenRegisterModal,
  onOpenSmartIdCard,
  onOpenFaceScanner,
  onOpenBiometricsModal,
  onEditStudent,
  onDeleteStudent,
}) => {
  const { terminology } = orgInfo;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter students
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      student.nameBangla.toLowerCase().includes(query) ||
      (student.nameEnglish && student.nameEnglish.toLowerCase().includes(query)) ||
      student.roll.toLowerCase().includes(query) ||
      ((student.guardianPhone || student.parentPhone) && (student.guardianPhone || student.parentPhone || '').includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.designation && student.designation.toLowerCase().includes(query));

    const matchesClass = selectedClassFilter === 'All' || student.classId === selectedClassFilter;
    const matchesStatus = selectedStatusFilter === 'All' || 
      (selectedStatusFilter === 'Active' && student.active !== false) ||
      (selectedStatusFilter === 'Inactive' && student.active === false);

    return matchesSearch && matchesClass && matchesStatus;
  });

  const enrolledBiometricsCount = students.filter(isFaceActuallyRegistered).length;
  const activeCount = students.filter(s => s.active !== false).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Action Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl text-slate-950 shadow-md">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{terminology.memberLabel} তালিকা ও ডিরেক্টরি</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                মোট {students.length} জন
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              সকল {terminology.memberLabel} প্রোফাইল, তথ্য এডিট, আইডি কার্ড ও বায়োমেট্রিক পরিচালনা করুন
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {onOpenSmartIdCard && (
            <button
              onClick={onOpenSmartIdCard}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 transition flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>আইডি কার্ডসমূহ</span>
            </button>
          )}

          <button
            onClick={onOpenRegisterModal}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl transition flex items-center space-x-2 shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ নতুন {terminology.memberLabel} যোগ</span>
          </button>
        </div>
      </div>

      {/* Metrics Mini-Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">মোট {terminology.memberLabel}</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{students.length} জন</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">সক্রিয় সদস্য</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount} জন</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">ফেস ডাটা সক্রিয়</p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{enrolledBiometricsCount} জন</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">মোট বিভাগ/শাখা</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{classes.length} টি</p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`নাম, ${terminology.idLabel} বা মোবাইল দিয়ে খুঁজুন...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-emerald-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-emerald-500 transition cursor-pointer"
          >
            <option value="All">সকল {terminology.groupLabel}</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.classNameBangla} ({c.section})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-emerald-500 transition cursor-pointer"
          >
            <option value="All">সকল স্ট্যাটাস</option>
            <option value="Active">সক্রিয় (Active)</option>
            <option value="Inactive">নিষ্ক্রিয় (Inactive)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              টেবিল ভিউ
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              কার্ড ভিউ
            </button>
          </div>

        </div>
      </div>

      {/* Directory Content */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">কোন {terminology.memberLabel} পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো তথ্য নেই। নতুন সদস্য যোগ করতে নিচের বাটনে ক্লিক করুন।
          </p>
          <button
            onClick={onOpenRegisterModal}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{terminology.registerActionText}</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Table Container with safe min-width and horizontal scrolling so it NEVER breaks */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[200px]">{terminology.memberLabel} ও প্রোফাইল</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px]">{terminology.idLabel}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">{terminology.groupLabel}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">যোগাযোগ</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">বায়োমেট্রিক স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[90px]">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[180px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredStudents.map(student => {
                  const studentClass = classes.find(c => c.id === student.classId);
                  const hasFace = isFaceActuallyRegistered(student);
                  const hasFingerprint = isFingerprintActuallyRegistered(student);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center border border-emerald-500/30 shrink-0 overflow-hidden">
                            {hasFace && (student.faceImage || student.photoUrl) ? (
                              <img src={student.faceImage || student.photoUrl} alt={student.nameBangla} className="w-full h-full object-cover" />
                            ) : (
                              student.nameBangla.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{student.nameBangla}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {student.designation || student.nameEnglish || 'কর্মরত'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ID / Roll */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {student.roll}
                      </td>

                      {/* Class / Department */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {studentClass?.classNameBangla || student.classId}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {(student.guardianPhone || student.parentPhone) ? (
                            <p className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>{student.guardianPhone || student.parentPhone}</span>
                            </p>
                          ) : (
                            <span className="text-[10px] text-slate-400">নম্বর নেই</span>
                          )}
                          {student.email && (
                            <p className="flex items-center space-x-1.5 text-slate-400 text-[10px] truncate max-w-[150px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Biometric Status (Face + Fingerprint) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {hasFace ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" title="ফেস সক্রিয়">
                              <Camera className="w-3 h-3 text-emerald-500" />
                              <span>ফেস সক্রিয়</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              <span>ফেস নেই</span>
                            </span>
                          )}

                          {hasFingerprint ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800" title="ফিঙ্গারপ্রিন্ট সক্রিয়">
                              <Fingerprint className="w-3 h-3 text-indigo-500" />
                              <span>আঙুল সক্রিয়</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              <span>আঙুল নেই</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          student.active !== false 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-600 border border-red-500/20'
                        }`}>
                          {student.active !== false ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* 1. Edit Profile Button */}
                          {onEditStudent && (
                            <button
                              onClick={() => onEditStudent(student)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="তথ্য এডিট করুন"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>এডিট</span>
                            </button>
                          )}

                          {/* 2. Biometrics Button */}
                          {onOpenBiometricsModal && (
                            <button
                              onClick={() => onOpenBiometricsModal(student)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="বায়োমেট্রিক ও ফেস পরিবর্তন/সংযুক্ত করুন"
                            >
                              <Zap className="w-3.5 h-3.5 text-emerald-500" />
                              <span>বায়োমেট্রিক</span>
                            </button>
                          )}

                          {/* 3. Smart ID Card */}
                          {onOpenSmartIdCard && (
                            <button
                              onClick={onOpenSmartIdCard}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="আইডি কার্ড দেখুন"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}

                          {/* 4. Delete Option */}
                          {onDeleteStudent && (
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি "${student.nameBangla}" এর প্রোফাইল মুছে ফেলতে চান?`)) {
                                  onDeleteStudent(student.id);
                                }
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                              title="প্রোফাইল মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const studentClass = classes.find(c => c.id === student.classId);
            const hasFace = isFaceActuallyRegistered(student);
            const hasFingerprint = isFingerprintActuallyRegistered(student);

            return (
              <div key={student.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition">
                
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 font-black text-lg flex items-center justify-center border border-emerald-500/30 shrink-0 overflow-hidden shadow-xs">
                    {hasFace && (student.faceImage || student.photoUrl) ? (
                      <img src={student.faceImage || student.photoUrl} alt={student.nameBangla} className="w-full h-full object-cover" />
                    ) : (
                      student.nameBangla.charAt(0)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {student.nameBangla}
                      </h4>
                      {onEditStudent && (
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1 text-slate-400 hover:text-amber-600 transition cursor-pointer"
                          title="তথ্য এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {terminology.idLabel}: {student.roll}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {studentClass?.classNameBangla || student.classId}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                  {(student.guardianPhone || student.parentPhone) && (
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{student.guardianPhone || student.parentPhone}</span>
                    </div>
                  )}
                  {student.email && (
                    <div className="flex items-center space-x-2 text-slate-500 text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      hasFace 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                    }`}>
                      {hasFace ? '✓ ফেস' : '✕ ফেস নেই'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      hasFingerprint 
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                    }`}>
                      {hasFingerprint ? '✓ আঙুল' : '✕ আঙুল নেই'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {onEditStudent && (
                      <button
                        onClick={() => onEditStudent(student)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>এডিট</span>
                      </button>
                    )}

                    {onOpenBiometricsModal && (
                      <button
                        onClick={() => onOpenBiometricsModal(student)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <Zap className="w-3 h-3" />
                        <span>বায়োমেট্রিক</span>
                      </button>
                    )}

                    {onOpenSmartIdCard && (
                      <button
                        onClick={onOpenSmartIdCard}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer"
                        title="আইডি কার্ড"
                      >
                        <QrCode className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
