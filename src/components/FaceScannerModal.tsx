import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Student, AttendanceRecord, CameraScanResult } from '../types';
import {
  compareFaceWithStudent,
  identifyStudentFromCamera,
  speakBengaliAttendance,
  speakBengaliAlreadyAttended,
  isFaceActuallyRegistered
} from '../utils/faceMatching';
import { saveAttendanceRecord, getStoredAttendance } from '../utils/storage';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import {
  analyzeVideoFrameForFace,
  extractFaceImage,
  FaceFrameAnalysis
} from '../utils/faceDetectionEngine';
import {
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  SwitchCamera,
  Sparkles,
  Volume2,
  UserCheck,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle,
  Info
} from 'lucide-react';

interface FaceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedClassId: string;
  selectedClassName: string;
  onAttendanceUpdated: (newRecord: AttendanceRecord) => void;
  soundEnabled: boolean;
  orgInfo: OrgCategoryInfo;
}

// 5 Minutes in Milliseconds
const ATTENDANCE_COOLDOWN_MS = 5 * 60 * 1000;

export const FaceScannerModal: React.FC<FaceScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  selectedClassId,
  selectedClassName,
  onAttendanceUpdated,
  soundEnabled,
  orgInfo,
}) => {
  const { terminology } = orgInfo;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map to track the timestamp of recent attendance per student to enforce 5-minute cooldown
  const recentAttendanceMap = useRef<{ [studentId: string]: { timestamp: number; timeStr: string } }>({});
  const lastAlertTimestampMap = useRef<{ [studentId: string]: number }>({});

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Auto-scanning state
  const [isProcessingMatch, setIsProcessingMatch] = useState<boolean>(false);
  const [lastMatchedStudent, setLastMatchedStudent] = useState<Student | null>(null);
  const [matchDetails, setMatchDetails] = useState<{
    time: string;
    date: string;
    confidence: number;
    snapshotUrl?: string;
    isAlreadyAttended?: boolean;
    remainingCooldownMins?: number;
  } | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [consecutiveReadyFrames, setConsecutiveReadyFrames] = useState<number>(0);

  // Real-time Face Detection Analysis State
  const [faceAnalysis, setFaceAnalysis] = useState<FaceFrameAnalysis>({
    hasFace: false,
    isReady: false,
    status: 'no_face',
    guidanceText: 'মুখমণ্ডল ফ্রেমের ভেতরে সোজা রাখুন',
    guidanceColor: 'red',
    confidence: 0,
  });

  const [scanFailureMessage, setScanFailureMessage] = useState<string | null>(null);
  const [showManualSelection, setShowManualSelection] = useState<boolean>(false);

  // Play audio chime
  const playAttendanceChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  const startCamera = async (facing: 'user' | 'environment') => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজার পারমিশন পরীক্ষা করুন।');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsProcessingMatch(false);
      setLastMatchedStudent(null);
      setMatchDetails(null);
      setScanFailureMessage(null);
      setConsecutiveReadyFrames(0);
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  // Real-time video frame face detection loop
  useEffect(() => {
    if (!isOpen || !stream || cameraError || isProcessingMatch || lastMatchedStudent || scanFailureMessage) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      if (videoRef.current && analysisCanvasRef.current && videoRef.current.readyState >= 2) {
        const result = await analyzeVideoFrameForFace(videoRef.current, analysisCanvasRef.current);
        if (isMounted) {
          setFaceAnalysis(result);
          if (result.isReady) {
            setConsecutiveReadyFrames(prev => prev + 1);
          } else {
            setConsecutiveReadyFrames(0);
          }
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, stream, cameraError, isProcessingMatch, lastMatchedStudent, scanFailureMessage]);

  // Automatic Face Match Trigger when face is steadily centered (No buttons required!)
  useEffect(() => {
    if (
      consecutiveReadyFrames >= 2 &&
      !isProcessingMatch &&
      !lastMatchedStudent &&
      !scanFailureMessage &&
      videoRef.current
    ) {
      handleAutoProcessAttendance();
    }
  }, [consecutiveReadyFrames, isProcessingMatch, lastMatchedStudent, scanFailureMessage]);

  // Helper to record attendance for a student
  const recordAttendanceForStudent = (
    matched: Student,
    snapshot: string,
    confidence: number = 0.96,
    forceNew: boolean = false
  ) => {
    const now = new Date();
    const currentTimeMs = Date.now();
    const timeStr = now.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const dateStr = now.toISOString().split('T')[0];

    // CHECK COOLDOWN (Within 2 minutes in current session)
    const lastRecordInfo = recentAttendanceMap.current[matched.id];
    const hasRecentAttendance = !forceNew && lastRecordInfo && (currentTimeMs - lastRecordInfo.timestamp < 120000);

    if (hasRecentAttendance) {
      // Already attended in this active session
      const elapsedMs = currentTimeMs - lastRecordInfo.timestamp;
      const remainingMinutes = Math.max(1, Math.ceil((120000 - elapsedMs) / 60000));

      const lastAlert = lastAlertTimestampMap.current[matched.id] || 0;
      if (currentTimeMs - lastAlert > 8000) {
        speakBengaliAlreadyAttended(matched.nameBangla);
        lastAlertTimestampMap.current[matched.id] = currentTimeMs;
      }

      setLastMatchedStudent(matched);
      setMatchDetails({
        time: lastRecordInfo.timeStr || timeStr,
        date: dateStr,
        confidence: confidence,
        snapshotUrl: snapshot,
        isAlreadyAttended: true,
        remainingCooldownMins: remainingMinutes,
      });

      let remainingSec = 3;
      setCooldownRemaining(remainingSec);
      const countdownTimer = setInterval(() => {
        remainingSec -= 1;
        setCooldownRemaining(remainingSec);
        if (remainingSec <= 0) {
          clearInterval(countdownTimer);
          setLastMatchedStudent(null);
          setMatchDetails(null);
          setIsProcessingMatch(false);
          setConsecutiveReadyFrames(0);
        }
      }, 1000);

      return;
    }

    // NEW ATTENDANCE RECORDING
    recentAttendanceMap.current[matched.id] = {
      timestamp: currentTimeMs,
      timeStr: timeStr,
    };
    lastAlertTimestampMap.current[matched.id] = currentTimeMs;

    // 1. Play sound chime
    playAttendanceChime();

    // 2. Speak aloud in Bengali: "[নাম]-এর হাজিরা সফলভাবে সম্পন্ন হয়েছে"
    speakBengaliAttendance(matched.nameBangla);

    // 3. Save attendance record to Firestore & Local storage
    const record = saveAttendanceRecord({
      studentId: matched.id,
      studentName: matched.nameBangla,
      roll: matched.roll,
      classId: matched.classId || selectedClassId,
      className: matched.className || selectedClassName,
      date: dateStr,
      time: timeStr,
      status: 'Present',
      method: 'Face AI',
      confidenceScore: confidence,
      snapshotUrl: snapshot,
      verifiedByAI: true,
      notes: `স্বয়ংক্রিয় AI ফেস স্ক্যান সফল (কনফিডেন্স: ${Math.round(confidence * 100)}%)`,
    });

    onAttendanceUpdated(record);

    // 4. Show the visual recognition card on screen
    setLastMatchedStudent(matched);
    setMatchDetails({
      time: timeStr,
      date: dateStr,
      confidence: confidence,
      snapshotUrl: snapshot,
      isAlreadyAttended: false,
    });

    // 5. Automatic countdown for continuous kiosk scanning (next person after 3.5 seconds)
    let remainingSec = 4;
    setCooldownRemaining(remainingSec);
    const countdownTimer = setInterval(() => {
      remainingSec -= 1;
      setCooldownRemaining(remainingSec);
      if (remainingSec <= 0) {
        clearInterval(countdownTimer);
        setLastMatchedStudent(null);
        setMatchDetails(null);
        setIsProcessingMatch(false);
        setConsecutiveReadyFrames(0);
      }
    }, 1000);
  };

  const handleAutoProcessAttendance = async () => {
    if (!videoRef.current || isProcessingMatch) return;

    setIsProcessingMatch(true);
    setScanFailureMessage(null);

    try {
      // Extract high-quality centered face snapshot
      const snapshot = extractFaceImage(
        videoRef.current,
        cameraFacing,
        faceAnalysis.boundingBox
      );

      const candidateStudents = students.length > 0 ? students : [];

      let matchResult: CameraScanResult;
      
      if (candidateStudents.length > 0) {
        matchResult = await identifyStudentFromCamera(candidateStudents, snapshot);
      } else {
        matchResult = {
          matchedStudent: null,
          confidence: 0,
          status: 'Absent',
          message: 'ডাটাবেজে কোনো সদস্য পাওয়া যায়নি। প্রথমে সদস্য নিবন্ধন করুন।',
          capturedSnapshot: snapshot,
        };
      }

      if (matchResult.matchedStudent) {
        recordAttendanceForStudent(matchResult.matchedStudent, snapshot, matchResult.confidence || 0.96);
      } else {
        // No match found - show on-screen message and pause for 2.5s
        setScanFailureMessage(matchResult.message || 'ডাটাবেজের নিবন্ধিত ছবির সাথে ফেস মেলেনি');
        setTimeout(() => {
          setScanFailureMessage(null);
          setIsProcessingMatch(false);
          setConsecutiveReadyFrames(0);
        }, 2500);
      }
    } catch (err) {
      console.error('Error during auto face attendance:', err);
      setIsProcessingMatch(false);
      setConsecutiveReadyFrames(0);
    }
  };

  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* Hidden Analysis Canvas */}
      <canvas ref={analysisCanvasRef} className="hidden" />

      {/* Top Floating Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleToggleFacing}
            title="ক্যামেরা পরিবর্তন (Front / Back)"
            className="p-3 rounded-full bg-slate-950/70 backdrop-blur-md hover:bg-slate-900 text-slate-200 hover:text-white border border-white/10 transition cursor-pointer active:scale-95 shadow-lg"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>

          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>অটোমেটিক ফেস স্ক্যানার</span>
            {selectedClassName && (
              <span className="text-slate-400 border-l border-slate-700 pl-1.5 ml-1">
                {selectedClassName}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          title="বন্ধ করুন"
          className="p-3 rounded-full bg-slate-950/70 backdrop-blur-md hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-white/10 transition cursor-pointer active:scale-95 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Fullscreen Video Viewport */}
      <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
        
        {cameraError ? (
          <div className="max-w-sm p-6 bg-slate-950/90 rounded-3xl border border-rose-500/50 text-center space-y-4 m-4 z-30">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-rose-200">{cameraError}</p>
            <button
              type="button"
              onClick={() => startCamera(cameraFacing)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg cursor-pointer"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : (
          <>
            {/* Live Video Feed spanning entire screen */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                cameraFacing === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Dark Vignette Overlay for aesthetic biometric focus */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/25 to-black/75 pointer-events-none" />

            {/* Biometric Reticle & Real-time Live Guidance Overlay */}
            {!lastMatchedStudent && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                
                {/* Live Real-time Directional Guidance Badge */}
                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div
                    className={`px-4 py-2 rounded-full backdrop-blur-md text-xs sm:text-sm font-black border shadow-2xl transition-all duration-300 flex items-center space-x-2 ${
                      isProcessingMatch
                        ? 'bg-teal-950/95 border-teal-400 text-teal-300 shadow-[0_0_30px_rgba(20,184,166,0.6)] scale-105'
                        : faceAnalysis.guidanceColor === 'emerald'
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105'
                        : faceAnalysis.guidanceColor === 'amber'
                        ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        : 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        isProcessingMatch
                          ? 'bg-teal-400 shadow-[0_0_10px_#2dd4bf]'
                          : faceAnalysis.guidanceColor === 'emerald'
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : faceAnalysis.guidanceColor === 'amber'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span>
                      {isProcessingMatch
                        ? '⚡ মুখমণ্ডল স্ক্যান ও উপস্থিতি যাচাই চলছে...'
                        : faceAnalysis.guidanceText}
                    </span>
                  </div>
                </div>

                {/* Oval Face Guide Reticle with dynamic border colors & laser scan */}
                <div
                  className={`relative w-64 h-80 sm:w-72 sm:h-96 rounded-[50%] transition-all duration-300 flex flex-col items-center justify-between p-6 ${
                    isProcessingMatch || faceAnalysis.guidanceColor === 'emerald'
                      ? 'border-4 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.65)]'
                      : faceAnalysis.guidanceColor === 'amber'
                      ? 'border-3 border-dashed border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.4)]'
                      : 'border-3 border-dashed border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                  }`}
                >
                  {/* 4 Corner Targeting Brackets for biometric lock look */}
                  <div className={`absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl transition-colors ${
                    faceAnalysis.guidanceColor === 'emerald' || isProcessingMatch ? 'border-emerald-400' : 'border-slate-500/40'
                  }`} />
                  <div className={`absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl transition-colors ${
                    faceAnalysis.guidanceColor === 'emerald' || isProcessingMatch ? 'border-emerald-400' : 'border-slate-500/40'
                  }`} />
                  <div className={`absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl transition-colors ${
                    faceAnalysis.guidanceColor === 'emerald' || isProcessingMatch ? 'border-emerald-400' : 'border-slate-500/40'
                  }`} />
                  <div className={`absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 rounded-br-xl transition-colors ${
                    faceAnalysis.guidanceColor === 'emerald' || isProcessingMatch ? 'border-emerald-400' : 'border-slate-500/40'
                  }`} />

                  {/* Animated Laser scanning beam */}
                  <div className="w-full flex-1 flex items-center justify-center">
                    <div
                      className={`w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-300 ${
                        isProcessingMatch
                          ? 'text-teal-400 shadow-[0_0_25px_#2dd4bf] animate-bounce'
                          : faceAnalysis.guidanceColor === 'emerald'
                          ? 'text-emerald-400 shadow-[0_0_20px_#10b981] animate-pulse'
                          : faceAnalysis.guidanceColor === 'amber'
                          ? 'text-amber-400 shadow-[0_0_15px_#f59e0b]'
                          : 'text-rose-500 shadow-[0_0_15px_#f43f5e]'
                      }`}
                    />
                  </div>

                  {/* Lock Indicator */}
                  {faceAnalysis.isReady && (
                    <div className="px-3.5 py-1 bg-emerald-950/90 backdrop-blur-md rounded-full border border-emerald-400 text-emerald-300 text-[11px] font-black shadow-lg animate-bounce flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      <span>ফেস লক — স্বয়ংক্রিয় স্ক্যানিং...</span>
                    </div>
                  )}

                </div>

                {/* Subtitle guidance & Quick Manual Select trigger */}
                <div className="mt-5 text-center space-y-2 pointer-events-auto">
                  <p className="text-slate-300 text-xs font-semibold drop-shadow-md">
                    কোনো বাটন চাপার প্রয়োজন নেই — ক্যামেরার সামনে দাঁড়ালেই স্বয়ংক্রিয়ভাবে হাজিরা গ্রহণ হবে
                  </p>
                  
                  {/* Manual fallback button */}
                  {students.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowManualSelection(true)}
                      className="px-4 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-[11px] font-bold rounded-full border border-slate-700 backdrop-blur-md transition cursor-pointer flex items-center space-x-1.5 mx-auto"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>তালিকা থেকে সদস্য বেছে নিন</span>
                    </button>
                  )}
                </div>

              </div>
            )}

            {/* SCAN FAILURE OR UNRECOGNIZED ALERT OVERLAY */}
            {scanFailureMessage && !lastMatchedStudent && (
              <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
                <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-white">উপস্থিতি গৃহীত হয়নি</h3>
                  <p className="text-xs text-amber-200">{scanFailureMessage}</p>
                  
                  {students.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setScanFailureMessage(null);
                        setShowManualSelection(true);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>তালিকা থেকে সদস্য নির্বাচন করে হাজিরা দিন</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MANUAL MEMBER SELECTION DRAWER / MODAL OVERLAY */}
            {showManualSelection && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 pointer-events-auto">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold text-sm text-white">সদস্য নির্বাচন করে হাজিরা নিন</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowManualSelection(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-y-auto py-3 space-y-2 flex-1 no-scrollbar">
                    {students.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">কোনো সদস্য পাওয়া যায়নি।</p>
                    ) : (
                      students.map(std => (
                        <button
                          key={std.id}
                          type="button"
                          onClick={() => {
                            setShowManualSelection(false);
                            const snapshot = videoRef.current
                              ? extractFaceImage(videoRef.current, cameraFacing, faceAnalysis.boundingBox)
                              : std.faceImage || std.photoUrl || '';
                            recordAttendanceForStudent(std, snapshot, 0.99, true);
                          }}
                          className="w-full p-2.5 rounded-2xl bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-500/60 text-left flex items-center justify-between transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center overflow-hidden shrink-0 border border-slate-600">
                              {std.faceImage || std.photoUrl ? (
                                <img src={std.faceImage || std.photoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                std.nameBangla.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-100 group-hover:text-emerald-300">
                                {std.nameBangla}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {terminology.idLabel}: {std.roll} {std.className ? `• ${std.className}` : ''}
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-600/30 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition">
                            হাজিরা দিন
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* INSTANT RECOGNITION POPUP OVERLAY ON MATCH */}
            {lastMatchedStudent && matchDetails && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
                <div
                  className={`max-w-md w-full rounded-3xl border-2 p-6 text-center text-white relative overflow-hidden transition-all ${
                    matchDetails.isAlreadyAttended
                      ? 'bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 border-amber-400/90 shadow-[0_0_80px_rgba(245,158,11,0.35)]'
                      : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-400 shadow-[0_0_80px_rgba(16,185,129,0.45)]'
                  }`}
                >
                  
                  {/* Decorative Glow */}
                  <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                    matchDetails.isAlreadyAttended ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                  }`} />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Status Badge */}
                  {matchDetails.isAlreadyAttended ? (
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black mb-5 shadow-lg animate-pulse">
                      <Info className="w-4 h-4 text-amber-400" />
                      <span>আপনার হাজিরা ইতিমধ্যে গ্রহণ করা হয়েছে</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black mb-5 shadow-lg animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>উপস্থিতি সফলভাবে রেকর্ড হয়েছে</span>
                    </div>
                  )}

                  {/* Member Photo Avatar */}
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <img
                      src={matchDetails.snapshotUrl || lastMatchedStudent.faceImage || lastMatchedStudent.photoUrl}
                      alt={lastMatchedStudent.nameBangla}
                      className={`w-28 h-28 rounded-full object-cover border-4 shadow-2xl ring-4 ${
                        matchDetails.isAlreadyAttended
                          ? 'border-amber-400 ring-amber-500/30'
                          : 'border-emerald-400 ring-emerald-500/30'
                      }`}
                    />
                    <div
                      className={`absolute bottom-0 right-0 p-1.5 rounded-full shadow-md ${
                        matchDetails.isAlreadyAttended ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5 fill-slate-950 text-current" />
                    </div>
                  </div>

                  {/* Member Bangla Name */}
                  <h3 className="text-2xl font-black text-white tracking-wide mb-1">
                    {lastMatchedStudent.nameBangla}
                  </h3>
                  
                  <p className={`text-sm font-semibold mb-4 ${matchDetails.isAlreadyAttended ? 'text-amber-300' : 'text-emerald-400'}`}>
                    {terminology.idLabel}: {lastMatchedStudent.roll}
                    {lastMatchedStudent.className && ` • ${lastMatchedStudent.className}`}
                  </p>

                  {/* Attendance Info Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs mb-4">
                    <div className="flex items-center space-x-2 text-left p-1.5">
                      <Clock className={`w-4 h-4 shrink-0 ${matchDetails.isAlreadyAttended ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <div>
                        <div className="text-[10px] text-slate-400">হাজিরার সময়</div>
                        <div className="font-bold text-slate-200">{matchDetails.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-left p-1.5">
                      <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">স্ট্যাটাস</div>
                        <div className={`font-bold ${matchDetails.isAlreadyAttended ? 'text-amber-300' : 'text-emerald-400'}`}>
                          {matchDetails.isAlreadyAttended ? 'ইতিমধ্যে উপস্থিত' : 'উপস্থিত (Present)'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bengali Voice Announcement Notice Bar */}
                  <div
                    className={`flex items-center justify-center space-x-2 text-xs font-bold py-2.5 px-3 rounded-xl border mb-4 ${
                      matchDetails.isAlreadyAttended
                        ? 'bg-amber-950/40 text-amber-200 border-amber-800/60'
                        : 'bg-slate-800/60 text-slate-200 border-slate-700/60'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 animate-pulse shrink-0 ${matchDetails.isAlreadyAttended ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span>
                      {matchDetails.isAlreadyAttended
                        ? `ভয়েস: "${lastMatchedStudent.nameBangla}, আপনার হাজিরা ইতিমধ্যে গ্রহণ করা হয়েছে"`
                        : `ভয়েস: "${lastMatchedStudent.nameBangla}-এর হাজিরা সফলভাবে সম্পন্ন হয়েছে"`}
                    </span>
                  </div>

                  {/* Cooldown notice & instant force punch button */}
                  {matchDetails.isAlreadyAttended && (
                    <div className="space-y-2 mb-4">
                      <div className="text-[11px] font-semibold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                        ⏱️ একবার হাজিরা দেওয়ার পর ২ মিনিটের মধ্যে স্বয়ংক্রিয় এন্ট্রি সংরক্ষিত থাকে।
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          recordAttendanceForStudent(
                            lastMatchedStudent,
                            matchDetails.snapshotUrl || '',
                            matchDetails.confidence || 0.98,
                            true
                          );
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>পুনরায় নিশ্চিত করুন (Force Record)</span>
                      </button>
                    </div>
                  )}

                  {/* Kiosk Next Person Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                      <span>পরবর্তী স্ক্যানের জন্য প্রস্তুত হচ্ছে...</span>
                      <span className={`${matchDetails.isAlreadyAttended ? 'text-amber-400' : 'text-emerald-400'} font-bold`}>
                        {cooldownRemaining}s
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                          matchDetails.isAlreadyAttended
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${(cooldownRemaining / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

          </>
        )}

      </div>

    </div>
  );
};
