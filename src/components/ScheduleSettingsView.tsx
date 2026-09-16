import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Sliders, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Radio, 
  Compass, 
  Navigation, 
  Layers, 
  RefreshCw, 
  Save, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Info,
  Building2,
  Wifi,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  OrganizationScheduleSettings, 
  WorkShift, 
  GeofenceSettings 
} from '../types';
import { 
  DEFAULT_SCHEDULE_SETTINGS, 
  PRESET_SHIFT_TEMPLATES, 
  formatTimeInBangla, 
  timeStringToMinutes,
  calculateDistanceMeters,
  getCurrentActiveShift
} from '../utils/scheduleConfig';
import { OrgCategoryInfo } from '../utils/organizationConfig';

interface ScheduleSettingsViewProps {
  settings: OrganizationScheduleSettings;
  onSaveSettings: (newSettings: OrganizationScheduleSettings) => void;
  orgInfo: OrgCategoryInfo;
  onBackToDashboard: () => void;
}

export const ScheduleSettingsView: React.FC<ScheduleSettingsViewProps> = ({
  settings,
  onSaveSettings,
  orgInfo,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'shifts' | 'rules'>('shifts');
  const [localSettings, setLocalSettings] = useState<OrganizationScheduleSettings>(settings);
  
  // Shift Editor Form state
  const [isEditingShift, setIsEditingShift] = useState<boolean>(false);
  const [editingShiftData, setEditingShiftData] = useState<WorkShift | null>(null);
  const [confirmDeleteShift, setConfirmDeleteShift] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyPresetTemplate = (templateId: string) => {
    const tpl = PRESET_SHIFT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const updated: OrganizationScheduleSettings = {
      ...localSettings,
      shifts: tpl.shifts
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showToast(`"${tpl.name}" শিফট টেমপ্লেট সফলভাবে প্রয়োগ ও ডাটাবেজে সংরক্ষণ করা হয়েছে!`);
  };

  const handleSaveShift = () => {
    if (!editingShiftData) return;

    if (!editingShiftData.nameBangla.trim()) {
      showToast('অনুগ্রহ করে শিফটের নাম লিখুন');
      return;
    }

    // Calculate duty hours
    const startM = timeStringToMinutes(editingShiftData.startTime);
    const endM = timeStringToMinutes(editingShiftData.endTime);
    let diffMinutes = endM - startM;
    if (editingShiftData.isOvernight || diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    const hours = parseFloat((diffMinutes / 60).toFixed(1));

    const finalShift: WorkShift = {
      ...editingShiftData,
      dutyDurationHours: hours > 0 ? hours : 8
    };

    const existingIdx = localSettings.shifts.findIndex(s => s.id === finalShift.id);
    let updatedShifts: WorkShift[];
    if (existingIdx >= 0) {
      updatedShifts = [...localSettings.shifts];
      updatedShifts[existingIdx] = finalShift;
    } else {
      updatedShifts = [...localSettings.shifts, finalShift];
    }
    const updated: OrganizationScheduleSettings = {
      ...localSettings,
      shifts: updatedShifts
    };

    setLocalSettings(updated);
    onSaveSettings(updated);

    setIsEditingShift(false);
    setEditingShiftData(null);
    setConfirmDeleteShift(false);
    showToast('শিফট সফলভাবে সংরক্ষিত ও ডাটাবেজে আপডেট হয়েছে');
  };

  const executeDeleteShift = (shiftId: string) => {
    if (localSettings.shifts.length <= 1) {
      showToast('সিস্টেমে কমপক্ষে ১টি শিফট সক্রিয় থাকতে হবে!');
      setConfirmDeleteShift(false);
      return;
    }
    const updatedShifts = localSettings.shifts.filter(s => s.id !== shiftId);
    const updated: OrganizationScheduleSettings = {
      ...localSettings,
      shifts: updatedShifts,
      activeShiftId: localSettings.activeShiftId === shiftId ? 'auto' : localSettings.activeShiftId
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    setConfirmDeleteShift(false);
    setIsEditingShift(false);
    setEditingShiftData(null);
    showToast('শিফট সফলভাবে মুছে ফেলা হয়েছে ও ডাটাবেজে সংরক্ষিত হয়েছে');
  };

  const handleToggleShiftActive = (shiftId: string) => {
    const updated: OrganizationScheduleSettings = {
      ...localSettings,
      shifts: localSettings.shifts.map(s => s.id === shiftId ? { ...s, isActive: !s.isActive } : s)
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleAddNewShift = () => {
    const newId = `shift-${Date.now()}`;
    setEditingShiftData({
      id: newId,
      name: 'Custom Shift',
      nameBangla: 'নতুন কাস্টম শিফট',
      code: 'CUSTOM',
      startTime: '10:00',
      endTime: '18:00',
      dutyDurationHours: 8,
      gracePeriodMinutes: 15,
      halfDayMinutes: 240,
      isOvernight: false,
      activeDays: [0, 1, 2, 3, 4],
      color: 'teal',
      isActive: true
    });
    setIsEditingShift(true);
  };

  const handleFinalSaveAll = () => {
    onSaveSettings(localSettings);
    showToast('সকল সিডিউল ও জিও-লোকেশন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const currentActive = getCurrentActiveShift(localSettings);

  const daysOfWeekLabels = [
    { day: 0, label: 'রবি' },
    { day: 1, label: 'সোম' },
    { day: 2, label: 'মঙ্গল' },
    { day: 3, label: 'বুধ' },
    { day: 4, label: 'বৃহস্পতি' },
    { day: 5, label: 'শুক্র' },
    { day: 6, label: 'শনি' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Navigation Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <button
            onClick={onBackToDashboard}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition cursor-pointer shrink-0"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Sliders className="w-6 h-6" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                সিডিউল, শিফট ও জিও-লোকেশন সেটিংস
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ২৪ ঘণ্টা কন্ট্রোল প্যানেল
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              ডিউটি শিফট, সময়সীমা, লেট গ্রেস পিরিয়ড ও GPS জিওফেন্স কোড কনফিগার করুন
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-2.5 self-end md:self-center">
          <button
            onClick={handleFinalSaveAll}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition active:scale-95 border border-emerald-400/30"
          >
            <Save className="w-4 h-4" />
            <span>পরিবর্তন সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>

      {/* Currently Running Active Shift Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                বর্তমানে চলমান শিফট:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                {currentActive.nameBangla}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ({formatTimeInBangla(currentActive.startTime)} - {formatTimeInBangla(currentActive.endTime)})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              বর্তমান সময়ের ভিত্তিতে কর্মীদের উপস্থিতি স্বয়ংক্রিয়ভাবে এই শিফটে গণনা করা হচ্ছে।
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span>ডিউটি: <strong className="text-slate-800 dark:text-slate-200">{currentActive.dutyDurationHours} ঘণ্টা</strong></span>
          <span>&bull;</span>
          <span>গ্রেস পিরিয়ড: <strong className="text-amber-600 dark:text-amber-400">{currentActive.gracePeriodMinutes} মিনিট</strong></span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-sm flex flex-wrap gap-1.5">
        <button
          onClick={() => { setActiveTab('shifts'); setIsEditingShift(false); }}
          className={`flex-1 min-w-[160px] py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer ${
            activeTab === 'shifts'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>শিফট ও ডিউটি সিডিউল ({localSettings.shifts.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('rules'); setIsEditingShift(false); }}
          className={`flex-1 min-w-[160px] py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ওভারটাইম ও অতিরিক্ত নিয়মাবলী</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">

        {/* ----------------- TAB 1: SHIFTS & SCHEDULES ----------------- */}
        {activeTab === 'shifts' && (
          <div className="space-y-6">

            {/* Shift Editor Focus Modal Dialog (Centered Popup on Screen - No Scrolling Required) */}
            {isEditingShift && editingShiftData && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
                <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-scaleUp">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          শিফট কনফিগারেশন সম্পাদনা
                        </h3>
                        <p className="text-[11px] text-slate-600 font-medium">
                          শিফটের সময়সীমা, গ্রেস পিরিয়ড ও কার্যদিবস নির্ধারণ করুন
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsEditingShift(false); setEditingShiftData(null); }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer"
                      title="বন্ধ করুন"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body with crisp high-contrast fields */}
                  <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-extrabold text-slate-900 mb-1.5 text-xs">
                          শিফটের নাম (বাংলা) *
                        </label>
                        <input
                          type="text"
                          value={editingShiftData.nameBangla}
                          onChange={(e) => setEditingShiftData({ ...editingShiftData, nameBangla: e.target.value })}
                          placeholder="যেমন: সকালের সাধারণ শিফট"
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-900 mb-1.5 text-xs">
                          শিফট কোড / ট্যাগ
                        </label>
                        <input
                          type="text"
                          value={editingShiftData.code}
                          onChange={(e) => setEditingShiftData({ ...editingShiftData, code: e.target.value.toUpperCase() })}
                          placeholder="যেমন: MORNING, NIGHT"
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-mono font-bold uppercase placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-900 mb-1.5 text-xs">
                          লেট গ্রেস পিরিয়ড (মিনিট)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={editingShiftData.gracePeriodMinutes}
                          onChange={(e) => setEditingShiftData({ ...editingShiftData, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-900 mb-1.5 text-xs">
                          ডিউটি শুরু হওয়ার সময় *
                        </label>
                        <input
                          type="time"
                          value={editingShiftData.startTime}
                          onChange={(e) => setEditingShiftData({ ...editingShiftData, startTime: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-900 mb-1.5 text-xs">
                          ডিউটি শেষ হওয়ার সময় *
                        </label>
                        <input
                          type="time"
                          value={editingShiftData.endTime}
                          onChange={(e) => setEditingShiftData({ ...editingShiftData, endTime: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-900 mb-1.5 text-xs">
                          হাফ-ডে এর ন্যূনতম সময় (মিনিট)
                        </label>
                        <input
                          type="number"
                          min={60}
                          max={600}
                          step={30}
                          value={editingShiftData.halfDayMinutes || 240}
                          onChange={(e) => setEditingShiftData({ ...editingShiftData, halfDayMinutes: parseInt(e.target.value) || 240 })}
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Active Days Selection */}
                    <div className="pt-2">
                      <label className="block font-extrabold text-slate-900 mb-2 text-xs">
                        শিফটটি সপ্তাহের যে যে দিনগুলোতে প্রযোজ্য:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeekLabels.map(d => {
                          const isSelected = editingShiftData.activeDays.includes(d.day);
                          return (
                            <button
                              key={d.day}
                              type="button"
                              onClick={() => {
                                const newDays = isSelected
                                  ? editingShiftData.activeDays.filter(x => x !== d.day)
                                  : [...editingShiftData.activeDays, d.day];
                                setEditingShiftData({ ...editingShiftData, activeDays: newDays });
                              }}
                              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer border-2 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Overnight Checkbox */}
                    <div className="flex items-center space-x-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <input
                        type="checkbox"
                        id="isOvernightShift"
                        checked={editingShiftData.isOvernight || false}
                        onChange={(e) => setEditingShiftData({ ...editingShiftData, isOvernight: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="isOvernightShift" className="text-xs font-bold text-slate-900 cursor-pointer">
                        এটি নাইট / ওভারনাইট শিফট (রাত পেরিয়ে পরদিন সকালে শেষ হয়)
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
                    <div>
                      {localSettings.shifts.some(s => s.id === editingShiftData.id) && (
                        confirmDeleteShift ? (
                          <div className="flex items-center space-x-2 bg-rose-100 p-1.5 px-3 rounded-xl border border-rose-300">
                            <span className="text-xs font-extrabold text-rose-900">সত্যিই মুছে ফেলতে চান?</span>
                            <button
                              type="button"
                              onClick={() => executeDeleteShift(editingShiftData.id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg shadow-sm cursor-pointer transition flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>হ্যাঁ, মুছুন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteShift(false)}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg cursor-pointer transition"
                            >
                              না
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (localSettings.shifts.length <= 1) {
                                showToast('সিস্টেমে কমপক্ষে ১টি শিফট সক্রিয় থাকতে হবে!');
                                return;
                              }
                              setConfirmDeleteShift(true);
                            }}
                            className="w-full sm:w-auto px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 border border-rose-300 hover:border-rose-400 transition cursor-pointer shadow-xs"
                            title="এই শিফটটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span>শিফট মুছে ফেলুন</span>
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-2.5">
                      <button
                        type="button"
                        onClick={() => { setIsEditingShift(false); setEditingShiftData(null); setConfirmDeleteShift(false); }}
                        className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveShift}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>শিফট সংরক্ষণ করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  নিবন্ধিত শিফট তালিকা ({localSettings.shifts.length}টি)
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  প্রতিষ্ঠানের ধরণ অনুযায়ী ১ বা একাধিক শিফট সক্রিয় রাখতে পারবেন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAddNewShift}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন শিফট তৈরি</span>
                </button>
              </div>
            </div>

            {/* Preset Templates Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>রেডিমেড শিফট টেমপ্লেট নির্বাচন করুন (১ ক্লিকে প্রয়োগ):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {PRESET_SHIFT_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplyPresetTemplate(tpl.id)}
                    className="p-3 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-left transition cursor-pointer shadow-xs group"
                  >
                    <p className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700">
                      {tpl.name}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mt-0.5">
                      {tpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Shifts List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {localSettings.shifts.map(shift => (
                <div
                  key={shift.id}
                  className={`bg-white rounded-2xl border-2 p-4 transition-all shadow-sm flex flex-col justify-between space-y-3 ${
                    shift.isActive
                      ? 'border-slate-300 hover:border-emerald-500 shadow-xs'
                      : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-slate-900">
                          {shift.nameBangla}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {shift.code}
                        </span>
                        {shift.isOvernight && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            নাইট শিফট
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-emerald-700">
                        {formatTimeInBangla(shift.startTime)} থেকে {formatTimeInBangla(shift.endTime)}
                      </p>
                    </div>

                    {/* Active Status Badge Toggle */}
                    <button
                      onClick={() => handleToggleShiftActive(shift.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-black transition cursor-pointer border ${
                        shift.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {shift.isActive ? '✓ সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </div>

                  {/* Shift Stats Row */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs border border-slate-200">
                    <div>
                      <p className="text-[10px] text-slate-600 font-bold">মোট ডিউটি</p>
                      <p className="font-black text-slate-900">{shift.dutyDurationHours} ঘণ্টা</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 font-bold">গ্রেস টাইম</p>
                      <p className="font-black text-amber-700">{shift.gracePeriodMinutes} মিনিট</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 font-bold">হাফ-ডে টাইম</p>
                      <p className="font-black text-teal-700">{Math.round((shift.halfDayMinutes || 240) / 60)} ঘণ্টা</p>
                    </div>
                  </div>

                  {/* Active Days Pill Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-[11px] text-slate-700 font-bold mr-1">কার্যদিবস:</span>
                      {daysOfWeekLabels.map(d => {
                        const isDayActive = shift.activeDays.includes(d.day);
                        return (
                          <span
                            key={d.day}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                              isDayActive
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {d.label.charAt(0)}
                          </span>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => { setEditingShiftData(shift); setIsEditingShift(true); }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 rounded-lg border border-slate-300 hover:border-emerald-400 font-extrabold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                        title="সম্পাদনা ও কনফিগার করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>এডিট</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Helpful Notice about GPS Geofencing being in GPS Module */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    অফিস পরিধি সীমানা ও GPS লোকেশন কনফিগারেশন
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    অফিসের ভৌগোলিক অবস্থান, ল্যাটিটিউড/লঙ্গিটিউড ও পরিধি ব্যাসার্ধ সেটিংস আলাদা 'GPS ও জিওফেন্সিং' মডিউলে সংরক্ষিত রয়েছে।
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB 2: RULES & OVERTIME ----------------- */}
        {activeTab === 'rules' && (
          <div className="space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  ওভারটাইম, লেট ও স্বয়ংক্রিয় পলিসি কনফিগারেশন
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  ডিউটি শিফট সম্পন্ন হওয়ার পর স্বয়ংক্রিয় ওভারটাইম ও লেট গণনা রুলস।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Overtime Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      স্বয়ংক্রিয় ওভারটাইম (Overtime) ট্র্যাকিং
                    </span>
                    <input
                      type="checkbox"
                      checked={localSettings.overtimeCalculationEnabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        overtimeCalculationEnabled: e.target.checked
                      }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1.5 text-[11px]">
                      ন্যূনতম অতিরিক্ত কাজের সময় (মিনিট):
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      step={15}
                      value={localSettings.minOvertimeMinutes}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        minOvertimeMinutes: parseInt(e.target.value) || 30
                      }))}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-600 font-medium mt-1">
                      শিফট শেষ হওয়ার পর এই সময়ের বেশি কাজ করলে তা ওভারটাইম হিসেবে পেরোলে যুক্ত হবে।
                    </p>
                  </div>
                </div>

                {/* Late Deduction Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      লেট পেনাল্টি ও ডিডাকশন রুল
                    </span>
                    <input
                      type="checkbox"
                      checked={localSettings.lateDeductionRules?.enabled || false}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        lateDeductionRules: {
                          consecutiveLateDaysForFine: 3,
                          fineAmountOrDayDeduction: 1,
                          enabled: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1.5 text-[11px]">
                      পরপর কতদিন লেট হলে ১ দিনের বেতন বা ছুটি কাটা হবে:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={localSettings.lateDeductionRules?.consecutiveLateDaysForFine || 3}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        lateDeductionRules: {
                          ...prev.lateDeductionRules,
                          consecutiveLateDaysForFine: parseInt(e.target.value) || 3,
                          enabled: true
                        }
                      }))}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-600 font-medium mt-1">
                      যেমন: ৩ দিন লেট = ১ দিনের ক্যাজুয়াল লিভ বা ডিডাকশন।
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-end gap-3">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          ফিরে যান
        </button>

        <button
          onClick={handleFinalSaveAll}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition active:scale-95 border border-emerald-400/30"
        >
          <Save className="w-4 h-4" />
          <span>সেটিংস ও শিফট সংরক্ষণ করুন</span>
        </button>
      </div>

    </div>
  );
};
