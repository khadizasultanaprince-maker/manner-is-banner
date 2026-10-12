// src/components/exam_suite/AdmitCardStudio.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileBadge,
  Printer,
  QrCode,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building,
  User,
  Users,
  Send,
  Sparkles,
  Search,
  PlusCircle,
  Save,
  Check,
  Eye,
  Layers,
  ArrowRight,
  BookOpen,
  Clock,
  ShieldCheck,
  Edit3
} from "lucide-react";
import QRCode from "qrcode";
import { studentsByClass, addOrUpdateStudentToClass, Student } from "../../studentsData";

// Convert English numbers to Bengali numerals
const toBn = (n: number | string | undefined | null): string => {
  if (n === undefined || n === null || n === "") return "";
  const bDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n.toString().replace(/[0-9]/g, d => bDigits[parseInt(d, 10)]);
};

// Convert Bengali numbers to English numerals
const fromBn = (n: number | string | undefined | null): string => {
  if (n === undefined || n === null) return "";
  const map: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  return n.toString().replace(/[০-৯]/g, d => map[d] || d);
};

// Standard School Classes
const CLASS_LIST = [
  "প্লে",
  "নার্সারি",
  "কেজি",
  "প্রথম",
  "দ্বিতীয়",
  "তৃতীয়",
  "চতুর্থ",
  "পঞ্চম",
  "ষষ্ঠ",
  "সপ্তম",
  "অষ্টম",
  "নবম",
  "দশম"
];

// Two Exam Categories as requested
type ExamCategory = "terminal" | "midterm";

interface ExamOption {
  id: string;
  category: ExamCategory;
  name: string;
  shortName: string;
  isSingleDay: boolean; // Midterms are 1-day single paper
  defaultDate: string;
  defaultTime: string;
}

const EXAM_PRESETS: ExamOption[] = [
  // ১। সাময়িক পরীক্ষা (কয়েকদিন ব্যাপী, বিষয়ভিত্তিক আলাদা দিনে)
  {
    id: "term-1",
    category: "terminal",
    name: "প্রথম সাময়িক পরীক্ষা ২০২৬",
    shortName: "১ম সাময়িক",
    isSingleDay: false,
    defaultDate: "১৫ এপ্রিল ২০২৬ হতে ২৫ এপ্রিল ২০২৬",
    defaultTime: "সকাল ১০:০০টা - দুপুর ০১:০০টা"
  },
  {
    id: "term-2",
    category: "terminal",
    name: "দ্বিতীয় সাময়িক পরীক্ষা ২০২৬",
    shortName: "২য় সাময়িক",
    isSingleDay: false,
    defaultDate: "১০ আগস্ট ২০২৬ হতে ২০ আগস্ট ২০২৬",
    defaultTime: "সকাল ১০:০০টা - দুপুর ০১:০০টা"
  },
  {
    id: "term-final",
    category: "terminal",
    name: "বার্ষিক পরীক্ষা ২০২৬",
    shortName: "বার্ষিক",
    isSingleDay: false,
    defaultDate: "০১ ডিসেম্বর ২০২৬ হতে ১৫ ডিসেম্বর ২০২৬",
    defaultTime: "সকাল ১০:০০টা - দুপুর ০১:০০টা"
  },

  // ২। মিডটার্ম পরীক্ষা (১ দিনের ১টি প্রশ্নপত্র, পরীক্ষার আগে ২ বার হয়)
  {
    id: "mid-1-t1",
    category: "midterm",
    name: "প্রথম মিডটার্ম পরীক্ষা (প্রথম সাময়িক)",
    shortName: "১ম মিডটার্ম (১ম সাময়িক)",
    isSingleDay: true,
    defaultDate: "০৫ মার্চ ২০২৬ (বৃহস্পতিবার)",
    defaultTime: "সকাল ১০:০০টা - দুপুর ১২:০০টা (১টি প্রশ্নপত্রে ১ দিনে অনুষ্ঠিত)"
  },
  {
    id: "mid-2-t1",
    category: "midterm",
    name: "দ্বিতীয় মিডটার্ম পরীক্ষা (প্রথম সাময়িক)",
    shortName: "২য় মিডটার্ম (১ম সাময়িক)",
    isSingleDay: true,
    defaultDate: "২৮ মার্চ ২০২৬ (শনিবার)",
    defaultTime: "সকাল ১০:০০টা - দুপুর ১২:০০টা (১টি প্রশ্নপত্রে ১ দিনে অনুষ্ঠিত)"
  },
  {
    id: "mid-1-t2",
    category: "midterm",
    name: "প্রথম মিডটার্ম পরীক্ষা (দ্বিতীয় সাময়িক)",
    shortName: "১ম মিডটার্ম (২য় সাময়িক)",
    isSingleDay: true,
    defaultDate: "১৫ জুন ২০২৬ (সোমবার)",
    defaultTime: "সকাল ১০:০০টা - দুপুর ১২:০০টা (১টি প্রশ্নপত্রে ১ দিনে অনুষ্ঠিত)"
  },
  {
    id: "mid-2-t2",
    category: "midterm",
    name: "দ্বিতীয় মিডটার্ম পরীক্ষা (দ্বিতীয় সাময়িক)",
    shortName: "২য় মিডটার্ম (২য় সাময়িক)",
    isSingleDay: true,
    defaultDate: "১৮ জুলাই ২০২৬ (শনিবার)",
    defaultTime: "সকাল ১০:০০টা - দুপুর ১২:০০টা (১টি প্রশ্নপত্রে ১ দিনে অনুষ্ঠিত)"
  },
  {
    id: "mid-1-final",
    category: "midterm",
    name: "প্রথম মিডটার্ম পরীক্ষা (বার্ষিক পরীক্ষা)",
    shortName: "১ম মিডটার্ম (বার্ষিক)",
    isSingleDay: true,
    defaultDate: "২০ সেপ্টেম্বর ২০২৬ (রবিবার)",
    defaultTime: "সকাল ১০:০০টা - দুপুর ১২:০০টা (১টি প্রশ্নপত্রে ১ দিনে অনুষ্ঠিত)"
  },
  {
    id: "mid-2-final",
    category: "midterm",
    name: "দ্বিতীয় মিডটার্ম পরীক্ষা (বার্ষিক পরীক্ষা)",
    shortName: "২য় মিডটার্ম (বার্ষিক)",
    isSingleDay: true,
    defaultDate: "০৫ নভেম্বর ২০২৬ (বৃহস্পতিবার)",
    defaultTime: "সকাল ১০:০০টা - দুপুর ১২:০০টা (১টি প্রশ্নপত্রে ১ দিনে অনুষ্ঠিত)"
  }
];

