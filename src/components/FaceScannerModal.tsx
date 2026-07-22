import React, { useRef, useState, useEffect } from 'react';
import { Student, AttendanceRecord, CameraScanResult } from '../types';
import { compareFaceWithStudent, identifyStudentFromCamera } from '../utils/faceMatching';
import { saveAttendanceRecord } from '../utils/storage';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { Camera, X, CheckCircle, AlertTriangle, RefreshCw, UserCheck, Sparkles, Volume2 } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('auto');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<CameraScanResult | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio fallback
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    setVerificationSuccess(false);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
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
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleScanNow = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    setScanResult(null);
    setVerificationSuccess(false);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedSnapshot = canvas.toDataURL('image/jpeg', 0.85);

    setTimeout(async () => {
      let result: CameraScanResult;

      if (selectedStudentId !== 'auto') {
        const targetStudent = students.find(s => s.id === selectedStudentId);
        if (targetStudent) {
          result = await compareFaceWithStudent(targetStudent, capturedSnapshot);
        } else {
          result = {
            matchedStudent: null,
            confidence: 0,
            status: 'Absent',
            message: `${terminology.memberLabel} নির্ধারণ করা যায়নি।`,
            capturedSnapshot,
          };
        }
      } else {
        result = await identifyStudentFromCamera(students, capturedSnapshot);
      }

      setScanResult(result);
      setIsScanning(false);

      if (result.matchedStudent) {
        setVerificationSuccess(true);
        playBeep();

        const now = new Date();
        const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toISOString().split('T')[0];

        const record = saveAttendanceRecord({
          studentId: result.matchedStudent.id,
          studentName: result.matchedStudent.nameBangla,
          roll: result.matchedStudent.roll,
          classId: selectedClassId,
          className: selectedClassName,
          date: dateStr,
          time: timeStr,
          status: result.status,
          method: 'Face AI',
          confidenceScore: result.confidence,
          snapshotUrl: capturedSnapshot,
          verifiedByAI: true,
          notes: `AI ফেস ম্যাচিং সফল (কনফিডেন্স স্কোর: ${Math.round(result.confidence * 100)}%)`,
        });

        onAttendanceUpdated(record);
      }
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full text-white shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>AI বায়োমেট্রিক ফেস স্ক্যানার</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {selectedClassName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {terminology.scannerHint}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Target Member Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">
              চিহ্নিতকরণের ধরন:
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="bg-slate-900 text-xs font-bold text-emerald-300 border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="auto">🤖 অটোমেটিক AI সনাক্তকরণ (সবাই)</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  👤 {s.nameBangla} ({terminology.idLabel}: {s.roll})
                </option>
              ))}
            </select>
          </div>

          {/* Camera Viewport Container */}
          <div className="relative aspect-video rounded-3xl bg-slate-950 overflow-hidden border-2 border-slate-800 flex items-center justify-center">
            
            {cameraError ? (
              <div className="p-6 text-center space-y-2 text-rose-400">
                <AlertTriangle className="w-10 h-10 mx-auto" />
                <p className="text-xs">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  পুনরায় চেষ্টা করুন
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Face Alignment Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className={`w-52 h-64 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                    verificationSuccess
                      ? 'border-emerald-400 bg-emerald-500/10 scale-105'
                      : isScanning
                      ? 'border-amber-400 bg-amber-500/10 animate-pulse'
                      : 'border-emerald-500/60'
                  }`}>
                    <div className="text-[11px] font-bold text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                      {isScanning ? 'স্ক্যানিং চলছে...' : verificationSuccess ? 'ম্যাচ পাওয়া গেছে!' : 'মুখমণ্ডল রাখুন'}
                    </div>
                  </div>
                </div>

                {/* Scanner Overlay Beam */}
                {isScanning && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-pulse pointer-events-none" />
                )}
              </>
            )}

          </div>

          {/* Scan Results Display */}
          {scanResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-300 ${
              scanResult.matchedStudent
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
            }`}>
              {scanResult.matchedStudent ? (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-emerald-500 shrink-0">
                    <img src={scanResult.matchedStudent.photoUrl} alt="Matched" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{scanResult.matchedStudent.nameBangla}</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-900/60 px-2 py-0.5 rounded-md text-[10px]">
                        স্কোর: {Math.round(scanResult.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">
                      {terminology.idLabel}: {scanResult.matchedStudent.roll} | স্ট্যাটাস: <strong className="text-emerald-400">উপস্থিতি সফল!</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{scanResult.message}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
          >
            বন্ধ করুন
          </button>

          <button
            onClick={handleScanNow}
            disabled={isScanning || !!cameraError}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-bold text-xs text-white rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center space-x-2"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>স্ক্যান ও উপস্থিতি রেকর্ড করুন</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
