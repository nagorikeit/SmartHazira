import React, { useState } from 'react';
import { X, Printer, QrCode, Shield, Download } from 'lucide-react';
import { Student } from '../types';
import { OrgCategoryInfo } from '../utils/organizationConfig';

interface SmartIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  orgInfo: OrgCategoryInfo;
}

export const SmartIdCardModal: React.FC<SmartIdCardModalProps> = ({
  isOpen,
  onClose,
  students,
  orgInfo,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  if (!isOpen) return null;

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">স্মার্ট আইডি কার্ড জেনারেটর</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">{orgInfo.terminology.memberLabel} নির্বাচন করুন:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameBangla} ({s.roll}) - {s.className}
              </option>
            ))}
          </select>
        </div>

        {/* Printable Smart ID Card Preview */}
        <div className="flex justify-center my-2">
          <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-2xl border-2 border-emerald-500/40 relative overflow-hidden flex flex-col items-center text-center space-y-3">
            
            {/* Top Logo / Header */}
            <div className="w-full border-b border-slate-700/60 pb-2">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                {orgInfo.terminology.orgCategoryName}
              </span>
              <h4 className="font-extrabold text-xs text-white">স্মার্ট পরিচিতি কার্ড</h4>
            </div>

            {/* Member Photo */}
            <div className="relative">
              <img
                src={student.photoUrl}
                alt={student.nameBangla}
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 shadow-md"
              />
              <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-slate-950 rounded-full">
                <Shield className="w-3 h-3" />
              </span>
            </div>

            {/* Member Details */}
            <div>
              <h3 className="font-black text-sm text-white">{student.nameBangla}</h3>
              <p className="text-[11px] text-emerald-400 font-bold">{student.designation || student.className}</p>
              <p className="text-[10px] font-mono text-slate-300 mt-0.5">
                {orgInfo.terminology.idLabel}: {student.roll}
              </p>
            </div>

            {/* QR Code Placeholder for Face/ID Scan */}
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${student.id}`}
                alt="QR Code"
                className="w-16 h-16"
              />
            </div>

            <span className="text-[9px] text-slate-400 font-mono">
              NID/ID: {student.nidNumber || '19922612345678'}
            </span>

          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>আইডি কার্ড প্রিন্ট করুন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