// Subject routine for Terminal exams by class
const DEFAULT_TERMINAL_SCHEDULE: Record<string, { date: string; day: string; subject: string; time: string }[]> = {
  default: [
    { date: "১৫/০৪/২০২৬", day: "বুধবার", subject: "বাংলা (১ম ও ২য় পত্র)", time: "সকাল ১০:০০ - ১:০০" },
    { date: "১৭/০৪/২০২৬", day: "শুক্রবার", subject: "ইংরেজি (১ম ও ২য় পত্র)", time: "সকাল ১০:০০ - ১:০০" },
    { date: "১৯/০৪/২০২৬", day: "রবিবার", subject: "গণিত", time: "সকাল ১০:০০ - ১:০০" },
    { date: "২১/০৪/২০২৬", day: "মঙ্গলবার", subject: "বাংলাদেশ ও বিশ্বপরিচয়", time: "সকাল ১০:০০ - ১২:৩০" },
    { date: "২৩/০৪/২০২৬", day: "বৃহস্পতিবার", subject: "বিজ্ঞান", time: "সকাল ১০:০০ - ১২:৩০" },
    { date: "২৫/০৪/২০২৬", day: "শনিবার", subject: "ধর্ম ও নৈতিক শিক্ষা", time: "সকাল ১০:০০ - ১২:৩০" }
  ],
  "প্লে": [
    { date: "১৫/০৪/২০২৬", day: "বুধবার", subject: "বাংলা (মৌখিক ও লিখিত)", time: "সকাল ১০:০০ - ১১:৩০" },
    { date: "১৭/০৪/২০২৬", day: "শুক্রবার", subject: "ইংরেজি (ছড়া ও বর্ণ)", time: "সকাল ১০:০০ - ১১:৩০" },
    { date: "১৯/০৪/২০২৬", day: "রবিবার", subject: "গণিত (সংখ্যা ও গণনা)", time: "সকাল ১০:০০ - ১১:৩০" },
    { date: "২১/০৪/২০২৬", day: "মঙ্গলবার", subject: "সাধারণ জ্ঞান ও ধর্ম", time: "সকাল ১০:০০ - ১১:৩০" },
    { date: "২৩/০৪/২০২৬", day: "বৃহস্পতিবার", subject: "ড্রইং ও হাতের কাজ", time: "সকাল ১০:০০ - ১১:৩০" }
  ],
  "নার্সারি": [
    { date: "১৫/০৪/২০২৬", day: "বুধবার", subject: "বাংলা (মৌখিক ও লিখিত)", time: "সকাল ১০:০০ - ১২:০০" },
    { date: "১৭/০৪/২০২৬", day: "শুক্রবার", subject: "ইংরেজি (Oral & Written)", time: "সকাল ১০:০০ - ১২:০০" },
    { date: "১৯/০৪/২০২৬", day: "রবিবার", subject: "গণিত (মৌখিক ও লিখিত)", time: "সকাল ১০:০০ - ১২:০০" },
    { date: "২১/০৪/২০২৬", day: "মঙ্গলবার", subject: "সাধারণ জ্ঞান ও ধর্ম", time: "সকাল ১০:০০ - ১১:৩০" },
    { date: "২৩/০৪/২০২৬", day: "বৃহস্পতিবার", subject: "ড্রইং ও আর্ট", time: "সকাল ১০:০০ - ১১:৩০" }
  ]
};

