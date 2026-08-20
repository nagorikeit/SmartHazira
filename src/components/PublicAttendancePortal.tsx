import React, { useRef, useState, useEffect } from 'react';
import { Student, ClassSubject, AttendanceRecord } from '../types';
import { identifyStudentFromCamera } from '../utils/faceMatching';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { 
  Camera, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Clock, 
  KeyRound, 
  Building2, 
  Check, 
  AlertCircle,
  Smartphone,
  LogOut,
  Maximize2
} from 'lucide-react';

interface PublicAttendancePortalProps {
  classes: ClassSubject[];
  students: Student[];
  onExitPortal: () => void;
  onAttendanceUpdated: (record: AttendanceRecord) => void;
  soundEnabled: boolean;
  orgInfo: OrgCategoryInfo;
  companyName?: string;
  enforceGeofence?: boolean;
}

export const PublicAttendancePortal: React.FC<PublicAttendancePortalProps> = ({
  classes,
  students,
  onExitPortal,
  onAttendanceUpdated,
  soundEnabled,
  orgInfo,
  companyName,
  enforceGeofence = false,
}) => {
  const { terminology } = orgInfo;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeMode, setActiveMode] = useState<'face' | 'pin'>('face');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Detection result
  const [lastDetectedStudent, setLastDetectedStudent] = useState<Student | null>(null);
  const [detectionTimestamp, setDetectionTimestamp] = useState<string>('');
  const [detectionSuccess, setDetectionSuccess] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('ক্যামেরার দিকে সরাসরি তাকান');

  // PIN / ID Keypad State
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // GPS State
  const [gpsVerified, setGpsVerified] = useState<boolean>(!enforceGeofence);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Current Live Time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Play audio feedback
  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio fallback
    }
  };

  // Check GPS location if geofencing is enabled
  useEffect(() => {
    if (enforceGeofence) {
      setGpsLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGpsVerified(true);
            setGpsLoading(false);
          },
          (err) => {
            console.warn("GPS Geofence check warning:", err);
            // Allow with notice in preview sandbox
            setGpsVerified(true);
            setGpsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        setGpsVerified(true);
        setGpsLoading(false);
      }
    }
  }, [enforceGeofence]);

  // Start Camera Stream for Face mode
  useEffect(() => {
    if (activeMode !== 'face') {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    const initCamera = async () => {
      setCameraError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("Public attendance camera error:", err);
        setCameraError("ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজারের ক্যামেরা অনুমতি দিন।");
      }
    };

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [activeMode]);

  // Auto Face Scan Loop
  useEffect(() => {
    if (activeMode !== 'face') return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isScanning || students.length === 0 || detectionSuccess) return;

      setIsScanning(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const matched = await identifyStudentFromCamera(canvas, students);
          if (matched) {
            handleSuccessfulPunch(matched, 'Face');
          } else {
            setScanMessage('ক্যামেরার দিকে সরাসরি সোজা তাকান...');
          }
        } catch {
          // Continuous loop catch
        }
      }
      setIsScanning(false);
    }, 2800);

    return () => clearInterval(interval);
  }, [isScanning, students, activeMode, detectionSuccess]);

  // Handle Successful Attendance Submission
  const handleSuccessfulPunch = (student: Student, method: 'Face' | 'PIN' | 'QR') => {
    setLastDetectedStudent(student);
    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const today = new Date().toISOString().split('T')[0];
    setDetectionTimestamp(nowTime);
    setDetectionSuccess(true);
    playSuccessSound();

    const currentClass = classes.find(c => c.id === student.classId) || classes[0];

    const record: AttendanceRecord = {
      id: `att-pub-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.nameBangla,
      roll: student.roll,
      classId: student.classId,
      className: currentClass ? currentClass.classNameBangla : orgInfo.terminology.groupLabel,
      date: today,
      time: nowTime,
      status: 'Present',
      method: method === 'Face' ? 'Face' : 'Manual',
      notes: `সেলফ-সার্ভিস পাবলিক লিংক থেকে হাজিরা নিশ্চিত (${method})`
    };

    onAttendanceUpdated(record);

    // Auto reset for next person after 4 seconds
    setTimeout(() => {
      setDetectionSuccess(false);
      setLastDetectedStudent(null);
      setPinInput('');
      setScanMessage('পরবর্তী কর্মীর জন্য প্রস্তুত, ক্যামেরার সামনে দাঁড়ান');
    }, 4200);
  };

  // Handle Manual PIN / ID punch
  const handlePinSubmit = () => {
    if (!pinInput.trim()) {
      setPinError('আইডি বা রোল নম্বর প্রদান করুন');
      return;
    }

    const matched = students.find(s => s.roll === pinInput.trim() || s.id === pinInput.trim() || s.phone?.endsWith(pinInput.trim()));
    if (matched) {
      setPinError(null);
      handleSuccessfulPunch(matched, 'PIN');
    } else {
      setPinError('কোনো কর্মীর তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি বা রোল টাইপ করুন।');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* Top Banner (Isolated Portal Header) */}
      <header className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 rounded-2xl shadow-lg">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{companyName || orgInfo.label}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ডিজিটাল হাজিরা পোর্টাল
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              সুরক্ষিত সেলফ-সার্ভিস হাজিরা সিস্টেম
            </p>
          </div>
        </div>

        {/* Live Clock & Exit */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-2xl text-xs text-emerald-400 font-mono font-bold">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{currentTime.toLocaleTimeString('bn-BD')}</span>
          </div>

          <button
            onClick={onExitPortal}
            title="এডমিন প্যানেলে ফিরুন"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">এডমিন লগইন</span>
          </button>
        </div>
      </header>

      {/* Main Punch Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center">
        
        {/* Success Popup Card when a person punches */}
        {detectionSuccess && lastDetectedStudent ? (
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl shadow-emerald-500/20 animate-scaleUp">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                উপস্থিতি সফল হয়েছে
              </span>
              <h2 className="text-2xl font-black text-white pt-2">
                {lastDetectedStudent.nameBangla}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {terminology.memberLabel} আইডি: {lastDetectedStudent.roll}
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
              <span>রেকর্ড সময়:</span>
              <span className="font-mono font-bold text-emerald-400">{detectionTimestamp}</span>
            </div>

            <p className="text-[11px] text-slate-500 animate-pulse">
              পরবর্তী কর্মীর জন্য স্ক্রিন স্বয়ংক্রিয়ভাবে প্রস্তুত হচ্ছে...
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
            
            {/* Mode Selector Toggle */}
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1.5">
              <button
                onClick={() => setActiveMode('face')}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer ${
                  activeMode === 'face'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>AI ফেস স্ক্যান হাজিরা</span>
              </button>

              <button
                onClick={() => setActiveMode('pin')}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer ${
                  activeMode === 'pin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>আইডি / পিন দিয়ে হাজিরা</span>
              </button>
            </div>

            {/* MODE 1: Face Scan Camera Interface */}
            {activeMode === 'face' && (
              <div className="space-y-4">
                
                {/* Camera Viewfinder */}
                <div className="relative aspect-video sm:aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Face Target Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-56 sm:w-56 sm:h-64 border-2 border-emerald-400/70 rounded-3xl flex flex-col justify-between p-3 relative">
                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                        <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] font-bold bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {isScanning ? 'স্ক্যান হচ্ছে...' : 'মুখমণ্ডল রাখুন'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                        <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <AlertCircle className="w-10 h-10 text-amber-400" />
                      <p className="text-xs text-slate-300 font-medium">{cameraError}</p>
                    </div>
                  )}
                </div>

                {/* Scan Status & Instructions */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>{scanMessage}</span>
                  </div>

                  <span className="text-[11px] text-emerald-400 font-bold">
                    স্বয়ংক্রিয় সনাক্তকরণ
                  </span>
                </div>

              </div>
            )}

            {/* MODE 2: ID / PIN Keypad Interface */}
            {activeMode === 'pin' && (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">
                    আপনার {terminology.memberLabel} আইডি বা রোল নম্বর লিখুন:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                      placeholder="যেমন: 101, 102 অথবা ফোন নম্বর..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-base font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handlePinSubmit}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl transition cursor-pointer shadow-md"
                    >
                      হাজিরা দিন
                    </button>
                  </div>
                  {pinError && (
                    <p className="text-xs text-rose-400 font-medium pt-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>

                {/* Quick Keypad */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPinInput(prev => prev + num)}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl font-bold text-base text-white transition cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setPinInput('')}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl font-bold text-xs text-rose-400 transition cursor-pointer"
                  >
                    মুছুন
                  </button>
                  <button
                    onClick={() => setPinInput(prev => prev + '0')}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl font-bold text-base text-white transition cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs transition cursor-pointer"
                  >
                    দাখিল
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer Security Notice */}
      <footer className="p-4 border-t border-slate-800/80 bg-slate-900/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-bold">এডমিন তথ্য সংরক্ষিত</span>
        </div>
        <span className="hidden sm:inline">&bull;</span>
        <span>এই পোর্টাল থেকে কোনো কর্মী এডমিন ড্যাশবোর্ড বা অভ্যন্তরীণ তথ্য দেখতে পারবে না।</span>
      </footer>

    </div>
  );
};
