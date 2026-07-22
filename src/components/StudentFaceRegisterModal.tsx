import React, { useRef, useState, useEffect } from 'react';
import { Student, ClassSubject } from '../types';
import { addStudent } from '../utils/storage';
import { OrgCategoryInfo } from '../utils/organizationConfig';
import { UserPlus, Camera, Upload, X, CheckCircle, RefreshCw } from 'lucide-react';

interface StudentFaceRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassSubject[];
  selectedClassId: string;
  onStudentAdded: (student: Student) => void;
  orgInfo: OrgCategoryInfo;
}

export const StudentFaceRegisterModal: React.FC<StudentFaceRegisterModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  onStudentAdded,
  orgInfo,
}) => {
  const { terminology } = orgInfo;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [nameBangla, setNameBangla] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [roll, setRoll] = useState('');
  const [classId, setClassId] = useState(selectedClassId);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [email, setEmail] = useState('');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    setClassId(selectedClassId);
  }, [selectedClassId]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert("ক্যামেরা অন করা যায়নি। ম্যানুয়াল ছবি আপলোড করুন।");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhotoUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBangla || !roll) {
      alert(`অনুগ্রহ করে নাম ও ${terminology.idLabel} লিখুন।`);
      return;
    }

    const currentClass = classes.find(c => c.id === classId);
    const defaultPhoto = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%233b82f6"/><circle cx="100" cy="80" r="40" fill="%23ffffff"/><path d="M40 180 C40 135 160 135 160 180 Z" fill="%231e293b"/></svg>`;

    const newStudent = addStudent({
      name: nameEnglish || nameBangla,
      nameBangla,
      roll,
      classId,
      className: currentClass ? currentClass.classNameBangla : '',
      photoUrl: capturedPhotoUrl || defaultPhoto,
      faceRegistered: true,
      gender,
      guardianPhone,
      email,
    });

    onStudentAdded(newStudent);
    
    // Reset
    setNameBangla('');
    setNameEnglish('');
    setRoll('');
    setGuardianPhone('');
    setEmail('');
    setCapturedPhotoUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">{terminology.registerActionText}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          
          {/* Photo Capture Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center space-y-3">
            <div className="w-28 h-28 rounded-2xl bg-slate-200 overflow-hidden border-2 border-slate-300 relative flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : capturedPhotoUrl ? (
                <img src={capturedPhotoUrl} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <UserPlus className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex items-center space-x-2">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center space-x-1 hover:bg-emerald-700"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ক্যামেরা খুলুন</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl flex items-center space-x-1 hover:bg-teal-700"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ছবি তুলুন</span>
                </button>
              )}

              <label className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-300 flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5" />
                <span>আপলোড</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-slate-400">ফেস বায়োমেট্রিক স্ক্যানিংয়ের জন্য স্পষ্ট মুখের ছবি প্রয়োজন</p>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-slate-800">{terminology.memberLabel}-এর নাম (বাংলা) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: রফিকুল ইসলাম"
                value={nameBangla}
                onChange={e => setNameBangla(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800">{terminology.idLabel} / আইডি নম্বর *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ১০১ বা EMP-101"
                value={roll}
                onChange={e => setRoll(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800">{terminology.groupLabel} *</label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.classNameBangla} ({c.subjectName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800">লিঙ্গ (Gender)</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="Male">পুরুষ (Male)</option>
                <option value="Female">নারী (Female)</option>
                <option value="Other">অন্যান্য (Other)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800">{terminology.contactLabel}</label>
              <input
                type="tel"
                placeholder="017xxxxxxxx"
                value={guardianPhone}
                onChange={e => setGuardianPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
              <input
                type="email"
                placeholder="member@org.bd"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              সংরক্ষণ করুন
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