// Exam rules printed on back side
const EXAM_RULES = [
  "পরীক্ষা শুরুর কমপক্ষে ১৫ মিনিট পূর্বে অবশ্যই নির্ধারিত আসনে উপস্থিত হতে হবে।",
  "প্রবেশপত্র (Admit Card) ব্যতীত কোনো শিক্ষার্থীকে পরীক্ষার হলে প্রবেশ করতে দেওয়া হবে না।",
  "প্রবেশপত্রে কোনো প্রকার কাটাকাটি, ঘষামাজা বা বিকৃতি ঘটানো সম্পূর্ণ নিষিদ্ধ।",
  "পরীক্ষার হলে মোবাইল ফোন, ডিজিটাল ঘড়ি বা অননুমোদিত কোনো ডিভাইস আনা দণ্ডনীয় অপরাধ।",
  "উত্তরপত্রে রোল নম্বর, শ্রেণি, শাখা ও রেজিস্ট্রেশন কোড নির্ভুলভাবে লিখতে হবে।",
  "পরীক্ষার হলে নীরবতা, সুশৃঙ্খল আচরণ ও ব্যক্তিগত সততা বজায় রাখা প্রতিটি শিক্ষার্থীর জন্য বাধ্যতামূলক।"
];

interface GeneratedCardData {
  id: string;
  studentName: string;
  className: string;
  roll: string;
  indexNo: string;
  seatNo: string;
  roomNo: string;
  examName: string;
  examDateSummary: string;
  isSingleDay: boolean;
  qrDataUrl: string;
}

