// src/components/exam_suite/StudentParentNIDRegistry.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  Printer,
  Download,
  Upload,
  Camera,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Heart,
  Phone,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  Calendar,
  Sparkles,
  Award,
  IdCard,
  QrCode,
  Image as ImageIcon,
  Check,
  X
} from "lucide-react";
import { StudentSecurityProfile } from "./examTypes";
import { SAMPLE_SECURITY_PROFILES } from "./examMockData";
import { studentsByClass } from "../../studentsData";
import { db } from "../../firebase";
import { collection, doc, setDoc, getDocs, getDoc, serverTimestamp } from "firebase/firestore";

// Convert English numbers to Bengali numerals
const toBn = (n: number | string | undefined | null): string => {
  if (n === undefined || n === null) return "";
  const bDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n.toString().replace(/[0-9]/g, d => bDigits[parseInt(d, 10)]);
};

export const StudentParentNIDRegistry: React.FC = () => {
  // Master list of student security profiles
  const [profiles, setProfiles] = useState<StudentSecurityProfile[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_student_security_profiles");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_SECURITY_PROFILES;
  });

  // Selected student for editing / data entry
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return profiles[0]?.studentId || "DLM-501";
  });

  // Form State
  const [formData, setFormData] = useState<StudentSecurityProfile>(() => {
    const initial = profiles.find(p => p.studentId === (profiles[0]?.studentId || "DLM-501")) || profiles[0] || SAMPLE_SECURITY_PROFILES[0];
    return {
      ...initial,
      birthCertificateNo: initial.birthCertificateNo || "",
      fatherNameEnglish: initial.fatherNameEnglish || "",
      fatherNid: initial.fatherNid || "",
      fatherDateOfBirth: initial.fatherDateOfBirth || "",
      motherNameEnglish: initial.motherNameEnglish || "",
      motherNid: initial.motherNid || "",
      motherDateOfBirth: initial.motherDateOfBirth || ""
    };
  });

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<"entry_form" | "roster_list" | "print_biodata">("entry_form");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterClass, setFilterClass] = useState<string>("সকল শ্রেণি");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isCameraActiveFor, setIsCameraActiveFor] = useState<"student" | "father" | "mother" | null>(null);
  const [webcamError, setWebcamError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync from Cloud Firestore on mount
  useEffect(() => {
    const fetchCloudProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "student_security_profiles"));
        if (!querySnapshot.empty) {
          const cloudData: StudentSecurityProfile[] = [];
          querySnapshot.forEach(docSnap => {
            cloudData.push(docSnap.data() as StudentSecurityProfile);
          });
          if (cloudData.length > 0) {
            setProfiles(prev => {
              // Merge cloud data with local, prioritizing cloud entries
              const mergedMap = new Map<string, StudentSecurityProfile>();
              prev.forEach(p => mergedMap.set(p.studentId, p));
              cloudData.forEach(p => mergedMap.set(p.studentId, p));
              const merged = Array.from(mergedMap.values());
              localStorage.setItem("dlikon_student_security_profiles", JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn("Firestore sync optional fallback to local:", err);
      }
    };
    fetchCloudProfiles();
  }, []);

  // Update formData when selectedStudentId changes
  const handleSelectStudentForEdit = (studentId: string) => {
    const found = profiles.find(p => p.studentId === studentId);
    if (found) {
      setSelectedStudentId(studentId);
      setFormData({
        ...found,
        birthCertificateNo: found.birthCertificateNo || "",
        fatherNameEnglish: found.fatherNameEnglish || "",
        fatherNid: found.fatherNid || "",
        fatherDateOfBirth: found.fatherDateOfBirth || "",
        motherNameEnglish: found.motherNameEnglish || "",
        motherNid: found.motherNid || "",
        motherDateOfBirth: found.motherDateOfBirth || ""
      });
      setActiveSubTab("entry_form");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
    else if (sClass.includes("ষষ্ঠ")) classCode = "06";
    else if (sClass.includes("সপ্তম")) classCode = "07";
    else if (sClass.includes("অষ্টম")) classCode = "08";
    else if (sClass.includes("নবম")) classCode = "09";
    else if (sClass.includes("দশম")) classCode = "10";

    const cleanRoll = sRoll.replace(/[^\d]/g, "") || "01";
    const paddedRoll = cleanRoll.padStart(3, "0");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `DLM-${year}-${classCode}${paddedRoll}-${randomSuffix}`;
  };

  // Create New Student Profile
  const handleCreateNewStudent = () => {
    const nextRoll = (profiles.length + 1).toString().padStart(2, "০");
    const newId = `DLM-5${(profiles.length + 1).toString().padStart(2, "0")}`;
    const newIndex = generateUniqueIndex("পঞ্চম শ্রেণি", nextRoll);

    const blankProfile: StudentSecurityProfile = {
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
      birthCertificateNo: "",
      dateOfBirth: "০১ জানুয়ারি ২০১৫",
      gender: "ছাত্র",
      fatherName: "",
      fatherNameEnglish: "",
      fatherNid: "",
      fatherDateOfBirth: "",
      fatherOccupation: "",
      fatherPhone: "",
      fatherPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      motherName: "",
      motherNameEnglish: "",
      motherNid: "",
      motherDateOfBirth: "",
      motherOccupation: "",
      motherPhone: "",
      motherPhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    };

    setFormData(blankProfile);
    setSelectedStudentId(newId);
    setActiveSubTab("entry_form");
  };

  // Image File Upload Helper
  const handleImageFileChange = (field: "photoUrl" | "fatherPhotoUrl" | "motherPhotoUrl", file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png, .jpeg) নির্বাচন করুন।");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData(prev => ({
          ...prev,
          [field]: reader.result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Camera Live Snap Helper
  const startCameraSnap = async (target: "student" | "father" | "mother") => {
    setIsCameraActiveFor(target);
    setWebcamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setWebcamError("ক্যামেরা চালু করা সম্ভব হয়নি। ডিভাইসে ক্যামেরা পারমিশন রয়েছে কিনা যাচাই করুন।");
    }
  };

  const captureCameraFrame = (target: "student" | "father" | "mother") => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const field = target === "student" ? "photoUrl" : target === "father" ? "fatherPhotoUrl" : "motherPhotoUrl";
      setFormData(prev => ({ ...prev, [field]: dataUrl }));
    }
    stopCameraSnap();
  };

  const stopCameraSnap = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActiveFor(null);
  };

  // Save to Database & LocalStorage
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setSaveToast({ message: "অনুগ্রহ করে শিক্ষার্থীর নাম পূরণ করুন।", type: "error" });
      return;
    }
    if (!formData.indexNumber.trim()) {
      setSaveToast({ message: "ইউনিক ইনডেক্স নম্বর ফাঁকা রাখা যাবে না।", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const profileToSave: StudentSecurityProfile = {
        ...formData,
        studentId: formData.studentId.trim(),
        indexNumber: formData.indexNumber.trim(),
        guardianName: formData.guardianName || formData.fatherName || formData.motherName || "অভিভাবক",
        guardianPhone: formData.guardianPhone || formData.fatherPhone || formData.motherPhone || "01711-000000",
        emergencyContact: formData.emergencyContact || formData.guardianPhone || "01819-000000",
        updatedAt: new Date().toISOString()
      };

      // 1. Update in LocalStorage
      const existingIdx = profiles.findIndex(p => p.studentId === profileToSave.studentId);
      let updatedList: StudentSecurityProfile[];
      if (existingIdx >= 0) {
        updatedList = [...profiles];
        updatedList[existingIdx] = profileToSave;
      } else {
        updatedList = [profileToSave, ...profiles];
      }

      setProfiles(updatedList);
      localStorage.setItem("dlikon_student_security_profiles", JSON.stringify(updatedList));

      // 2. Persist to Cloud Firestore
      try {
        const docRef = doc(db, "student_security_profiles", profileToSave.studentId);
        await setDoc(docRef, {
          ...profileToSave,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("Firestore save warning, local data saved successfully:", err);
      }

      // 3. Success notification
      setSaveToast({
        message: `সাফল্যের সাথে শিক্ষার্থী '${profileToSave.name}' (ইনডেক্স: ${profileToSave.indexNumber})-এর জন্ম সনদ ও পিতা-মাতার এনআইডি ডাটাবেসে সংরক্ষিত হয়েছে!`,
        type: "success"
      });

      // Clear toast after 4 seconds
      setTimeout(() => {
        setSaveToast(null);
      }, 4000);
    } catch (err: any) {
      setSaveToast({ message: "সংরক্ষণ করতে সমস্যা হয়েছে: " + (err.message || "Unknown error"), type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Move to next student entry smoothly
  const handleNextStudentEntry = async () => {
    await handleSaveProfile();

    const currentIndex = profiles.findIndex(p => p.studentId === formData.studentId);
    if (currentIndex >= 0 && currentIndex < profiles.length - 1) {
      const nextProfile = profiles[currentIndex + 1];
      handleSelectStudentForEdit(nextProfile.studentId);
    } else {
      handleCreateNewStudent();
    }
  };

  // Delete profile confirmation
  const handleDeleteProfile = (studentId: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই শিক্ষার্থীর তথ্য মুছে ফেলতে চান?")) {
      const updated = profiles.filter(p => p.studentId !== studentId);
      setProfiles(updated);
      localStorage.setItem("dlikon_student_security_profiles", JSON.stringify(updated));
      if (selectedStudentId === studentId && updated.length > 0) {
        handleSelectStudentForEdit(updated[0].studentId);
      }
    }
  };

  // Filter profiles for roster view
  const filteredProfiles = profiles.filter(p => {
    const matchClass = filterClass === "সকল শ্রেণি" || p.className === filterClass;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameEnglish && p.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.indexNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roll.includes(searchQuery) ||
      (p.birthCertificateNo && p.birthCertificateNo.includes(searchQuery)) ||
      (p.fatherNid && p.fatherNid.includes(searchQuery)) ||
      (p.motherNid && p.motherNid.includes(searchQuery));

    return matchClass && matchSearch;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "ইনডেক্স নম্বর",
      "শিক্ষার্থীর নাম",
      "শ্রেণি",
      "রোল",
      "জন্ম তারিখ",
      "জন্ম নিবন্ধন নম্বর",
      "রক্তের গ্রুপ",
      "পিতার নাম",
      "পিতার এনআইডি",
      "পিতার জন্ম তারিখ",
      "পিতার মোবাইল",
      "মাতার নাম",
      "মাতার এনআইডি",
      "মাতার জন্ম তারিখ",
      "মাতার মোবাইল",
      "ঠিকানা"
    ];

    const rows = profiles.map(p => [
      `"${p.indexNumber || ""}"`,
      `"${p.name || ""}"`,
      `"${p.className || ""}"`,
      `"${p.roll || ""}"`,
      `"${p.dateOfBirth || ""}"`,
      `"${p.birthCertificateNo || ""}"`,
      `"${p.bloodGroup || ""}"`,
      `"${p.fatherName || ""}"`,
      `"${p.fatherNid || ""}"`,
      `"${p.fatherDateOfBirth || ""}"`,
      `"${p.fatherPhone || ""}"`,
      `"${p.motherName || ""}"`,
      `"${p.motherNid || ""}"`,
      `"${p.motherDateOfBirth || ""}"`,
      `"${p.motherPhone || ""}"`,
      `"${p.address || ""}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Students_NID_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* TOP BANNER & STATS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider font-mono">
                DATA ENTRY SUITE 2026
              </span>
              <span className="text-xs text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>ক্লাউড ও লোকাল অটো-সিঙ্ক সমৃদ্ধ</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <IdCard className="w-6 h-6 text-amber-400" />
              <span>শিক্ষার্থী ইনডেক্স ও পিতা-মাতার এনআইডি তথ্য নিবন্ধন</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              প্রতিটি শিক্ষার্থীর ইউনিক ইনডেক্স নম্বরের বিপরীতে নিজের জন্ম নিবন্ধন ও জন্ম তারিখ, পিতা ও মাতার নাম, এনআইডি (NID) নম্বর,
              জন্ম তারিখ এবং প্রত্যেকের ছবি আপলোড করে সেন্ট্রাল রেজিস্ট্রি ডেটাবেস প্রস্তুত করুন।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewStudent}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <User className="w-4 h-4 text-emerald-200" />
              <span>➕ নতুন শিক্ষার্থী এন্ট্রি</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="সকল ডাটা এক্সেল/CSV ফরম্যাটে ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-indigo-300" />
              <span>CSV ডাউনলোড</span>
            </button>
          </div>
        </div>

        {/* STATS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-indigo-900/60">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400 block">মোট নিবন্ধিত শিক্ষার্থী</span>
            <span className="text-lg font-mono font-black text-amber-300">{toBn(profiles.length)} জন</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400 block">জন্ম নিবন্ধন তথ্য এন্ট্রি</span>
            <span className="text-lg font-mono font-black text-emerald-300">
              {toBn(profiles.filter(p => Boolean(p.birthCertificateNo)).length)} জন
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400 block">পিতার এনআইডি আপডেট</span>
            <span className="text-lg font-mono font-black text-indigo-300">
              {toBn(profiles.filter(p => Boolean(p.fatherNid)).length)} জন
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400 block">মাতার এনআইডি আপডেট</span>
            <span className="text-lg font-mono font-black text-pink-300">
              {toBn(profiles.filter(p => Boolean(p.motherNid)).length)} জন
            </span>
          </div>
        </div>
      </div>

      {/* TOAST NOTICE */}
      {saveToast && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 animate-fadeIn shadow-lg ${
            saveToast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/60 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {saveToast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{saveToast.message}</span>
          </div>
          <button
            onClick={() => setSaveToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUBVIEW SWITCHER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("entry_form")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "entry_form"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md ring-2 ring-indigo-400"
              : "bg-slate-800 text-slate-300 hover:bg-slate-750"
          }`}
        >
          <IdCard className="w-4 h-4 text-amber-300" />
          <span>১. তথ্য নিবন্ধন ও এন্ট্রি ফরম</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("roster_list")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "roster_list"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400"
              : "bg-slate-800 text-slate-300 hover:bg-slate-750"
          }`}
        >
          <Users className="w-4 h-4 text-emerald-300" />
          <span>২. সকল শিক্ষার্থী ও এনআইডি রেজিস্টার ({toBn(profiles.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("print_biodata")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "print_biodata"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md ring-2 ring-amber-300 font-black"
              : "bg-slate-800 text-slate-300 hover:bg-slate-750"
          }`}
        >
          <Printer className="w-4 h-4 text-slate-900" />
          <span>৩. এ৪ বায়োডাটা ও অভিভাবক প্রত্যয়ন প্রিন্ট</span>
        </button>
      </div>

      {/* ======================= VIEW 1: DATA ENTRY FORM ======================= */}
      {activeSubTab === "entry_form" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: STUDENT SELECTOR & QUICK NAVIGATION */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>শিক্ষার্থী নির্বাচন ও ইনডেক্স সার্চ</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {toBn(filteredProfiles.length)} জন পাওয়া গেছে
                </span>
              </div>

              {/* Class Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">শ্রেণি নির্বাচন:</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs font-bold outline-none focus:border-indigo-500"
                >
                  <option value="সকল শ্রেণি">সকল শ্রেণি (All Classes)</option>
                  <option value="নার্সারি">নার্সারি</option>
                  <option value="প্রথম শ্রেণি">প্রথম শ্রেণি</option>
                  <option value="দ্বিতীয় শ্রেণি">দ্বিতীয় শ্রেণি</option>
                  <option value="তৃতীয় শ্রেণি">তৃতীয় শ্রেণি</option>
                  <option value="চতুর্থ শ্রেণি">চতুর্থ শ্রেণি</option>
                  <option value="পঞ্চম শ্রেণি">পঞ্চম শ্রেণি</option>
                  <option value="ষষ্ঠ শ্রেণি">ষষ্ঠ শ্রেণি</option>
                  <option value="সপ্তম শ্রেণি">সপ্তম শ্রেণি</option>
                  <option value="অষ্টম শ্রেণি">অষ্টম শ্রেণি</option>
                  <option value="নবম শ্রেণি">নবম শ্রেণি</option>
                  <option value="দশম শ্রেণি">দশম শ্রেণি</option>
                </select>
              </div>

              {/* Live Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ইনডেক্স, নাম, রোল বা এনআইডি..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Scrollable Student List */}
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredProfiles.map((p) => {
                  const isSelected = p.studentId === formData.studentId;
                  const hasBRN = Boolean(p.birthCertificateNo);
                  const hasNID = Boolean(p.fatherNid && p.motherNid);

                  return (
                    <button
                      key={p.studentId}
                      type="button"
                      onClick={() => handleSelectStudentForEdit(p.studentId)}
                      className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between gap-2.5 cursor-pointer border ${
                        isSelected
                          ? "bg-indigo-950/80 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400"
                          : "bg-slate-950/50 hover:bg-slate-800/80 border-slate-800/80 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={p.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80"}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover border border-amber-400/60 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate text-white">{p.name || "নামহীন শিক্ষার্থী"}</p>
                          <p className="text-[10px] text-amber-300 font-mono truncate">{p.indexNumber || p.studentId}</p>
                          <span className="text-[10px] text-slate-400">{p.className} • রোল: {toBn(p.roll)}</span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {hasBRN && hasNID ? (
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold rounded">
                            সম্পূর্ণ
                          </span>
                        ) : hasBRN || hasNID ? (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold rounded">
                            আংশিক
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold rounded">
                            অসম্পূর্ণ
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-500">#{p.roll}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUICK PREVIEW CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 shadow-lg">
              <span className="font-black text-indigo-300 block border-b border-slate-800 pb-2">
                কার্ড ভিউ প্রিভিউ (Live Card Preview):
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={formData.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                  alt="Student"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400 shadow"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white truncate">{formData.name || "শিক্ষার্থীর নাম"}</h4>
                  <span className="text-[11px] font-mono font-bold text-amber-400 block">{formData.indexNumber}</span>
                  <span className="text-[10px] text-slate-400">{formData.className} • রোল: {toBn(formData.roll)}</span>
                </div>
              </div>
              <div className="text-[11px] space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">জন্ম নিবন্ধন:</span>
                  <span className="font-mono text-emerald-400 font-bold">{formData.birthCertificateNo || "এন্ট্রি হয়নি"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">পিতার এনআইডি:</span>
                  <span className="font-mono text-indigo-300 font-bold">{formData.fatherNid || "এন্ট্রি হয়নি"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">মাতার এনআইডি:</span>
                  <span className="font-mono text-pink-300 font-bold">{formData.motherNid || "এন্ট্রি হয়নি"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: MAIN DATA ENTRY FORM */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* SECTION 1: STUDENT IDENTIFICATION & BIRTH REGISTRATION */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">১. শিক্ষার্থীর মূল পরিচিতি ও জন্ম নিবন্ধন তথ্য</h3>
                      <p className="text-[10px] text-slate-400">ইনডেক্স নম্বর, জন্ম তারিখ ও জন্ম নিবন্ধন সনদ (BRN) নম্বর</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newIdx = generateUniqueIndex(formData.className, formData.roll);
                      setFormData(prev => ({ ...prev, indexNumber: newIdx }));
                    }}
                    className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/50 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="নতুন ইউনিক ইনডেক্স কোড তৈরি করুন"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-300" />
                    <span>ইউনিক ইনডেক্স রি-জেনারেট</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Unique Index Number */}
                  <div>
                    <label className="font-bold text-amber-300 block mb-1">
                      ইউনিক ইনডেক্স নম্বর (Unique Index): *
                    </label>
                    <input
                      type="text"
                      value={formData.indexNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, indexNumber: e.target.value }))}
                      required
                      placeholder="e.g. DLM-2026-0501"
                      className="w-full bg-slate-950 border border-amber-400/70 text-amber-300 font-mono font-black rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-400 text-xs"
                    />
                  </div>

                  {/* Student System ID */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থী আইডি (ID):</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                      required
                      className="w-full bg-slate-950 border border-slate-700 font-mono font-bold text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">রোল নম্বর:</label>
                    <input
                      type="text"
                      value={formData.roll}
                      onChange={(e) => setFormData(prev => ({ ...prev, roll: e.target.value }))}
                      required
                      placeholder="যেমন: ০১ বা 1"
                      className="w-full bg-slate-950 border border-slate-700 font-bold text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Name Bangla */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-300 block mb-1">শিক্ষার্থীর পুরো নাম (বাংলায়): *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="যেমন: আহমেদ হাসান"
                      className="w-full bg-slate-950 border border-slate-700 font-bold text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Name English */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">নাম (ইংরেজিতে):</label>
                    <input
                      type="text"
                      value={formData.nameEnglish || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameEnglish: e.target.value }))}
                      placeholder="e.g. Ahmed Hasan"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Class */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">শ্রেণি:</label>
                    <select
                      value={formData.className}
                      onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 font-bold text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="নার্সারি">নার্সারি</option>
                      <option value="প্রথম শ্রেণি">প্রথম শ্রেণি</option>
                      <option value="দ্বিতীয় শ্রেণি">দ্বিতীয় শ্রেণি</option>
                      <option value="তৃতীয় শ্রেণি">তৃতীয় শ্রেণি</option>
                      <option value="চতুর্থ শ্রেণি">চতুর্থ শ্রেণি</option>
                      <option value="পঞ্চম শ্রেণি">পঞ্চম শ্রেণি</option>
                      <option value="ষষ্ঠ শ্রেণি">ষষ্ঠ শ্রেণি</option>
                      <option value="সপ্তম শ্রেণি">সপ্তম শ্রেণি</option>
                      <option value="অষ্টম শ্রেণি">অষ্টম শ্রেণি</option>
                      <option value="নবম শ্রেণি">নবম শ্রেণি</option>
                      <option value="দশম শ্রেণি">দশম শ্রেণি</option>
                    </select>
                  </div>

                  {/* Student Date of Birth */}
                  <div>
                    <label className="font-bold text-amber-300 block mb-1">শিক্ষার্থীর জন্ম তারিখ: *</label>
                    <input
                      type="text"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      placeholder="যেমন: ১৫ জানুয়ারি ২০১৫ বা 2015-01-15"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  {/* Student Birth Registration Number (BRN) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-emerald-400">জন্ম নিবন্ধন নম্বর (BRN): *</label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(formData.birthCertificateNo || "").length}/১৭ ডিজিট
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={17}
                      value={formData.birthCertificateNo || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthCertificateNo: e.target.value }))}
                      placeholder="১৭ ডিজিটের জন্ম নিবন্ধন সনদ নম্বর"
                      className="w-full bg-slate-950 border border-emerald-500/70 text-emerald-300 font-mono font-bold rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">রক্তের গ্রুপ:</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 font-bold text-amber-300 rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
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

                  {/* Gender */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">লিঙ্গ:</label>
                    <select
                      value={formData.gender || "ছাত্র"}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 font-bold text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="ছাত্র">ছাত্র</option>
                      <option value="ছাত্রী">ছাত্রী</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">বর্তমান ঠিকানা:</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="গ্রাম/বাড়ি, ডাকঘর, থানা, জেলা"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {/* STUDENT PHOTO UPLOAD BOX */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="relative">
                    <img
                      src={formData.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                      alt="Student"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400 shadow-md"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full">
                      শিক্ষার্থী
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="font-bold text-slate-200 text-xs block">
                      📷 শিক্ষার্থীর পাসপোর্ট সাইজ ছবি আপলোড (Student Photo):
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ফাইল নির্বাচন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageFileChange("photoUrl", e.target.files[0])}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => startCameraSnap("student")}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-300" />
                        <span>ওয়েবক্যাম স্ন্যাপ</span>
                      </button>

                      <input
                        type="text"
                        value={formData.photoUrl || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                        placeholder="বা ছবির ডিরেক্ট ওয়েব URL লিখুন..."
                        className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-1.5 text-[11px] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FATHER'S NID & INFORMATION */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-300">২. পিতার তথ্য, এনআইডি ও ছবি নিবন্ধন</h3>
                    <p className="text-[10px] text-slate-400">পিতার জাতীয় পরিচয়পত্র (NID), জন্ম তারিখ, মোবাইল নম্বর ও ছবি</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Father Name Bangla */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">পিতার পুরো নাম (বাংলায়): *</label>
                    <input
                      type="text"
                      value={formData.fatherName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                      placeholder="যেমন: মোঃ রফিকুল হাসান"
                      className="w-full bg-slate-950 border border-slate-700 font-bold text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Father Name English */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">পিতার নাম (ইংরেজিতে):</label>
                    <input
                      type="text"
                      value={formData.fatherNameEnglish || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, fatherNameEnglish: e.target.value }))}
                      placeholder="e.g. Md. Rafiqul Hasan"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Father NID */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-indigo-300">পিতার এনআইডি (NID) নম্বর: *</label>
                      <span className="text-[10px] font-mono text-slate-400">১০/১৩/১৭ ডিজিট</span>
                    </div>
                    <input
                      type="text"
                      maxLength={17}
                      value={formData.fatherNid || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, fatherNid: e.target.value }))}
                      placeholder="পিতার জাতীয় পরিচয়পত্র নম্বর"
                      className="w-full bg-slate-950 border border-indigo-500/70 text-indigo-300 font-mono font-bold rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                    />
                  </div>

                  {/* Father DOB */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">পিতার জন্ম তারিখ: *</label>
                    <input
                      type="text"
                      value={formData.fatherDateOfBirth || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, fatherDateOfBirth: e.target.value }))}
                      placeholder="যেমন: ১২ মার্চ ১৯৮২ বা 1982-03-12"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Father Phone */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">পিতার মোবাইল নম্বর:</label>
                    <input
                      type="text"
                      value={formData.fatherPhone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, fatherPhone: e.target.value }))}
                      placeholder="০১৭xxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  {/* Father Occupation */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">পিতার পেশা:</label>
                    <input
                      type="text"
                      value={formData.fatherOccupation || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, fatherOccupation: e.target.value }))}
                      placeholder="যেমন: ব্যবসায়ী / শিক্ষক / চাকরিজীবী"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {/* FATHER PHOTO UPLOAD */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="relative">
                    <img
                      src={formData.fatherPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                      alt="Father"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-400 shadow-md"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 bg-indigo-500 text-white text-[9px] font-black rounded-full">
                      পিতা
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="font-bold text-slate-200 text-xs block">
                      📷 পিতার ছবি আপলোড (Father Photo):
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ফাইল নির্বাচন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageFileChange("fatherPhotoUrl", e.target.files[0])}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => startCameraSnap("father")}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-300" />
                        <span>ওয়েবক্যাম স্ন্যাপ</span>
                      </button>

                      <input
                        type="text"
                        value={formData.fatherPhotoUrl || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, fatherPhotoUrl: e.target.value }))}
                        placeholder="বা পিতার ছবির URL লিখুন..."
                        className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-1.5 text-[11px] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: MOTHER'S NID & INFORMATION */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                    <Heart className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-pink-300">৩. মাতার তথ্য, এনআইডি ও ছবি নিবন্ধন</h3>
                    <p className="text-[10px] text-slate-400">মাতার জাতীয় পরিচয়পত্র (NID), জন্ম তারিখ, মোবাইল নম্বর ও ছবি</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Mother Name Bangla */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">মাতার পুরো নাম (বাংলায়): *</label>
                    <input
                      type="text"
                      value={formData.motherName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                      placeholder="যেমন: মোসাম্মাৎ খাদিজা বেগম"
                      className="w-full bg-slate-950 border border-slate-700 font-bold text-white rounded-xl p-2.5 outline-none focus:border-pink-500 text-xs"
                    />
                  </div>

                  {/* Mother Name English */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">মাতার নাম (ইংরেজিতে):</label>
                    <input
                      type="text"
                      value={formData.motherNameEnglish || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherNameEnglish: e.target.value }))}
                      placeholder="e.g. Mst. Khadiza Begum"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-pink-500 text-xs"
                    />
                  </div>

                  {/* Mother NID */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-pink-300">মাতার এনআইডি (NID) নম্বর: *</label>
                      <span className="text-[10px] font-mono text-slate-400">১০/১৩/১৭ ডিজিট</span>
                    </div>
                    <input
                      type="text"
                      maxLength={17}
                      value={formData.motherNid || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherNid: e.target.value }))}
                      placeholder="মাতার জাতীয় পরিচয়পত্র নম্বর"
                      className="w-full bg-slate-950 border border-pink-500/70 text-pink-300 font-mono font-bold rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-pink-400 text-xs"
                    />
                  </div>

                  {/* Mother DOB */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">মাতার জন্ম তারিখ: *</label>
                    <input
                      type="text"
                      value={formData.motherDateOfBirth || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherDateOfBirth: e.target.value }))}
                      placeholder="যেমন: ১৮ আগস্ট ১৯৮৬ বা 1986-08-18"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-pink-500 text-xs"
                    />
                  </div>

                  {/* Mother Phone */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">মাতার মোবাইল নম্বর:</label>
                    <input
                      type="text"
                      value={formData.motherPhone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherPhone: e.target.value }))}
                      placeholder="০১৭xxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-pink-500 text-xs"
                    />
                  </div>

                  {/* Mother Occupation */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">মাতার পেশা:</label>
                    <input
                      type="text"
                      value={formData.motherOccupation || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherOccupation: e.target.value }))}
                      placeholder="যেমন: গৃহিণী / শিক্ষাবিদ / চাকরিজীবী"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-pink-500 text-xs"
                    />
                  </div>
                </div>

                {/* MOTHER PHOTO UPLOAD */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="relative">
                    <img
                      src={formData.motherPhotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                      alt="Mother"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-pink-400 shadow-md"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 bg-pink-500 text-white text-[9px] font-black rounded-full">
                      মাতা
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="font-bold text-slate-200 text-xs block">
                      📷 মাতার ছবি আপলোড (Mother Photo):
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ফাইল নির্বাচন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageFileChange("motherPhotoUrl", e.target.files[0])}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => startCameraSnap("mother")}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-300" />
                        <span>ওয়েবক্যাম স্ন্যাপ</span>
                      </button>

                      <input
                        type="text"
                        value={formData.motherPhotoUrl || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, motherPhotoUrl: e.target.value }))}
                        placeholder="বা মাতার ছবির URL লিখুন..."
                        className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-1.5 text-[11px] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: GUARDIAN & EMERGENCY CONTACT */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                <span className="font-black text-amber-300 text-xs block border-b border-slate-800 pb-2">
                  ৪. জরুরি যোগাযোগ ও প্রধান অভিভাবক বিবরণ:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">প্রধান অভিভাবকের নাম:</label>
                    <input
                      type="text"
                      value={formData.guardianName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                      placeholder="পিতা / মাতা / অন্যান্য"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">অভিভাবকের প্রধান মোবাইল নম্বর: *</label>
                    <input
                      type="text"
                      value={formData.guardianPhone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, guardianPhone: e.target.value }))}
                      placeholder="০১৭xxxxxxxx"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-emerald-300 font-bold rounded-xl p-2.5 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">জরুরি বিকল্প যোগাযোগ নম্বর:</label>
                    <input
                      type="text"
                      value={formData.emergencyContact || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      placeholder="০১৮xxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS BAR */}
              <div className="bg-slate-950/90 border-2 border-indigo-500/50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Save className="w-4 h-4 text-emerald-200" />}
                    <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "💾 ক্লাউড ও লোকাল ডেটাবেসে সংরক্ষণ করুন"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStudentEntry}
                    disabled={isSaving}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>পরবর্তী রোল/ইনডেক্স এন্ট্রি</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("print_biodata")}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>বায়োডাটা শিট প্রিন্ট</span>
                  </button>

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(formData.studentId)}
                      className="p-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="এই প্রোফাইলটি মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= VIEW 2: ROSTER & NID DIRECTORY TABLE ======================= */}
      {activeSubTab === "roster_list" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>নিবন্ধিত শিক্ষার্থী ও পিতামাতা এনআইডি মাস্টার রেজিস্টার</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                সকল শ্রেণির শিক্ষার্থীদের ইনডেক্স নম্বর, জন্ম নিবন্ধন নম্বর ও পিতা-মাতার এনআইডি তালিকা
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-300" />
                <span>CSV ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ইনডেক্স, নাম, রোল, এনআইডি..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs font-bold outline-none"
              >
                <option value="সকল শ্রেণি">সকল শ্রেণি (All)</option>
                <option value="নার্সারি">নার্সারি</option>
                <option value="প্রথম শ্রেণি">প্রথম শ্রেণি</option>
                <option value="দ্বিতীয় শ্রেণি">দ্বিতীয় শ্রেণি</option>
                <option value="তৃতীয় শ্রেণি">তৃতীয় শ্রেণি</option>
                <option value="চতুর্থ শ্রেণি">চতুর্থ শ্রেণি</option>
                <option value="পঞ্চম শ্রেণি">পঞ্চম শ্রেণি</option>
                <option value="ষষ্ঠ শ্রেণি">ষষ্ঠ শ্রেণি</option>
                <option value="সপ্তম শ্রেণি">সপ্তম শ্রেণি</option>
                <option value="অষ্টম শ্রেণি">অষ্টম শ্রেণি</option>
                <option value="নবম শ্রেণি">নবম শ্রেণি</option>
                <option value="দশম শ্রেণি">দশম শ্রেণি</option>
              </select>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">ক্রমিক ও ছবি</th>
                  <th className="p-3">ইউনিক ইনডেক্স নম্বর</th>
                  <th className="p-3">শিক্ষার্থীর নাম ও শ্রেণি</th>
                  <th className="p-3">জন্ম নিবন্ধন (BRN)</th>
                  <th className="p-3">পিতার নাম ও এনআইডি</th>
                  <th className="p-3">মাতার নাম ও এনআইডি</th>
                  <th className="p-3">যোগাযোগ</th>
                  <th className="p-3 text-center">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {filteredProfiles.map((p, idx) => (
                  <tr key={p.studentId} className="hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 text-[10px]">{toBn(idx + 1)}.</span>
                        <img
                          src={p.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80"}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
                        />
                      </div>
                    </td>

                    <td className="p-3 font-mono font-black text-amber-300 whitespace-nowrap">
                      {p.indexNumber || p.studentId}
                    </td>

                    <td className="p-3">
                      <p className="font-black text-white">{p.name}</p>
                      <span className="text-[10px] text-slate-400">{p.className} • রোল: {toBn(p.roll)}</span>
                    </td>

                    <td className="p-3 font-mono text-emerald-300 font-bold whitespace-nowrap">
                      {p.birthCertificateNo || <span className="text-slate-500 font-sans text-[10px]">দেয়া হয়নি</span>}
                    </td>

                    <td className="p-3">
                      <p className="font-bold text-slate-200">{p.fatherName || "—"}</p>
                      <span className="font-mono text-[10px] text-indigo-300">
                        {p.fatherNid ? `NID: ${p.fatherNid}` : "—"}
                      </span>
                    </td>

                    <td className="p-3">
                      <p className="font-bold text-slate-200">{p.motherName || "—"}</p>
                      <span className="font-mono text-[10px] text-pink-300">
                        {p.motherNid ? `NID: ${p.motherNid}` : "—"}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      {p.guardianPhone || p.emergencyContact}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSelectStudentForEdit(p.studentId)}
                        className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/50 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        এডিট / আপডেট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= VIEW 3: PRINTABLE A4 BIODATA SHEET ======================= */}
      {activeSubTab === "print_biodata" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white">এ৪ পূর্ণাঙ্গ বায়োডাটা ও অভিভাবক এনআইডি প্রত্যয়ন শিট</h3>
              <p className="text-[10px] text-slate-400">অফিস কপি ও অভিভাবকের রেকর্ডের জন্য প্রিন্টযোগ্য ফরম্যাট</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>A4 প্রিন্ট / PDF সংরক্ষণ করুন</span>
            </button>
          </div>

          {/* Printable White A4 Sheet */}
          <div
            ref={printContainerRef}
            className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-300 max-w-4xl mx-auto font-sans print:p-0 print:border-none print:shadow-none"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest font-mono">
                D-LIKON MODEL ACADEMY • REGISTRY & SECURITY ARCHIVE
              </span>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                ডি-লিকন মডেল একাডেমি
              </h1>
              <p className="text-xs text-slate-700 font-medium">
                ক্যাম্পাস প্রধান কার্যালয় • শিক্ষার্থী ও অভিভাবক এনআইডি তথ্য নিবন্ধন প্রত্যয়ন
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-400 rounded-full text-xs font-black font-mono">
                <span>ইউনিক ইনডেক্স নম্বর:</span>
                <span className="text-indigo-950">{formData.indexNumber}</span>
              </div>
            </div>

            {/* Photos & Main Student Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 border border-slate-300 rounded-xl text-center">
              <div>
                <img
                  src={formData.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                  alt="Student"
                  className="w-24 h-24 mx-auto rounded-lg object-cover border-2 border-indigo-700 shadow"
                />
                <span className="text-[10px] font-black text-slate-800 block mt-1.5">শিক্ষার্থীর ছবি</span>
              </div>
              <div>
                <img
                  src={formData.fatherPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                  alt="Father"
                  className="w-24 h-24 mx-auto rounded-lg object-cover border-2 border-slate-700 shadow"
                />
                <span className="text-[10px] font-black text-slate-800 block mt-1.5">পিতার ছবি</span>
              </div>
              <div>
                <img
                  src={formData.motherPhotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                  alt="Mother"
                  className="w-24 h-24 mx-auto rounded-lg object-cover border-2 border-slate-700 shadow"
                />
                <span className="text-[10px] font-black text-slate-800 block mt-1.5">মাতার ছবি</span>
              </div>
            </div>

            {/* Detailed Info Table */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-black text-sm bg-indigo-900 text-white px-3 py-1 rounded-md mb-2">
                  ১. শিক্ষার্থীর ব্যক্তিগত বিবরণ (Student Bio-Data)
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-2">
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">শিক্ষার্থীর নাম (বাংলায়):</span>
                    <span className="font-black text-slate-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">শিক্ষার্থীর নাম (ইংরেজিতে):</span>
                    <span className="font-medium text-slate-900">{formData.nameEnglish || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">শ্রেণি ও রোল:</span>
                    <span className="font-black text-slate-900">{formData.className} (রোল: {toBn(formData.roll)})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">জন্ম তারিখ:</span>
                    <span className="font-black text-indigo-900">{formData.dateOfBirth || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">জন্ম নিবন্ধন নম্বর (BRN):</span>
                    <span className="font-mono font-black text-emerald-900">{formData.birthCertificateNo || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">রক্তের গ্রুপ ও লিঙ্গ:</span>
                    <span className="font-black text-rose-800">{formData.bloodGroup} • {formData.gender || "ছাত্র"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-black text-sm bg-slate-800 text-white px-3 py-1 rounded-md mb-2">
                  ২. পিতা ও মাতার পরিচিতি ও জাতীয় পরিচয়পত্র (Parents NID Records)
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-2">
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">পিতার নাম:</span>
                    <span className="font-black text-slate-900">{formData.fatherName || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">পিতার এনআইডি (NID):</span>
                    <span className="font-mono font-black text-indigo-900">{formData.fatherNid || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">পিতার জন্ম তারিখ:</span>
                    <span className="font-black text-slate-900">{formData.fatherDateOfBirth || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">পিতার পেশা ও মোবাইল:</span>
                    <span className="font-medium text-slate-900">{formData.fatherOccupation || "—"} ({formData.fatherPhone || "—"})</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">মাতার নাম:</span>
                    <span className="font-black text-slate-900">{formData.motherName || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">মাতার এনআইডি (NID):</span>
                    <span className="font-mono font-black text-pink-900">{formData.motherNid || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">মাতার জন্ম তারিখ:</span>
                    <span className="font-black text-slate-900">{formData.motherDateOfBirth || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">মাতার পেশা ও মোবাইল:</span>
                    <span className="font-medium text-slate-900">{formData.motherOccupation || "—"} ({formData.motherPhone || "—"})</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-black text-sm bg-slate-800 text-white px-3 py-1 rounded-md mb-2">
                  ৩. যোগাযোগ ও বর্তমান ঠিকানা
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-2">
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">প্রধান অভিভাবক ও ফোন:</span>
                    <span className="font-black text-slate-900">{formData.guardianName} ({formData.guardianPhone})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">জরুরি বিকল্প নম্বর:</span>
                    <span className="font-mono font-bold text-slate-900">{formData.emergencyContact || "—"}</span>
                  </div>
                  <div className="col-span-2 flex justify-between border-b border-slate-200 py-1">
                    <span className="font-bold text-slate-600">বর্তমান ঠিকানা:</span>
                    <span className="font-medium text-slate-900">{formData.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 pt-8 border-t border-slate-400 flex justify-between items-end text-xs text-center">
              <div>
                <div className="w-36 border-b border-slate-900 mx-auto mb-1"></div>
                <span className="font-bold text-slate-800">অভিভাবকের স্বাক্ষর</span>
              </div>
              <div>
                <div className="w-36 border-b border-slate-900 mx-auto mb-1"></div>
                <span className="font-bold text-slate-800">যাচাইকারী কর্মকর্তার স্বাক্ষর</span>
              </div>
              <div>
                <div className="w-36 border-b border-slate-900 mx-auto mb-1"></div>
                <span className="font-bold text-slate-800">অধ্যক্ষ / প্রধান শিক্ষক</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEBCAM CAPTURE MODAL */}
      {isCameraActiveFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl p-5 max-w-md w-full text-center space-y-4">
            <h4 className="text-sm font-black text-white flex items-center justify-center gap-2">
              <Camera className="w-4 h-4 text-amber-300" />
              <span>
                {isCameraActiveFor === "student" ? "শিক্ষার্থীর" : isCameraActiveFor === "father" ? "পিতার" : "মাতার"} লাইভ ছবি তুলুন
              </span>
            </h4>

            {webcamError ? (
              <p className="text-rose-400 text-xs font-bold">{webcamError}</p>
            ) : (
              <div className="relative aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden border-2 border-amber-400 bg-black">
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-4 border border-dashed border-white/60 rounded-xl pointer-events-none"></div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => captureCameraFrame(isCameraActiveFor)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
              >
                📸 ছবি তুলুন ও সেভ করুন
              </button>
              <button
                type="button"
                onClick={stopCameraSnap}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
