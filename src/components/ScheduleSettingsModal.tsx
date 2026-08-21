import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Sliders, 
  X, 
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
  RotateCcw, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Info,
  Building2,
  Wifi
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

interface ScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OrganizationScheduleSettings;
  onSaveSettings: (newSettings: OrganizationScheduleSettings) => void;
  orgInfo: OrgCategoryInfo;
}

export const ScheduleSettingsModal: React.FC<ScheduleSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  orgInfo,
}) => {
  const [activeTab, setActiveTab] = useState<'shifts' | 'geofence' | 'rules'>('shifts');
  const [localSettings, setLocalSettings] = useState<OrganizationScheduleSettings>(settings);
  
  // Shift Editor Modal / Form state
  const [isEditingShift, setIsEditingShift] = useState<boolean>(false);
  const [editingShiftData, setEditingShiftData] = useState<WorkShift | null>(null);

  // GPS Auto-detect state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentGpsCoords, setCurrentGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setIsEditingShift(false);
      setEditingShiftData(null);
      setGpsError(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCaptureCurrentGps = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('আপনার ব্রাউজারে জিও-লোকেশন সাপোর্ট নেই।');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy || 10);

        setCurrentGpsCoords({ lat, lng, accuracy });
        setLocalSettings(prev => ({
          ...prev,
          geofence: {
            ...prev.geofence,
            latitude: lat,
            longitude: lng,
          }
        }));

        setIsLocating(false);
        showToast(`সফলভাবে বর্তমান GPS লোকেশন ক্যাপচার করা হয়েছে (Lat: ${lat}, Lng: ${lng})`);
      },
      (err) => {
        console.warn('Geolocation capture error:', err);
        setGpsError('GPS লোকেশন এক্সেস পাওয়া যায়নি। অনুগ্রহ করে ব্রাউজারে লোকেশন পারমিশন দিন বা ম্যানুয়ালি কোঅর্ডিনেট লিখুন।');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleApplyPresetTemplate = (templateId: string) => {
    const tpl = PRESET_SHIFT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    if (confirm(`আপনি কি "${tpl.name}" টেমপ্লেটটি প্রয়োগ করতে চান? পূর্বের শিফট তালিকা প্রতিস্থাপিত হবে।`)) {
      setLocalSettings(prev => ({
        ...prev,
        shifts: tpl.shifts
      }));
      showToast(`"${tpl.name}" সফলভাবে যুক্ত হয়েছে!`);
    }
  };

  const handleSaveShift = () => {
    if (!editingShiftData) return;

    if (!editingShiftData.nameBangla.trim()) {
      alert('অনুগ্রহ করে শিফটের নাম লিখুন');
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

    setLocalSettings(prev => {
      const existingIdx = prev.shifts.findIndex(s => s.id === finalShift.id);
      let updatedShifts: WorkShift[];
      if (existingIdx >= 0) {
        updatedShifts = [...prev.shifts];
        updatedShifts[existingIdx] = finalShift;
      } else {
        updatedShifts = [...prev.shifts, finalShift];
      }
      return { ...prev, shifts: updatedShifts };
    });

    setIsEditingShift(false);
    setEditingShiftData(null);
    showToast('শিফট সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleDeleteShift = (shiftId: string) => {
    if (localSettings.shifts.length <= 1) {
      alert('সিস্টেমে কমপক্ষে ১টি শিফট সক্রিয় থাকতে হবে।');
      return;
    }
    if (confirm('আপনি কি নিশ্চিত যে এই শিফটটি মুছে ফেলতে চান?')) {
      setLocalSettings(prev => ({
        ...prev,
        shifts: prev.shifts.filter(s => s.id !== shiftId)
      }));
      showToast('শিফট মুছে ফেলা হয়েছে');
    }
  };

  const handleToggleShiftActive = (shiftId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => s.id === shiftId ? { ...s, isActive: !s.isActive } : s)
    }));
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
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white">
                  সিডিউল, শিফট ও জিও-লোকেশন সেটিংস
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ২৪ ঘণ্টা কন্ট্রোল
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ডিউটি শিফট, সময়সীমা, লেট গ্রেস পিরিয়ড ও GPS জিওফেন্স কোড কনফিগার করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Running Shift Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-700 dark:text-slate-200">
              বর্তমানে চলমান শিফট:
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold shadow-xs">
              {currentActive.nameBangla} ({formatTimeInBangla(currentActive.startTime)} - {formatTimeInBangla(currentActive.endTime)})
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>ডিউটি: <strong>{currentActive.dutyDurationHours} ঘণ্টা</strong></span>
            <span>&bull;</span>
            <span>গ্রেস: <strong>{currentActive.gracePeriodMinutes} মিনিট</strong></span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 shrink-0 gap-2 pt-2">
          <button
            onClick={() => { setActiveTab('shifts'); setIsEditingShift(false); }}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'shifts'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>শিফট ও ডিউটি সিডিউল ({localSettings.shifts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('geofence'); setIsEditingShift(false); }}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'geofence'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>জিও-লোকেশন ও জোন (GPS)</span>
          </button>

          <button
            onClick={() => { setActiveTab('rules'); setIsEditingShift(false); }}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'rules'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ওভারটাইম ও অতিরিক্ত নিয়মাবলী</span>
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Toast feedback */}
          {toastMessage && (
            <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center space-x-2 animate-fadeIn shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: SHIFTS & DUTY SCHEDULE */}
          {activeTab === 'shifts' && (
            <div className="space-y-6">
              
              {/* Preset 24h Shift Templates */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>২৪ ঘণ্টা দ্রুত শিফট সেটআপ টেমপ্লেট</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">এক ক্লিকে প্রয়োগ করুন</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PRESET_SHIFT_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => handleApplyPresetTemplate(tpl.id)}
                      className="p-3 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition cursor-pointer group shadow-2xs"
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {tpl.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {tpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shift List & Header Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      বিদ্যমান শিফট তালিকা ও ডিউটি সময়সূচি
                    </h3>
                    <p className="text-xs text-slate-500">
                      প্রত্যেক শিফটের শুরুর সময়, শেষ সময় ও গ্রেস সময় নির্ধারণ করুন
                    </p>
                  </div>

                  <button
                    onClick={handleAddNewShift}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন শিফট যোগ করুন</span>
                  </button>
                </div>

                {/* Shift Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {localSettings.shifts.map((shift, idx) => {
                    const isRunningNow = currentActive.id === shift.id;

                    return (
                      <div
                        key={shift.id}
                        className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                          isRunningNow
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                        } ${!shift.isActive ? 'opacity-50' : ''}`}
                      >
                        <div>
                          {/* Top Row: Badge & Status */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`w-3 h-3 rounded-full ${
                                shift.color === 'emerald' ? 'bg-emerald-500' :
                                shift.color === 'amber' ? 'bg-amber-500' :
                                shift.color === 'indigo' ? 'bg-indigo-500' : 'bg-teal-500'
                              }`} />
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {shift.nameBangla}
                              </h4>
                            </div>

                            <div className="flex items-center space-x-1">
                              {isRunningNow && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-xs">
                                  এখন চলছে
                                </span>
                              )}
                              <button
                                onClick={() => handleToggleShiftActive(shift.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                                  shift.isActive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {shift.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                              </button>
                            </div>
                          </div>

                          {/* Duty Time Details */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-3 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                ডিউটি সময়:
                              </span>
                              <span className="font-black text-slate-900 dark:text-white font-mono">
                                {shift.startTime} - {shift.endTime} ({formatTimeInBangla(shift.startTime)} থেকে {formatTimeInBangla(shift.endTime)})
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">মোট ডিউটি ঘণ্টা:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {shift.dutyDurationHours} ঘণ্টা {shift.isOvernight && '(ওভারনাইট / রাত পার)'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">লেট বিবেচনা (গ্রেস):</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {shift.gracePeriodMinutes} মিনিট পর্যন্ত
                              </span>
                            </div>
                          </div>

                          {/* Active Days */}
                          <div className="flex items-center space-x-1 mb-2">
                            <span className="text-[11px] text-slate-400 mr-1">কার্যদিবস:</span>
                            {daysOfWeekLabels.map(d => {
                              const isDayActive = shift.activeDays.includes(d.day);
                              return (
                                <span
                                  key={d.day}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    isDayActive
                                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {d.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <button
                            onClick={() => {
                              setEditingShiftData({ ...shift });
                              setIsEditingShift(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>এডিট করুন</span>
                          </button>

                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 rounded-lg text-xs transition cursor-pointer"
                            title="শিফট মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shift Editor Sub-Modal / Form */}
              {isEditingShift && editingShiftData && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border-2 border-emerald-500/40 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                      <Edit3 className="w-4 h-4 text-emerald-500" />
                      <span>শিফট তথ্য এডিটর / কনফিগারেশন</span>
                    </h4>
                    <button
                      onClick={() => setIsEditingShift(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Shift Name Bangla */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        শিফটের নাম (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={editingShiftData.nameBangla}
                        onChange={e => setEditingShiftData({ ...editingShiftData, nameBangla: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                        placeholder="যেমন: সকাল শিফট / সাধারণ ডে শিফট"
                      />
                    </div>

                    {/* Shift Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        শিফট কোড
                      </label>
                      <select
                        value={editingShiftData.code}
                        onChange={e => setEditingShiftData({ ...editingShiftData, code: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                      >
                        <option value="MORNING">MORNING (সকাল)</option>
                        <option value="DAY">DAY (সাধারণ দিন)</option>
                        <option value="EVENING">EVENING (সন্ধ্যা)</option>
                        <option value="NIGHT">NIGHT (রাতের শিফট)</option>
                        <option value="CUSTOM">CUSTOM (কাস্টম)</option>
                      </select>
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ডিউটি শুরুর সময় (Start Time)
                      </label>
                      <input
                        type="time"
                        value={editingShiftData.startTime}
                        onChange={e => setEditingShiftData({ ...editingShiftData, startTime: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ডিউটি শেষের সময় (End Time)
                      </label>
                      <input
                        type="time"
                        value={editingShiftData.endTime}
                        onChange={e => setEditingShiftData({ ...editingShiftData, endTime: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    {/* Grace Period */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        লেট মার্জিন / গ্রেস (মিনিট)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={editingShiftData.gracePeriodMinutes}
                        onChange={e => setEditingShiftData({ ...editingShiftData, gracePeriodMinutes: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
                      />
                    </div>

                    {/* Overnight Shift Toggle */}
                    <div className="flex items-center space-x-2 pt-4">
                      <input
                        type="checkbox"
                        id="overnightCheck"
                        checked={editingShiftData.isOvernight}
                        onChange={e => setEditingShiftData({ ...editingShiftData, isOvernight: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="overnightCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        নাইট শিফট (রাত ১২টা পার হওয়া শিফট)
                      </label>
                    </div>

                    {/* Half day threshold */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        হাফ-ডে নূন্যতম সময় (মিনিট)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="720"
                        value={editingShiftData.halfDayMinutes}
                        onChange={e => setEditingShiftData({ ...editingShiftData, halfDayMinutes: parseInt(e.target.value, 10) || 240 })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Active Days Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      সাপ্তাহিক কার্যকর দিনসমূহ নির্বাচন করুন
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
                                ? editingShiftData.activeDays.filter(day => day !== d.day)
                                : [...editingShiftData.activeDays, d.day];
                              setEditingShiftData({ ...editingShiftData, activeDays: newDays });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Editor Buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingShift(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveShift}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>শিফট আপডেট করুন</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: GEOFENCE & GPS COORDINATES */}
          {activeTab === 'geofence' && (
            <div className="space-y-6">
              
              {/* Location Name and GPS Auto capture */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-500" />
                      <span>প্রতিষ্ঠানের ভৌগলিক অবস্থান ও জিওফেন্স জোন</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      সঠিক GPS অক্ষাংশ ও দ্রাঘিমাংশ সেট করুন যাতে কর্মীরা নির্দিষ্ট সীমানায় হাজিরা দিতে পারে
                    </p>
                  </div>

                  {/* Auto GPS Capture Button */}
                  <button
                    onClick={handleCaptureCurrentGps}
                    disabled={isLocating}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md cursor-pointer transition shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>স্যাটেলাইট খুঁজছে...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        <span>📍 বর্তমান GPS লোকেশন ক্যাপচার করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {gpsError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{gpsError}</span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                  
                  {/* Location Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      প্রতিষ্ঠানের লোকেশন / জোন নাম
                    </label>
                    <input
                      type="text"
                      value={localSettings.geofence.locationName}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, locationName: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                      placeholder="যেমন: প্রধান কার্যালয় / ক্যাম্পাস জোন"
                    />
                  </div>

                  {/* Allowed Radius */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      অনুমোদিত জিওফেন্স পরিধি (ব্যাসার্ধ)
                    </label>
                    <select
                      value={localSettings.geofence.radiusMeters}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, radiusMeters: parseInt(e.target.value, 10) || 200 }
                      })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                    >
                      <option value="50">৫০ মিটার (খুব সুনির্দিষ্ট রুম/অফিস)</option>
                      <option value="100">১০০ মিটার (স্ট্যান্ডার্ড বিল্ডিং)</option>
                      <option value="200">২০০ মিটার (ক্যাম্পাস / ফ্যাক্টরি)</option>
                      <option value="500">৫০০ মিটার (বড় এরিয়া / মাঠ)</option>
                      <option value="1000">১০০০ মিটার (১ কিলোমিটার জোন)</option>
                    </select>
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      অক্ষাংশ (Latitude - Lat)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={localSettings.geofence.latitude}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, latitude: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
                      placeholder="e.g. 23.777176"
                    />
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      দ্রাঘিমাংশ (Longitude - Lng)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={localSettings.geofence.longitude}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, longitude: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
                      placeholder="e.g. 90.399452"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বিস্তারিত ঠিকানা
                    </label>
                    <input
                      type="text"
                      value={localSettings.geofence.address}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, address: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
                      placeholder="e.g. ধানমন্ডি, ঢাকা"
                    />
                  </div>

                  {/* Office WiFi SSID Binding */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                      <span>অফিস Wi-Fi SSID / নেটওয়ার্ক নাম (ঐচ্ছিক নিরাপত্তা লেয়ার)</span>
                    </label>
                    <input
                      type="text"
                      value={localSettings.geofence.wifiSsid || ''}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, wifiSsid: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
                      placeholder="e.g. Office_Staff_5G / Enterprise_Campus"
                    />
                  </div>
                </div>

                {/* Geofence Rules Toggles */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      id="enforceGeoCheck"
                      checked={localSettings.geofence.enforceGeofence}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, enforceGeofence: e.target.checked }
                      })}
                      className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="enforceGeoCheck" className="text-xs cursor-pointer">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        কঠোর জিওফেন্স কার্যকর করুন (Strict Geofence)
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        সীমানার বাইরে থাকলে হাজিরা গ্রহণ করা হবে না
                      </span>
                    </label>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      id="remoteCheck"
                      checked={localSettings.geofence.allowRemoteCheckIn}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        geofence: { ...localSettings.geofence, allowRemoteCheckIn: e.target.checked }
                      })}
                      className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="remoteCheck" className="text-xs cursor-pointer">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        রিমোট / ফিল্ড ওয়ার্ক হাজিরা অনুমোদন
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        বাইরে থেকে GPS সেলফি ও কারণ উল্লেখ করে আবেদন করতে পারবে
                      </span>
                    </label>
                  </div>

                </div>

              </div>

              {/* Real-time Distance Radar & Tester */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>লাইভ জিও-ট্যাগ ভ্যালিডেশন রাডার</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Lat: {localSettings.geofence.latitude}, Lng: {localSettings.geofence.longitude}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200">
                        {localSettings.geofence.locationName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {localSettings.geofence.address}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      নিরাপদ পরিধি: {localSettings.geofence.radiusMeters} মিটার
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: OVERTIME & RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>ওভারটাইম ও স্বয়ংক্রিয় চেক-আউট কনফিগারেশন</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Overtime Switch */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        স্বয়ংক্রিয় ওভারটাইম হিসাব
                      </span>
                      <input
                        type="checkbox"
                        checked={localSettings.overtimeEnabled}
                        onChange={e => setLocalSettings({ ...localSettings, overtimeEnabled: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      ডিউটি সময়ের পর অতিরিক্ত কাজ করলে পে-রোলে ওভারটাইম হিসেবে জমা হবে
                    </p>

                    {localSettings.overtimeEnabled && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            ওভারটাইম শুরু সীমা (ডিউটি শেষ হওয়ার কত মিনিট পর)
                          </label>
                          <input
                            type="number"
                            value={localSettings.overtimeThresholdMinutes}
                            onChange={e => setLocalSettings({ ...localSettings, overtimeThresholdMinutes: parseInt(e.target.value, 10) || 0 })}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            ঘণ্টাপ্রতি ওভারটাইম বোনাস গুণক (Multiplier)
                          </label>
                          <select
                            value={localSettings.overtimeHourlyMultiplier}
                            onChange={e => setLocalSettings({ ...localSettings, overtimeHourlyMultiplier: parseFloat(e.target.value) || 1.5 })}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                          >
                            <option value="1.0">1.0x (স্বাভাবিক রেট)</option>
                            <option value="1.25">1.25x (সওয়া এক গুণ)</option>
                            <option value="1.5">1.5x (দেড় গুণ - স্ট্যান্ডার্ড)</option>
                            <option value="2.0">2.0x (দ্বিগুণ রেট)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auto Checkout */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        স্বয়ংক্রিয় চেক-আউট সিস্টেম
                      </span>
                      <input
                        type="checkbox"
                        checked={localSettings.autoCheckoutEnabled}
                        onChange={e => setLocalSettings({ ...localSettings, autoCheckoutEnabled: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      যদি কোনো কর্মী প্রস্থান বা এক্সিট স্ক্যান করতে ভুলে যান, তবে দিনের শেষে স্বয়ংক্রিয়ভাবে ক্লোজ হবে
                    </p>

                    {localSettings.autoCheckoutEnabled && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          স্বয়ংক্রিয় চেক-আউট সময় (Auto Close Time)
                        </label>
                        <input
                          type="time"
                          value={localSettings.autoCheckoutTime}
                          onChange={e => setLocalSettings({ ...localSettings, autoCheckoutTime: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono"
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => setLocalSettings(DEFAULT_SCHEDULE_SETTINGS)}
            className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              বন্ধ করুন
            </button>

            <button
              onClick={handleFinalSaveAll}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস ও শিফট সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
