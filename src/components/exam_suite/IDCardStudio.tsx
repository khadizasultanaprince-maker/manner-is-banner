// src/components/exam_suite/IDCardStudio.tsx
import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Printer,
  QrCode,
  Download,
  Users,
  ShieldCheck,
  Phone,
  Droplet,
  MapPin,
  Calendar,
  Sparkles
} from "lucide-react";
import QRCode from "qrcode";
import { StudentSecurityProfile } from "./examTypes";
import { SAMPLE_SECURITY_PROFILES } from "./examMockData";
import { studentsByClass } from "../../studentsData";

export const IDCardStudio: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentSecurityProfile[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_student_security_profiles");
      return saved ? JSON.parse(saved) : SAMPLE_SECURITY_PROFILES;
    } catch {
      return SAMPLE_SECURITY_PROFILES;
    }
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(profiles[0]?.studentId || "DLM-501");
  const [selectedClass, setSelectedClass] = useState<string>("পঞ্চম শ্রেণি");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [batchPrintMode, setBatchPrintMode] = useState<boolean>(false);

  const activeProfile = profiles.find(p => p.studentId === selectedStudentId) || profiles[0];

  // Generate real QR Code when student changes
  useEffect(() => {
    if (!activeProfile) return;
    const payload = JSON.stringify({
      id: activeProfile.studentId,
      name: activeProfile.name,
      class: activeProfile.className,
      roll: activeProfile.roll,
      guardianPhone: activeProfile.guardianPhone,
      institute: "ডি-লিকন মডেল একাডেমী"
    });

    QRCode.toDataURL(payload, {
      width: 160,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error("QR Code generation error:", err));
  }, [activeProfile]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header - No Print */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white">
                স্মার্ট ডিজিটাল আইডি কার্ড স্টুডিও (Smart Student ID Card Maker)
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                High-Security QR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              গেটের ডিজিটাল সিকিউরিটি স্ক্যানার ও রিয়েল-টাইম নোটিফিকেশনের সাথে সংযুক্ত ডিজিটাল পরিচয়পত্র
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Student Selector */}
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none"
          >
            {profiles.map(p => (
              <option key={p.studentId} value={p.studentId}>
                {p.name} (রোল: {p.roll}, {p.className})
              </option>
            ))}
          </select>

          <button
            onClick={() => setBatchPrintMode(!batchPrintMode)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              batchPrintMode
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{batchPrintMode ? "একক কার্ড মোড" : "পুরো ক্লাসের ব্যাচ প্রিন্ট (A4)"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-950/40 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>A4 আইডি কার্ড প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* SINGLE ID CARD PREVIEW (FRONT & BACK) */}
      {!batchPrintMode && activeProfile && (
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-8 print:m-0 print:p-0">
            {/* FRONT SIDE */}
            <div className="w-[320px] h-[480px] bg-gradient-to-b from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-4 shadow-2xl border-2 border-emerald-400/50 flex flex-col justify-between text-white relative overflow-hidden print:border print:border-black print:text-black print:bg-white print:shadow-none">
              {/* Pattern Background Glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Institution Header */}
              <div className="text-center border-b border-emerald-500/30 pb-2.5 z-10">
                <span className="text-[9px] font-black tracking-widest text-emerald-300 uppercase block">
                  গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত
                </span>
                <h3 className="text-base font-black text-amber-300 tracking-tight leading-snug">
                  ডি-লিকন মডেল একাডেমী
                </h3>
                <p className="text-[9.5px] text-slate-300 font-medium">
                  শুদ্ধাচার, আমলনামা ও আধুনিক আদর্শ বিদ্যাপীঠ
                </p>
                <div className="inline-block mt-1 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider">
                  শিক্ষার্থী পরিচয়পত্র (STUDENT ID CARD)
                </div>
              </div>

              {/* Student Photo & Details */}
              <div className="flex flex-col items-center text-center my-auto z-10 space-y-2.5">
                <div className="relative">
                  <img
                    src={activeProfile.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                    alt={activeProfile.name}
                    className="w-24 h-24 rounded-full object-cover border-3 border-amber-400 shadow-lg"
                  />
                  <span className="absolute bottom-0 right-0 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
                    {activeProfile.bloodGroup}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white tracking-wide">
                    {activeProfile.name}
                  </h4>
                  <p className="text-xs text-amber-300 font-bold font-mono">
                    ID: {activeProfile.studentId}
                  </p>
                </div>

                <div className="w-full bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/80 text-[11px] grid grid-cols-2 gap-1.5 text-left font-sans">
                  <div>
                    <span className="text-slate-400 text-[10px] block">শ্রেণি:</span>
                    <span className="font-bold text-white">{activeProfile.className}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">রোল নম্বর:</span>
                    <span className="font-bold text-amber-300 font-mono">{activeProfile.roll}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">অভিভাবক:</span>
                    <span className="font-bold text-white">{activeProfile.guardianName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">জরুরি ফোন:</span>
                    <span className="font-bold text-emerald-300 font-mono">{activeProfile.guardianPhone}</span>
                  </div>
                </div>
              </div>

              {/* Front Footer */}
              <div className="flex items-center justify-between text-[10px] border-t border-slate-700/80 pt-2 z-10">
                <span className="text-slate-400">মেয়াদ: {activeProfile.cardExpiry}</span>
                <span className="text-amber-400 font-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ডিজিটাল সিকিউরড</span>
                </span>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="w-[320px] h-[480px] bg-slate-900 rounded-2xl p-4 shadow-2xl border-2 border-slate-700 flex flex-col justify-between text-white relative print:border print:border-black print:text-black print:bg-white print:shadow-none">
              {/* Back Header */}
              <div className="text-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  ডিজিটাল গেট পাস ও জরুরি নির্দেশাবলী
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  কার্ডটি গেটের স্ক্যানারে প্রদর্শন করে ক্যাম্পাসে প্রবেশ ও প্রস্থান করুন
                </p>
              </div>

              {/* QR Code in Center */}
              <div className="flex flex-col items-center justify-center my-auto space-y-2">
                <div className="bg-white p-2 rounded-xl shadow-inner border-2 border-indigo-500">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Security QR Code" className="w-28 h-28" />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center bg-slate-100 text-slate-400">
                      <QrCode className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-indigo-300 tracking-wider font-bold">
                  SEC-ID: {activeProfile.studentId}
                </span>
                <p className="text-[10px] text-emerald-300 text-center font-medium max-w-[240px]">
                  ✓ স্ক্যান করামাত্রই অভিভাবকের মোবাইলে ইন/আউট নোটিফিকেশন পৌঁছে যাবে
                </p>
              </div>

              {/* Important Instructions */}
              <div className="text-[9.5px] text-slate-300 space-y-1 bg-slate-800/60 p-2 rounded-lg border border-slate-700">
                <p>১. কার্ডটি হারিয়ে গেলে অবিলম্বে বিদ্যালয় অফিসে যোগাযোগ করতে হবে।</p>
                <p>২. কার্ডটি হস্তান্তরযোগ্য নয়। শিক্ষার্থীকে সার্বক্ষণিক গলায় ঝুলিয়ে রাখতে হবে।</p>
                <p>৩. জরুরি প্রয়োজনে: <span className="font-bold text-amber-300">{activeProfile.emergencyContact}</span></p>
              </div>

              {/* Signatures & Address */}
              <div className="border-t border-slate-800 pt-2 flex items-end justify-between text-[10px]">
                <div>
                  <p className="text-[9px] text-slate-400">ঠিকানা: {activeProfile.address}</p>
                </div>
                <div className="text-center">
                  <div className="font-black text-amber-300 text-[10px] font-serif italic mb-0.5">
                    সৈয়দ মারুফ
                  </div>
                  <div className="border-t border-slate-500 pt-0.5 text-[8.5px] font-bold">
                    প্রধান শিক্ষক (স্বাক্ষর)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATCH PRINT MODE: 6 ID Cards per A4 Sheet */}
      {batchPrintMode && (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-4 sm:p-6 max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
          <div className="no-print mb-4 text-center">
            <span className="text-xs font-bold text-slate-600 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
              ✂️ A4 পেজে কার্ড কাটার দাগসহ পুরো ক্লাসের আইডি কার্ড ব্যাচ প্রিন্ট
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-4">
            {profiles.map((prof) => (
              <div
                key={prof.studentId}
                className="w-full h-[360px] border-2 border-slate-800 rounded-xl p-3 flex flex-col justify-between bg-white text-black break-inside-avoid shadow-sm"
              >
                <div className="text-center border-b border-black pb-1.5">
                  <h4 className="text-xs font-black">ডি-লিকন মডেল একাডেমী</h4>
                  <span className="text-[8px] bg-black text-white px-2 py-0.2 rounded font-bold uppercase">
                    STUDENT ID CARD
                  </span>
                </div>

                <div className="flex flex-col items-center text-center my-auto space-y-1.5">
                  <img
                    src={prof.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                    alt={prof.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-black"
                  />
                  <div>
                    <h5 className="text-xs font-black">{prof.name}</h5>
                    <p className="text-[10px] font-bold font-mono">ID: {prof.studentId}</p>
                  </div>
                  <div className="text-[10px] font-bold w-full bg-slate-100 p-1.5 rounded border border-slate-300 grid grid-cols-2 gap-1 text-left">
                    <div>শ্রেণি: {prof.className}</div>
                    <div>রোল: {prof.roll}</div>
                    <div>গ্রুপ: {prof.bloodGroup}</div>
                    <div>ফোন: {prof.guardianPhone}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] border-t border-black pt-1">
                  <span>মেয়াদ: {prof.cardExpiry}</span>
                  <span className="font-bold">প্রধান শিক্ষক</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