export const AdmitCardStudio: React.FC = () => {
  // 1. Exam Configuration
  const [selectedExamId, setSelectedExamId] = useState<string>("mid-1-t1");
  const [selectedClass, setSelectedClass] = useState<string>("নার্সারি");

  // 2. Print Scope (১। সুনির্দিষ্টভাবে একজনের এডমিট কার্ড, ২। একসাথে একই ক্লাসের সকলের এডমিট কার্ড)
  const [printScope, setPrintScope] = useState<"single" | "class_batch">("single");

  // 3. Roll Selection Mode: from list OR manual input (e.g. নার্সারি রোল ২৮)
  const [rollMode, setRollMode] = useState<"from_list" | "manual">("from_list");
  const [selectedRoll, setSelectedRoll] = useState<string>("১");

  // Manual Input State for missing rolls (e.g. Nursery Roll 28)
  const [manualRoll, setManualRoll] = useState<string>("২৮");
  const [manualStudentName, setManualStudentName] = useState<string>("নতুন শিক্ষার্থী (রোল ২৮)");
  const [manualFatherName, setManualFatherName] = useState<string>("");
  const [isSavedToRoster, setIsSavedToRoster] = useState<boolean>(false);
  const [rosterToast, setRosterToast] = useState<string>("");

  // 4. View Mode: Front Page vs Back Page vs Both
  const [sideView, setSideView] = useState<"front" | "back" | "both">("both");

  // 5. Custom Exam Date Override
  const [customExamDate, setCustomExamDate] = useState<string>("");
  const [customExamTime, setCustomExamTime] = useState<string>("");

  // QR Code Cache
  const [qrCache, setQrCache] = useState<Record<string, string>>({});

  // Current Exam Object
  const currentExam = useMemo(() => {
    return EXAM_PRESETS.find(e => e.id === selectedExamId) || EXAM_PRESETS[0];
  }, [selectedExamId]);

  // Students for the selected class from live roster
  const studentsInClass = useMemo(() => {
    const list = studentsByClass[selectedClass] || [];
    return list;
  }, [selectedClass]);

  // Check if roll 28 exists in selected class
  const isRoll28Missing = useMemo(() => {
    if (selectedClass !== "নার্সারি") return false;
    return !studentsInClass.some(s => fromBn(s.roll) === "28");
  }, [selectedClass, studentsInClass]);

  // Update selectedRoll when class changes
  useEffect(() => {
    if (studentsInClass.length > 0) {
      setSelectedRoll(studentsInClass[0].roll);
    }
  }, [selectedClass, studentsInClass]);

  // Active student for single mode
  const currentSingleStudent = useMemo(() => {
    if (rollMode === "manual") {
      return {
        roll: manualRoll,
        name: manualStudentName.trim() || `শিক্ষার্থী (রোল: ${toBn(manualRoll)})`
      };
    }
    const found = studentsInClass.find(s => s.roll === selectedRoll);
    return found || studentsInClass[0] || { roll: manualRoll, name: manualStudentName };
  }, [rollMode, manualRoll, manualStudentName, studentsInClass, selectedRoll]);

  // Helper to generate index number
  const getIndexNumber = (cls: string, roll: string) => {
    const cleanRoll = fromBn(roll).replace(/[^\d]/g, "") || "01";
    let classCode = "00";
    if (cls.includes("প্লে")) classCode = "PL";
    else if (cls.includes("নার্সারি")) classCode = "NR";
    else if (cls.includes("কেজি")) classCode = "KG";
    else if (cls.includes("প্রথম")) classCode = "01";
    else if (cls.includes("দ্বিতীয়")) classCode = "02";
    else if (cls.includes("তৃতীয়")) classCode = "03";
    else if (cls.includes("চতুর্থ")) classCode = "04";
    else if (cls.includes("পঞ্চম")) classCode = "05";
    return `DLM-2026-${classCode}${cleanRoll.padStart(3, "0")}`;
  };

  // Helper to get Seat Number
  const getSeatNo = (roll: string) => {
    const clean = fromBn(roll).replace(/[^\d]/g, "") || "1";
    const num = parseInt(clean, 10);
    const room = num <= 25 ? "১" : num <= 50 ? "২" : "৩";
    return { roomNo: `কক্ষ-${room}`, seatNo: `আসন নং-${toBn(clean)}` };
  };

  // Generate batch or single card items
  const cardItems = useMemo<GeneratedCardData[]>(() => {
    const targetStudents: { roll: string; name: string }[] = [];

    if (printScope === "single") {
      if (currentSingleStudent) {
        targetStudents.push(currentSingleStudent);
      }
    } else {
      // Entire Class
      targetStudents.push(...studentsInClass);
      // If user had manual roll entered that is not in class list, include it as well
      if (rollMode === "manual" && manualRoll) {
        const alreadyIn = studentsInClass.some(s => fromBn(s.roll) === fromBn(manualRoll));
        if (!alreadyIn) {
          targetStudents.push({ roll: manualRoll, name: manualStudentName });
        }
      }
    }

    const dateSummary = customExamDate || currentExam.defaultDate;

    return targetStudents.map(st => {
      const { roomNo, seatNo } = getSeatNo(st.roll);
      const indexNo = getIndexNumber(selectedClass, st.roll);
      const id = `admit-${selectedClass}-${st.roll}`;
      return {
        id,
        studentName: st.name,
        className: selectedClass,
        roll: toBn(st.roll),
        indexNo,
        seatNo,
        roomNo,
        examName: currentExam.name,
        examDateSummary: dateSummary,
        isSingleDay: currentExam.isSingleDay,
        qrDataUrl: qrCache[id] || ""
      };
    });
  }, [printScope, currentSingleStudent, studentsInClass, rollMode, manualRoll, manualStudentName, customExamDate, currentExam, selectedClass, qrCache]);

  // Generate QR Codes for cards
  useEffect(() => {
    cardItems.forEach(card => {
      if (!qrCache[card.id]) {
        const payload = JSON.stringify({
          school: "D-Likon Model Academy",
          exam: card.examName,
          name: card.studentName,
          class: card.className,
          roll: card.roll,
          index: card.indexNo,
          seat: card.seatNo,
          securityPass: "VERIFIED_VALID"
        });

        QRCode.toDataURL(payload, {
          width: 120,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" }
        })
          .then(url => {
            setQrCache(prev => ({ ...prev, [card.id]: url }));
          })
          .catch(err => console.error("QR Error:", err));
      }
    });
  }, [cardItems, qrCache]);

  // Chunk cards into groups of 4 (4 Admit Cards per A4 sheet)
  const a4Pages = useMemo(() => {
    const pages: GeneratedCardData[][] = [];
    for (let i = 0; i < cardItems.length; i += 4) {
      pages.push(cardItems.slice(i, i + 4));
    }
    return pages;
  }, [cardItems]);

  // Handle Save Manual Student to class roster
  const handleSaveManualStudentToRoster = () => {
    if (!manualRoll.trim() || !manualStudentName.trim()) {
      alert("অনুগ্রহ করে রোল নম্বর এবং শিক্ষার্থীর নাম সঠিকভাবে পূরণ করুন।");
      return;
    }

    try {
      addOrUpdateStudentToClass(
        selectedClass,
        manualRoll.trim(),
        manualStudentName.trim(),
        manualFatherName.trim()
      );
      setIsSavedToRoster(true);
      setSelectedRoll(manualRoll.trim());
      setRosterToast(`সাফল্যের সাথে ${selectedClass} শ্রেণির তালিকায় রোল ${toBn(manualRoll)} (${manualStudentName}) স্থায়ীভাবে সংরক্ষিত হয়েছে!`);
      setTimeout(() => setRosterToast(""), 4500);
    } catch (err: any) {
      alert("সংরক্ষণ করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  // Schedule for back page
  const terminalSchedule = DEFAULT_TERMINAL_SCHEDULE[selectedClass] || DEFAULT_TERMINAL_SCHEDULE["default"];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ======================= NO-PRINT CONTROLS PANEL ======================= */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white space-y-5 shadow-2xl">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
              <FileBadge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  ডি-লিকন মডেল একাডেমী • অফিসিয়াল এডমিট কার্ড জেনারেটর
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-black">
                  A4 উভয় পিঠে ৪টি কার্ড
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                সাময়িক ও মিডটার্ম পরীক্ষার স্বয়ংক্রিয় এডমিট কার্ড, কমন সমসূচী ও শিক্ষার্থী নির্দেশনাবলী
              </p>
            </div>
          </div>

          {/* Quick Print Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-xl shadow-emerald-950/60 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>A4 এডমিট কার্ড প্রিন্ট / PDF ডাউনলোড</span>
            </button>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {rosterToast && (
          <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{rosterToast}</span>
          </div>
        )}

        {/* MAIN CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* CONTROL 1: EXAM TYPE & CATEGORY */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="font-bold text-amber-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>১. পরীক্ষার ধরন ও শিরোনাম:</span>
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded-lg p-2 outline-none focus:border-amber-400 text-xs"
            >
              <optgroup label="📋 ক্যাটাগরি ১: সাময়িক পরীক্ষা (কয়েকদিন ব্যাপী আলাদা পরীক্ষা)">
                <option value="term-1">প্রথম সাময়িক পরীক্ষা ২০২৬</option>
                <option value="term-2">দ্বিতীয় সাময়িক পরীক্ষা ২০২৬</option>
                <option value="term-final">বার্ষিক পরীক্ষা ২০২৬</option>
              </optgroup>
              <optgroup label="🎯 ক্যাটাগরি ২: মিডটার্ম পরীক্ষা (১ দিনে ১টি প্রশ্নপত্র)">
                <option value="mid-1-t1">প্রথম মিডটার্ম পরীক্ষা (প্রথম সাময়িক)</option>
                <option value="mid-2-t1">দ্বিতীয় মিডটার্ম পরীক্ষা (প্রথম সাময়িক)</option>
                <option value="mid-1-t2">প্রথম মিডটার্ম পরীক্ষা (দ্বিতীয় সাময়িক)</option>
                <option value="mid-2-t2">দ্বিতীয় মিডটার্ম পরীক্ষা (দ্বিতীয় সাময়িক)</option>
                <option value="mid-1-final">প্রথম মিডটার্ম পরীক্ষা (বার্ষিক পরীক্ষা)</option>
                <option value="mid-2-final">দ্বিতীয় মিডটার্ম পরীক্ষা (বার্ষিক পরীক্ষা)</option>
              </optgroup>
            </select>
            <div className="text-[10px] text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-800">
              {currentExam.isSingleDay ? (
                <span className="text-amber-300 font-semibold">
                  ⚡ মিডটার্ম: ১ দিনের জন্য একটিমাত্র প্রশ্নপত্রে অনুষ্ঠিত হবে।
                </span>
              ) : (
                <span className="text-emerald-300 font-semibold">
                  📅 সাময়িক: প্রতিদিন আলাদা আলাদা বিষয়ে পরীক্ষা অনুষ্ঠিত হবে।
                </span>
              )}
            </div>
          </div>

          {/* CONTROL 2: CLASS SELECTION */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>২. শ্রেণি নির্বাচন:</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded-lg p-2 outline-none focus:border-indigo-400 text-xs"
            >
              {CLASS_LIST.map(c => (
                <option key={c} value={c}>
                  {c} {c === "নার্সারি" ? "(Nursery)" : ""}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-slate-400 flex justify-between items-center">
              <span>তালিকায় মোট শিক্ষার্থী:</span>
              <span className="font-mono font-bold text-amber-300">{toBn(studentsInClass.length)} জন</span>
            </div>
          </div>

          {/* CONTROL 3: PRINT SCOPE (১ জন বনাম পুরো ক্লাস) */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="font-bold text-teal-300 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-teal-400" />
              <span>৩. প্রিন্ট দেওয়ার অপশন:</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setPrintScope("single")}
                className={`p-2 rounded-lg text-center font-bold transition cursor-pointer text-xs ${
                  printScope === "single"
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                ১. সুনির্দিষ্ট একজন
              </button>
              <button
                type="button"
                onClick={() => setPrintScope("class_batch")}
                className={`p-2 rounded-lg text-center font-bold transition cursor-pointer text-xs ${
                  printScope === "class_batch"
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                ২. পুরো ক্লাসের সকলে
              </button>
            </div>
            <div className="text-[10px] text-slate-400">
              {printScope === "single"
                ? "নির্বাচিত ১ জন শিক্ষার্থীর জন্য ৪টি কার্ডের ফরম্যাটে ১টি কার্ড"
                : `ক্লাসের সকল ${toBn(studentsInClass.length)} জনের এডমিট (প্রতি A4 পেজে ৪টি করে)`}
            </div>
          </div>

          {/* CONTROL 4: PAGE SIDES TO DISPLAY/PRINT */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="font-bold text-rose-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>৪. উভয় পিঠ / প্রিভিউ পেজ:</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setSideView("both")}
                className={`p-1.5 rounded-lg text-center font-bold transition cursor-pointer text-[11px] ${
                  sideView === "both"
                    ? "bg-amber-600 text-white ring-2 ring-amber-400"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                উভয় পিঠ
              </button>
              <button
                type="button"
                onClick={() => setSideView("front")}
                className={`p-1.5 rounded-lg text-center font-bold transition cursor-pointer text-[11px] ${
                  sideView === "front"
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                ফ্রন্ট পেজ
              </button>
              <button
                type="button"
                onClick={() => setSideView("back")}
                className={`p-1.5 rounded-lg text-center font-bold transition cursor-pointer text-[11px] ${
                  sideView === "back"
                    ? "bg-teal-600 text-white ring-2 ring-teal-400"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                ব্যাক পেজ
              </button>
            </div>
            <div className="text-[10px] text-slate-400">
              {sideView === "both"
                ? "ফ্রন্ট পেজে কার্ড এবং ব্যাক পেজে সমসূচী ও নির্দেশনা"
                : sideView === "front"
                ? "শুধুমাত্র ফ্রন্ট পেজ (Admit Passes)"
                : "শুধুমাত্র ব্যাক পেজ (রুটিন ও নির্দেশনা)"}
            </div>
          </div>
        </div>

        {/* ======================= ROLL SELECTION & MANUAL ROLL INPUT (E.G. NURSERY ROLL 28) ======================= */}
        <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>রোল নির্বাচন ও ম্যানুয়াল রোল ইনপুট (Manual Roll Entry)</span>
              </span>
              {isRoll28Missing && selectedClass === "নার্সারি" && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-bold animate-pulse">
                  ⚠ নার্সারি তালিকায় রোল ২৮ নেই — সরাসরি নিচে টাইপ করে এন্ট্রি দিন
                </span>
              )}
            </div>

            {/* Switch Mode: From List vs Manual */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRollMode("from_list")}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  rollMode === "from_list"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                তালিকা থেকে রোল পছন্দ
              </button>
              <button
                type="button"
                onClick={() => setRollMode("manual")}
                className={`px-3 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  rollMode === "manual"
                    ? "bg-amber-600 text-slate-950 font-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>✍️ ম্যানুয়াল রোল লিখুন (যেমন: ২৮)</span>
              </button>
            </div>
          </div>

          {/* IF MODE = FROM LIST */}
          {rollMode === "from_list" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  তালিকাভুক্ত শিক্ষার্থী নির্বাচন:
                </label>
                <select
                  value={selectedRoll}
                  onChange={(e) => setSelectedRoll(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs font-bold outline-none focus:border-indigo-400"
                >
                  {studentsInClass.map(s => (
                    <option key={s.roll} value={s.roll}>
                      রোল {toBn(s.roll)}: {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">নির্বাচিত পরীক্ষার্থী:</span>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-200 font-bold truncate">
                  {currentSingleStudent?.name} • রোল: {toBn(currentSingleStudent?.roll)}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setRollMode("manual");
                    setManualRoll("২৮");
                    setManualStudentName("");
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>তালিকায় রোল না থাকলে ম্যানুয়ালি লিখুন</span>
                </button>
              </div>
            </div>
          ) : (
            /* IF MODE = MANUAL INPUT (E.G. NURSERY ROLL 28) */
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>ম্যানুয়াল ডাটা ইনপুট (যেমন: নার্সারি শ্রেণির রোল ২৮):</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  এখানে লিখলেই সরাসরি এডমিট কার্ড প্রস্তুত হবে এবং চাইলে এক ক্লিকে স্থায়ীভাবে সেভ করা যাবে
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">রোল নম্বর:*</label>
                  <input
                    type="text"
                    value={manualRoll}
                    onChange={(e) => setManualRoll(e.target.value)}
                    placeholder="যেমন: ২৮ বা 28"
                    className="w-full bg-slate-950 border border-amber-400 font-mono font-bold text-amber-300 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">শিক্ষার্থীর নাম:*</label>
                  <input
                    type="text"
                    value={manualStudentName}
                    onChange={(e) => setManualStudentName(e.target.value)}
                    placeholder="যেমন: তৈয়বা আক্তার / তাসফিয়া জাহান"
                    className="w-full bg-slate-950 border border-slate-700 font-bold text-white rounded-lg p-2 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">পিতার নাম (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={manualFatherName}
                    onChange={(e) => setManualFatherName(e.target.value)}
                    placeholder="পিতার নাম"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Action: Save to roster button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  বর্তমান অবস্থা: <strong className="text-emerald-400">{selectedClass} শ্রেণির রোল {toBn(manualRoll)} ({manualStudentName || "..."})</strong>-এর এডমিট প্রিভিউ সক্রিয়।
                </span>

                <button
                  type="button"
                  onClick={handleSaveManualStudentToRoster}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-200" />
                  <span>💾 এই শিক্ষার্থীকে {selectedClass} তালিকার স্থায়ী ডাটাবেসে সেভ করুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================= PRINTABLE CANVAS (A4 4-PER-SHEET DUAL SIDED) ======================= */}
      <div className="space-y-10">
        {a4Pages.map((pageCards, pageIndex) => (
          <div key={`sheet-${pageIndex}`} className="space-y-8">
            {/* -------------------- 1. FRONT SIDE: 4 ADMIT CARDS PER A4 -------------------- */}
            {(sideView === "both" || sideView === "front") && (
              <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-6 shadow-2xl print:p-0 print:border-none print:shadow-none print:m-0 a4-sheet front-sheet font-sans text-slate-950">
                <div className="text-center no-print mb-2 text-xs font-black text-slate-500">
                  📄 A4 ফ্রন্ট পেইজ — পৃষ্ঠা {toBn(pageIndex + 1)} (৪টি এডমিট কার্ড)
                </div>

                {/* 2x2 Grid of 4 Cards fitting on standard A4 sheet */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 print:grid-cols-2 print:gap-2">
                  {pageCards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className="border-2 border-slate-900 rounded-xl p-3 bg-white relative flex flex-col justify-between print:rounded-lg print:border-2 text-[11px] leading-tight"
                      style={{ minHeight: "340px" }}
                    >
                      {/* Top Header of Single Admit Card */}
                      <div className="border-b-2 border-slate-900 pb-1.5 mb-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          {/* School Monogram / Emblem */}
                          <div className="w-11 h-11 border border-slate-800 rounded-lg flex flex-col items-center justify-center bg-indigo-50/60 shrink-0 text-center shadow-sm">
                            <Building className="w-4 h-4 text-indigo-900 mb-0.5" />
                            <span className="text-[7px] font-black text-indigo-950 leading-none">ডি-লিকন</span>
                          </div>

                          {/* School Name & Title */}
                          <div className="text-center flex-1 min-w-0">
                            <span className="text-[7.5px] uppercase font-black tracking-widest text-slate-700 block leading-none">
                              গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-slate-950 tracking-tight leading-tight">
                              ডি-লিকন মডেল একাডেমী
                            </h3>
                            <p className="text-[8px] text-slate-700 font-bold leading-none">
                              আদর্শ চরিত্র গঠন, নৈতিকতা ও ডিজিটাল শিক্ষা ব্যবস্থাপনা
                            </p>
                            <div className="inline-block bg-slate-950 text-white text-[8.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                              প্রবেশপত্র (EXAM ADMIT CARD) — ২০২৬
                            </div>
                          </div>

                          {/* Security QR Code */}
                          <div className="w-11 h-11 border border-slate-800 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                            {card.qrDataUrl ? (
                              <img src={card.qrDataUrl} alt="QR Pass" className="w-10 h-10 object-contain" />
                            ) : (
                              <QrCode className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Exam Title */}
                        <div className="text-center font-black text-[11px] text-slate-950 mt-1 bg-amber-50/80 py-0.5 border-y border-amber-200">
                          পরীক্ষা: <span className="underline decoration-indigo-700 decoration-1">{card.examName}</span>
                        </div>
                      </div>

                      {/* Student Info Grid */}
                      <div className="border border-slate-800 p-2 rounded-lg bg-slate-50/70 print:bg-transparent grid grid-cols-2 gap-1.5 text-[10.5px]">
                        <div>
                          <span className="text-slate-600 block text-[8.5px] font-bold">শিক্ষার্থীর নাম:</span>
                          <span className="font-black text-slate-950 text-[11.5px] truncate block">{card.studentName}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[8.5px] font-bold">শ্রেণি ও শাখা:</span>
                          <span className="font-black text-slate-950">{card.className} (ক-শাখা)</span>
                        </div>

                        <div>
                          <span className="text-slate-600 block text-[8.5px] font-bold">রোল নম্বর:</span>
                          <span className="font-black text-slate-950 font-mono text-sm bg-amber-200/60 px-1.5 py-0.2 rounded inline-block">
                            {card.roll}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[8.5px] font-bold">ইনডেক্স / আইডি নং:</span>
                          <span className="font-black font-mono text-[9px] text-slate-800 block">{card.indexNo}</span>
                        </div>

                        <div>
                          <span className="text-slate-600 block text-[8.5px] font-bold">আসন ও কক্ষ নং:</span>
                          <span className="font-bold text-slate-950">{card.roomNo}, {card.seatNo}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[8.5px] font-bold">পরীক্ষা কেন্দ্র:</span>
                          <span className="font-bold text-slate-950 text-[9.5px]">ডি-লিকন মূল ক্যাম্পাস</span>
                        </div>
                      </div>

                      {/* THE REQUESTED MOTIVATIONAL SLOGAN */}
                      <div className="my-1.5 p-1 text-center bg-indigo-50/90 print:bg-transparent border border-indigo-200/80 rounded font-serif">
                        <p className="text-[10px] font-black text-indigo-950 tracking-tight leading-tight">
                          “পরীক্ষা মানে সুযোগ, নিজেকে প্রমাণ করা”
                        </p>
                        <p className="text-[9px] font-extrabold text-indigo-900 tracking-tight leading-tight">
                          “হও ক্লাসে প্রথম, হও জীবনে প্রথম”
                        </p>
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[8.5px] font-black border-t border-dashed border-slate-400 mt-auto">
                        <div>
                          <div className="border-t border-slate-900 pt-0.5 w-16 mx-auto">শ্রেণি শিক্ষক</div>
                        </div>
                        <div>
                          <div className="border-t border-slate-900 pt-0.5 w-16 mx-auto">পরীক্ষা নিয়ন্ত্রক</div>
                        </div>
                        <div>
                          <div className="border-t border-slate-900 pt-0.5 w-20 mx-auto">প্রধান শিক্ষক (সিল)</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pad empty slots if less than 4 cards on page */}
                  {Array.from({ length: 4 - pageCards.length }).map((_, emptyIdx) => (
                    <div
                      key={`empty-${emptyIdx}`}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-300 text-xs font-bold no-print"
                      style={{ minHeight: "340px" }}
                    >
                      <span>(ফাঁকা স্লট - A4 সমতা বজায় রাখা হয়েছে)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- 2. BACK SIDE: COMMON EXAM ROUTINE & RULES -------------------- */}
            {(sideView === "both" || sideView === "back") && (
              <div
                className="bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-6 shadow-2xl print:p-0 print:border-none print:shadow-none print:m-0 a4-sheet back-sheet font-sans text-slate-950"
                style={{ pageBreakBefore: sideView === "both" ? "always" : "auto" }}
              >
                <div className="text-center no-print mb-2 text-xs font-black text-slate-500">
                  📄 A4 ব্যাক পেইজ — পৃষ্ঠা {toBn(pageIndex + 1)} (পরীক্ষার সমসূচী ও জরুরি সাধারণ নির্দেশনা)
                </div>

                {/* 2x2 Grid of 4 Back sides matching the front cards on reverse */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 print:grid-cols-2 print:gap-2">
                  {pageCards.map((card, idx) => (
                    <div
                      key={`back-${card.id || idx}`}
                      className="border-2 border-slate-900 rounded-xl p-3 bg-white flex flex-col justify-between print:rounded-lg print:border-2 text-[10.5px] leading-tight"
                      style={{ minHeight: "340px" }}
                    >
                      {/* Back Header */}
                      <div className="border-b-2 border-slate-900 pb-1 mb-1 text-center">
                        <h4 className="text-xs font-black text-slate-950">
                          ডি-লিকন মডেল একাডেমী • পরীক্ষার সমসূচী ও নির্দেশনাবলী
                        </h4>
                        <span className="text-[9.5px] font-bold text-slate-800">
                          {card.examName} ({card.className} শ্রেণি)
                        </span>
                      </div>

                      {/* ROUTINE INFO */}
                      <div className="space-y-1 mb-1.5 flex-1">
                        <div className="flex items-center justify-between text-[10px] font-black border-b border-slate-300 pb-0.5">
                          <span className="text-slate-900 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>পরীক্ষার নির্ধারিত সময়সূচি (Routine):</span>
                          </span>
                          <span className="text-indigo-900 font-bold font-mono">২০২৬ শিক্ষাবর্ষ</span>
                        </div>

                        {card.isSingleDay ? (
                          /* MIDTERM: SINGLE DAY EXAM INFO */
                          <div className="bg-amber-50 p-2 rounded-lg border border-amber-300 text-[10px] space-y-1">
                            <div className="font-black text-slate-950 flex justify-between">
                              <span>পরীক্ষা অনুষ্ঠানের তারিখ:</span>
                              <span className="font-mono underline text-indigo-950">{card.examDateSummary}</span>
                            </div>
                            <div className="text-slate-800 font-semibold">
                              সময়: <strong>সকাল ১০:০০ টা হতে দুপুর ১২:০০ টা পর্যন্ত</strong>
                            </div>
                            <div className="text-slate-700 font-medium text-[9px] bg-white p-1 rounded border border-amber-200">
                              ℹ️ <strong>বিশেষ দ্রষ্টব্য:</strong> মিডটার্ম পরীক্ষা ঐ ক্যাটাগরির মূল পরীক্ষার পূর্বে একটিমাত্র প্রশ্নপত্রে ১ দিনের জন্য অনুষ্ঠিত হবে। সকল বিষয় থেকে সমন্বিত প্রশ্ন থাকবে।
                            </div>
                          </div>
                        ) : (
                          /* TERMINAL: MULTI-DAY ROUTINE TABLE */
                          <table className="w-full border-collapse border border-slate-800 text-[9px]">
                            <thead>
                              <tr className="bg-slate-100 font-black text-center">
                                <th className="border border-slate-800 p-0.5 w-16">তারিখ</th>
                                <th className="border border-slate-800 p-0.5 w-12">বার</th>
                                <th className="border border-slate-800 p-0.5 text-left pl-1">বিষয়</th>
                                <th className="border border-slate-800 p-0.5 w-24">সময়</th>
                              </tr>
                            </thead>
                            <tbody>
                              {terminalSchedule.slice(0, 5).map((item, tIdx) => (
                                <tr key={tIdx} className="text-center">
                                  <td className="border border-slate-800 p-0.5 font-bold font-mono">{toBn(item.date)}</td>
                                  <td className="border border-slate-800 p-0.5">{item.day}</td>
                                  <td className="border border-slate-800 p-0.5 text-left pl-1 font-bold">{item.subject}</td>
                                  <td className="border border-slate-800 p-0.5 font-mono text-[8px]">{toBn(item.time)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* COMMON EXAM RULES & INSTRUCTIONS */}
                      <div className="border border-slate-800 p-1.5 rounded bg-slate-50/50 print:bg-transparent text-[8.5px] space-y-0.5 mt-auto">
                        <span className="font-black text-slate-950 block border-b border-slate-300 pb-0.5">
                          পরীক্ষার্থীদের জন্য ১০টি জরুরি নির্দেশনা:
                        </span>
                        <ol className="list-decimal pl-3 space-y-0.5 text-slate-800 font-medium">
                          {EXAM_RULES.slice(0, 5).map((r, rIdx) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Footer Note */}
                      <div className="pt-1.5 border-t border-slate-400 mt-1 flex items-center justify-between text-[8px] font-bold text-slate-600">
                        <span>আদর্শ শিক্ষা ও সততার প্রতীক — ডি-লিকন একাডেমি</span>
                        <span>রোল: {card.roll}</span>
                      </div>
                    </div>
                  ))}

                  {/* Pad empty slots */}
                  {Array.from({ length: 4 - pageCards.length }).map((_, emptyIdx) => (
                    <div
                      key={`empty-back-${emptyIdx}`}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-300 text-xs font-bold no-print"
                      style={{ minHeight: "340px" }}
                    >
                      <span>(ফাঁকা ব্যাক স্লট)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
