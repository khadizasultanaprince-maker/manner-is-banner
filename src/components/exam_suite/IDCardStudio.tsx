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
  Sparkles,
  Plus,
  Edit3,
  Save,
  X,
  UserPlus,
  RefreshCw,
  Camera,
  CheckCircle2,
  Heart
} from "lucide-react";
import QRCode from "qrcode";
import { StudentSecurityProfile } from "./examTypes";
import { SAMPLE_SECURITY_PROFILES } from "./examMockData";
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [batchPrintMode, setBatchPrintMode] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string>("");

  // Editing profile state
  const [formData, setFormData] = useState<StudentSecurityProfile>({
    studentId: "DLM-506",
    indexNumber: "DLM-2026-0506",
    name: "",
    nameEnglish: "",
    className: "পঞ্চম শ্রেণি",
    roll: "০৬",
    bloodGroup: "B+",
    guardianName: "",
    guardianPhone: "",
    emergencyContact: "",
    address: "ঢাকা, বাংলাদেশ",
    cardExpiry: "৩১ ডিসেম্বর ২০২৬",
    photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    fatherPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    motherPhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    dateOfBirth: "০১ জানুয়ারি ২০১৫",
    gender: "ছাত্র"
  });

  const activeProfile = profiles.find(p => p.studentId === selectedStudentId) || profiles[0];

  // Helper to generate Unique Index Number
  const generateUniqueIndex = (sClass: string, sRoll: string) => {
    const year = "2026";
    let classCode = "05";
    if (sClass.includes("নার্সারি")) classCode = "00";
    else if (sClass.includes("প্রথম")) classCode = "01";
    else if (sClass.includes("দ্বিতীয়")) classCode = "02";
    else if (sClass.includes("তৃতীয়")) classCode = "03";
    else if (sClass.includes("চতুর্থ")) classCode = "04";
    else if (sClass.includes("পঞ্চম")) classCode = "05";

    const cleanRoll = sRoll.replace(/[^\d]/g, "") || "01";
    const paddedRoll = cleanRoll.padStart(3, "0");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `DLM-${year}-${classCode}${paddedRoll}-${randomSuffix}`;
  };

  // Open modal in Add mode
  const handleOpenAddModal = () => {
    const nextRoll = (profiles.length + 1).toString().padStart(2, "০");
    const newId = `DLM-5${(profiles.length + 1).toString().padStart(2, "0")}`;
    const newIndex = generateUniqueIndex("পঞ্চম শ্রেণি", nextRoll);

    setFormData({
      studentId: newId,
      indexNumber: newIndex,
      name: "",
      nameEnglish: "",
      className: "পঞ্চম শ্রেণি",
      roll: nextRoll,
      bloodGroup: "B+",
      guardianName: "",
      guardianPhone: "",
      emergencyContact: "",
      address: "ঢাকা, বাংলাদেশ",
      cardExpiry: "৩১ ডিসেম্বর ২০২৬",
      photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
      fatherName: "",
      fatherOccupation: "",
      fatherPhone: "",
      fatherPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      motherName: "",
      motherOccupation: "",
      motherPhone: "",
      motherPhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      dateOfBirth: "০১ জানুয়ারি ২০১৫",
      gender: "ছাত্র"
    });
    setModalMode("add");
    setIsProfileModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = () => {
    if (!activeProfile) return;
    setFormData({ ...activeProfile });
    setModalMode("edit");
    setIsProfileModalOpen(true);
  };

  // Save student profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("দয়া করে শিক্ষার্থীর নাম লিখুন।");
      return;
    }

    let updatedList: StudentSecurityProfile[] = [];
    if (modalMode === "add") {
      updatedList = [...profiles, formData];
    } else {
      updatedList = profiles.map(p => p.studentId === formData.studentId ? formData : p);
    }

    setProfiles(updatedList);
    setSelectedStudentId(formData.studentId);
    localStorage.setItem("dlikon_student_security_profiles", JSON.stringify(updatedList));

    // Save to Firestore
    try {
      await setDoc(doc(db, "student_security_profiles", formData.studentId), {
        ...formData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore sync fallback to localStorage:", err);
    }

    setIsProfileModalOpen(false);
    setSaveSuccessNotice(`✅ শিক্ষার্থী '${formData.name}'-এর প্রোফাইল ও ইউনিক ইনডেক্স (${formData.indexNumber}) সফলভাবে সংরক্ষিত হয়েছে!`);
    setTimeout(() => setSaveSuccessNotice(""), 6000);
  };

  // Handle image upload helper
  const handleImageUpload = (field: "photoUrl" | "fatherPhotoUrl" | "motherPhotoUrl", file: File) => {
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setFormData(prev => ({
          ...prev,
          [field]: uploadEvent.target!.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate real QR Code when student changes
  useEffect(() => {
    if (!activeProfile) return;
    const payload = JSON.stringify({
      id: activeProfile.studentId,
      indexNo: activeProfile.indexNumber || activeProfile.studentId,
      name: activeProfile.name,
      class: activeProfile.className,
      roll: activeProfile.roll,
      father: activeProfile.fatherName || activeProfile.guardianName,
      mother: activeProfile.motherName || "",
      guardianPhone: activeProfile.guardianPhone,
      institute: "ডি-লিকন মডেল একাডেমী"
    });

    QRCode.toDataURL(payload, {
      width: 170,
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
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white">
                স্মার্ট ডিজিটাল আইডি কার্ড স্টুডিও ও শিক্ষার্থী ডাটাবেজ
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                Unique Index & High-Security QR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              শিক্ষার্থী, পিতা ও মাতার ছবি, রক্তের গ্রুপ এবং স্বয়ংক্রিয় ইউনিক ইনডেক্স নম্বর সংযুক্ত আধুনিক ডিজিটাল পরিচয়পত্র
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Student Selector */}
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            {profiles.map(p => (
              <option key={p.studentId} value={p.studentId}>
                {p.name} (রোল: {p.roll}, {p.indexNumber || p.studentId})
              </option>
            ))}
          </select>

          {/* Add / Edit Profile Buttons */}
          <button
            onClick={handleOpenEditModal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            title="বর্তমান শিক্ষার্থীর সকল তথ্য ও পিতা-মাতার ছবি সম্পাদনা করুন"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
            <span>প্রোফাইল এডিট</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            title="নতুন শিক্ষার্থী ও পিতা-মাতার ছবিসহ ডাটাবেজে যুক্ত করুন"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>নতুন শিক্ষার্থী যুক্ত করুন</span>
          </button>

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

      {/* Save Success Notice */}
      {saveSuccessNotice && (
        <div className="no-print bg-emerald-950 border-2 border-emerald-400 p-4 rounded-2xl text-white flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{saveSuccessNotice}</span>
        </div>
      )}

      {/* SINGLE ID CARD PREVIEW (FRONT & BACK) */}
      {!batchPrintMode && activeProfile && (
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-8 print:m-0 print:p-0">
            {/* FRONT SIDE */}
            <div className="w-[330px] h-[500px] bg-gradient-to-b from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-4 shadow-2xl border-2 border-emerald-400/50 flex flex-col justify-between text-white relative overflow-hidden print:border print:border-black print:text-black print:bg-white print:shadow-none">
              {/* Pattern Background Glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Institution Header */}
              <div className="text-center border-b border-emerald-500/30 pb-2 z-10">
                <span className="text-[9px] font-black tracking-widest text-emerald-300 uppercase block">
                  গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত
                </span>
                <h3 className="text-base font-black text-amber-300 tracking-tight leading-snug">
                  ডি-লিকন মডেল একাডেমী
                </h3>
                <p className="text-[9px] text-slate-300 font-medium">
                  শুদ্ধাচার, আমলনামা ও আধুনিক আদর্শ বিদ্যাপীঠ
                </p>
                <div className="inline-block mt-1 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  শিক্ষার্থী পরিচয়পত্র (STUDENT ID CARD)
                </div>
              </div>

              {/* Student Photo & Details */}
              <div className="flex flex-col items-center text-center my-auto z-10 space-y-2">
                <div className="relative">
                  <img
                    src={activeProfile.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                    alt={activeProfile.name}
                    className="w-22 h-22 rounded-full object-cover border-3 border-amber-400 shadow-lg"
                  />
                  <span className="absolute bottom-0 right-0 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
                    {activeProfile.bloodGroup}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white tracking-wide">
                    {activeProfile.name}
                  </h4>
                  {activeProfile.nameEnglish && (
                    <p className="text-[11px] text-slate-300 font-medium">
                      {activeProfile.nameEnglish}
                    </p>
                  )}
                  {/* Unique Index Number Badge */}
                  <div className="mt-1 inline-flex items-center gap-1 bg-indigo-950/80 border border-indigo-400/50 px-2.5 py-0.5 rounded-full">
                    <span className="text-[9px] text-indigo-300 font-bold uppercase">ইউনিক ইনডেক্স:</span>
                    <span className="text-[10px] text-amber-300 font-black font-mono">
                      {activeProfile.indexNumber || activeProfile.studentId}
                    </span>
                  </div>
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
                    <span className="text-slate-400 text-[10px] block">পিতা/অভিভাবক:</span>
                    <span className="font-bold text-white truncate block">{activeProfile.fatherName || activeProfile.guardianName}</span>
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
            <div className="w-[330px] h-[500px] bg-slate-900 rounded-2xl p-4 shadow-2xl border-2 border-slate-700 flex flex-col justify-between text-white relative print:border print:border-black print:text-black print:bg-white print:shadow-none">
              {/* Back Header */}
              <div className="text-center border-b border-slate-800 pb-1.5">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  ডিজিটাল গেট পাস ও জরুরি নির্দেশাবলী
                </h4>
                <p className="text-[9.5px] text-slate-400 mt-0.5">
                  কার্ডটি গেটের স্ক্যানারে প্রদর্শন করে ক্যাম্পাসে প্রবেশ ও প্রস্থান করুন
                </p>
              </div>

              {/* QR Code in Center */}
              <div className="flex flex-col items-center justify-center my-1 space-y-1.5">
                <div className="bg-white p-2 rounded-xl shadow-inner border-2 border-indigo-500">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Security QR Code" className="w-24 h-24" />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-slate-100 text-slate-400">
                      <QrCode className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-indigo-300 tracking-wider font-bold">
                  <span>SEC-ID: {activeProfile.studentId}</span>
                  <span>•</span>
                  <span className="text-amber-300">ইনডেক্স: {activeProfile.indexNumber || activeProfile.studentId}</span>
                </div>
                <p className="text-[9px] text-emerald-300 text-center font-medium max-w-[260px] leading-tight">
                  ✓ স্ক্যান করামাত্রই অভিভাবকের মোবাইলে ইন/আউট নোটিফিকেশন ও মিষ্টি ভয়েস বার্তা যাবে
                </p>
              </div>

              {/* PARENTS INFORMATION & PHOTOS (Explicit User Request) */}
              <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700 text-[9px] space-y-1.5">
                <span className="text-amber-300 font-bold block text-[9.5px] flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>পিতা ও মাতার পরিচিতি:</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {/* Father */}
                  <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-700/60">
                    <img
                      src={activeProfile.fatherPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                      alt="পিতা"
                      className="w-7 h-7 rounded-full object-cover border border-amber-400 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-[8px] text-slate-400 block">পিতা:</span>
                      <span className="font-bold text-white block truncate">{activeProfile.fatherName || activeProfile.guardianName}</span>
                      <span className="text-[7.5px] text-slate-400 block truncate">{activeProfile.fatherOccupation || 'অভিভাবক'}</span>
                    </div>
                  </div>
                  {/* Mother */}
                  <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-700/60">
                    <img
                      src={activeProfile.motherPhotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"}
                      alt="মাতা"
                      className="w-7 h-7 rounded-full object-cover border border-emerald-400 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-[8px] text-slate-400 block">মাতা:</span>
                      <span className="font-bold text-white block truncate">{activeProfile.motherName || 'মোসাম্মাৎ খাদিজা বেগম'}</span>
                      <span className="text-[7.5px] text-slate-400 block truncate">{activeProfile.motherOccupation || 'শিক্ষাবিদ'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Instructions */}
              <div className="text-[9px] text-slate-300 space-y-0.5 bg-slate-800/40 p-1.5 rounded-lg border border-slate-700">
                <p>১. কার্ডটি হারিয়ে গেলে অবিলম্বে বিদ্যালয় অফিসে যোগাযোগ করতে হবে।</p>
                <p>২. কার্ডটি হস্তান্তরযোগ্য নয়। শিক্ষার্থীকে সার্বক্ষণিক গলায় ঝুলিয়ে রাখতে হবে।</p>
                <p>৩. জরুরি প্রয়োজনে: <span className="font-bold text-amber-300">{activeProfile.emergencyContact}</span></p>
              </div>

              {/* Signatures & Address */}
              <div className="border-t border-slate-800 pt-1.5 flex items-end justify-between text-[9px]">
                <div className="max-w-[180px] truncate">
                  <p className="text-[8.5px] text-slate-400 truncate">ঠিকানা: {activeProfile.address}</p>
                </div>
                <div className="text-center">
                  <div className="font-black text-amber-300 text-[10px] font-serif italic mb-0.5">
                    সৈয়দ মারুফ
                  </div>
                  <div className="border-t border-slate-500 pt-0.5 text-[8px] font-bold">
                    প্রধান শিক্ষক (স্বাক্ষর)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPREHENSIVE STUDENT PROFILE & UNIQUE INDEX GENERATOR */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn no-print">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white max-w-3xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {modalMode === "add" ? "নতুন শিক্ষার্থী ডাটাবেজে যুক্ত করুন" : "শিক্ষার্থী পূর্ণাঙ্গ প্রোফাইল সম্পাদনা"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    শিক্ষার্থী, পিতা ও মাতার ছবি, রক্তের গ্রুপ ও ইউনিক ইনডেক্স নম্বর ব্যবস্থাপনা
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* SECTION 1: UNIQUE INDEX & STUDENT CORE INFO */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <span className="font-black text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>১. ইউনিক ইনডেক্স ও মূল শিক্ষার্থী তথ্য</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newIdx = generateUniqueIndex(formData.className, formData.roll);
                      setFormData({ ...formData, indexNumber: newIdx });
                    }}
                    className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/50 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="নতুন ইউনিক ইনডেক্স কোড তৈরি করুন"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-300" />
                    <span>ইউনিক ইনডেক্স রি-জেনারেট</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">ইউনিক ইনডেক্স নম্বর (Unique Index):</label>
                    <input
                      type="text"
                      value={formData.indexNumber}
                      onChange={(e) => setFormData({ ...formData, indexNumber: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-amber-400/60 text-amber-300 font-mono font-black rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থী আইডি (ID):</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-600 font-mono font-bold text-white rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">রোল নম্বর:</label>
                    <input
                      type="text"
                      value={formData.roll}
                      onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-600 font-bold text-white rounded-xl p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর নাম (বাংলায়):</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="যেমন: আহমেদ হাসান"
                      required
                      className="w-full bg-slate-900 border border-slate-600 font-bold text-white rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">নাম (ইংরেজিতে):</label>
                    <input
                      type="text"
                      value={formData.nameEnglish || ""}
                      onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                      placeholder="e.g. Ahmed Hasan"
                      className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">শ্রেণি:</label>
                    <select
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 font-bold text-white rounded-xl p-2.5 outline-none"
                    >
                      <option value="নার্সারি">নার্সারি</option>
                      <option value="প্রথম শ্রেণি">প্রথম শ্রেণি</option>
                      <option value="দ্বিতীয় শ্রেণি">দ্বিতীয় শ্রেণি</option>
                      <option value="তৃতীয় শ্রেণি">তৃতীয় শ্রেণি</option>
                      <option value="চতুর্থ শ্রেণি">চতুর্থ শ্রেণি</option>
                      <option value="পঞ্চম শ্রেণি">পঞ্চম শ্রেণি</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">রক্তের গ্রুপ (Blood Group):</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 font-bold text-amber-300 rounded-xl p-2.5 outline-none"
                    >
                      <option value="A+">A+ (এ পজিটিভ)</option>
                      <option value="A-">A- (এ নেগেটিভ)</option>
                      <option value="B+">B+ (বি পজিটিভ)</option>
                      <option value="B-">B- (বি নেগেটিভ)</option>
                      <option value="O+">O+ (ও পজিটিভ)</option>
                      <option value="O-">O- (ও নেগেটিভ)</option>
                      <option value="AB+">AB+ (এবি পজিটিভ)</option>
                      <option value="AB-">AB- (এবি নেগেটিভ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">জন্মতারিখ:</label>
                    <input
                      type="text"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      placeholder="যেমন: ১৫ জানুয়ারি ২০১৫"
                      className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">লিঙ্গ:</label>
                    <select
                      value={formData.gender || "ছাত্র"}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 font-bold text-white rounded-xl p-2.5 outline-none"
                    >
                      <option value="ছাত্র">ছাত্র</option>
                      <option value="ছাত্রী">ছাত্রী</option>
                    </select>
                  </div>
                </div>

                {/* Student Photo */}
                <div className="pt-2 border-t border-slate-700/60 flex items-center gap-4">
                  <img
                    src={formData.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                    alt="Student"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div className="flex-1">
                    <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর নিজের ছবি (Student Photo):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.photoUrl}
                        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                        placeholder="ছবির URL লিখুন বা ফাইল নির্বাচন করুন..."
                        className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-xl p-2 outline-none font-mono text-[11px]"
                      />
                      <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                        <Camera className="w-3.5 h-3.5" />
                        <span>আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload("photoUrl", e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PARENTS DETAILS & PHOTOS (FATHER & MOTHER) */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-4">
                <span className="font-black text-amber-300 flex items-center gap-1.5 border-b border-slate-700/60 pb-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>২. পিতা ও মাতার পরিচিতি ও ছবি (Parents Master Profiles)</span>
                </span>

                {/* Father Info */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.fatherPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                      alt="Father"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-amber-300 block mb-1">পিতার তথ্য ও ছবি:</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.fatherPhotoUrl || ""}
                          onChange={(e) => setFormData({ ...formData, fatherPhotoUrl: e.target.value })}
                          placeholder="পিতার ছবির URL লিখুন..."
                          className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 outline-none font-mono text-[11px]"
                        />
                        <label className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer">
                          <Camera className="w-3 h-3" />
                          <span>ছবি</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload("fatherPhotoUrl", e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-0.5">পিতার পুরো নাম:</label>
                      <input
                        type="text"
                        value={formData.fatherName || ""}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value, guardianName: e.target.value })}
                        placeholder="যেমন: মোঃ রফিকুল হাসান"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-0.5">পিতার পেশা:</label>
                      <input
                        type="text"
                        value={formData.fatherOccupation || ""}
                        onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                        placeholder="যেমন: ব্যবসায়ী / শিক্ষক"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-0.5">পিতার ফোন নম্বর:</label>
                      <input
                        type="text"
                        value={formData.fatherPhone || ""}
                        onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value, guardianPhone: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-300 font-mono font-bold rounded-lg p-2 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Mother Info */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.motherPhotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"}
                      alt="Mother"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-emerald-300 block mb-1">মাতার তথ্য ও ছবি:</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.motherPhotoUrl || ""}
                          onChange={(e) => setFormData({ ...formData, motherPhotoUrl: e.target.value })}
                          placeholder="মাতার ছবির URL লিখুন..."
                          className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 outline-none font-mono text-[11px]"
                        />
                        <label className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer">
                          <Camera className="w-3 h-3" />
                          <span>ছবি</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload("motherPhotoUrl", e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-0.5">মাতার পুরো নাম:</label>
                      <input
                        type="text"
                        value={formData.motherName || ""}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        placeholder="যেমন: মোসাম্মাৎ খাদিজা বেগম"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-0.5">মাতার পেশা:</label>
                      <input
                        type="text"
                        value={formData.motherOccupation || ""}
                        onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                        placeholder="যেমন: শিক্ষাবিদ / গৃহিণী"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-0.5">মাতার ফোন নম্বর:</label>
                      <input
                        type="text"
                        value={formData.motherPhone || ""}
                        onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                        placeholder="018XXXXXXXX"
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-300 font-mono font-bold rounded-lg p-2 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">জরুরি ফোন নম্বর:</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="018XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-600 text-emerald-300 font-mono font-bold rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">স্থায়ী ঠিকানা:</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="বাসা নং, রোড, থানা, জেলা"
                      className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl p-2.5 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4 text-emerald-200" />
                  <span>সংরক্ষণ ও ইউনিক ইনডেক্স নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
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
                className="w-full h-[370px] border-2 border-slate-800 rounded-xl p-3 flex flex-col justify-between bg-white text-black break-inside-avoid shadow-sm"
              >
                <div className="text-center border-b border-black pb-1.5">
                  <h4 className="text-xs font-black">ডি-লিকন মডেল একাডেমী</h4>
                  <span className="text-[8px] bg-black text-white px-2 py-0.2 rounded font-bold uppercase">
                    STUDENT ID CARD
                  </span>
                </div>

                <div className="flex flex-col items-center text-center my-auto space-y-1">
                  <img
                    src={prof.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                    alt={prof.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-black"
                  />
                  <div>
                    <h5 className="text-xs font-black">{prof.name}</h5>
                    <p className="text-[9.5px] font-bold font-mono">ইনডেক্স: {prof.indexNumber || prof.studentId}</p>
                  </div>
                  <div className="text-[9.5px] font-bold w-full bg-slate-100 p-1.5 rounded border border-slate-300 grid grid-cols-2 gap-1 text-left">
                    <div>শ্রেণি: {prof.className}</div>
                    <div>রোল: {prof.roll}</div>
                    <div>গ্রুপ: {prof.bloodGroup}</div>
                    <div>পিতা: {prof.fatherName || prof.guardianName}</div>
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
