import React, { useState, useMemo } from "react";
import { 
  Home, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  X, 
  ChevronDown, 
  FileText, 
  Eye, 
  Save, 
  User,
  ArrowLeft,
  CheckSquare,
  Square
} from "lucide-react";
import { 
  HomeVisitRecord, 
  STUDENT_STATE_OPTIONS, 
  STUDY_ENV_OPTIONS, 
  PARENT_RESPONSIBILITY_OPTIONS 
} from "../homeVisitData";

interface HomeVisitManagerProps {
  visits: HomeVisitRecord[];
  onSaveVisit: (visit: HomeVisitRecord) => Promise<void>;
  onDeleteVisit: (id: string) => Promise<void>;
  currentStudent: {
    name: string;
    class: string;
    roll: string;
  };
  schoolName: string;
  teacherName?: string;
  onSelectStudentForRoutine?: (name: string, studentClass: string, roll: string) => void;
}

export const HomeVisitManager: React.FC<HomeVisitManagerProps> = ({
  visits,
  onSaveVisit,
  onDeleteVisit,
  currentStudent,
  schoolName = "ডি-লিকন মডেল একাডেমী",
  teacherName = "শ্রেণি শিক্ষক",
  onSelectStudentForRoutine
}) => {
  // Main view switcher: Single Form (default view) vs Batch Sheet vs Database vs View Completed Report
  const [activeSubTab, setActiveSubTab] = useState<"single_sheet" | "batch_sheet" | "database" | "view_report">("single_sheet");
  
  // Customization options for printable single sheet
  const [sheetFillMode, setSheetFillMode] = useState<"prefilled" | "blank">(
    currentStudent.name ? "prefilled" : "blank"
  );
  const [customStudentName, setCustomStudentName] = useState(currentStudent.name || "");
  const [customStudentClass, setCustomStudentClass] = useState(currentStudent.class || "৮ম শ্রেণি");
  const [customStudentRoll, setCustomStudentRoll] = useState(currentStudent.roll || "০১");
  const [customTeacherName, setCustomTeacherName] = useState(teacherName || "শ্রেণি শিক্ষক");
  const [customVisitDate, setCustomVisitDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Search & Filter for database
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  
  // Modal & Printing States
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<HomeVisitRecord | null>(null);
  const [selectedReport, setSelectedReport] = useState<HomeVisitRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Entry Modal
  const [formData, setFormData] = useState<Partial<HomeVisitRecord>>({
    studentName: currentStudent.name || "",
    studentClass: currentStudent.class || "৮ম শ্রেণি",
    studentRoll: currentStudent.roll || "০১",
    location: "",
    visitDate: new Date().toISOString().split("T")[0],
    visitTime: "সন্ধ্যা ০৭:০০",
    teacherName: teacherName,
    studentState: "at_study_desk",
    studentStateDetails: "",
    studyEnvironment: "tidy",
    parentResponsibility: "highly_attentive",
    counselingNotes: "",
    studentCommitment: "",
    parentRemarks: "",
    followUpDate: "",
    overallScore: 4
  });

  const openNewEntry = (prefillCurrentStudent: boolean = false) => {
    setEditingVisit(null);
    setFormData({
      studentName: prefillCurrentStudent ? currentStudent.name : "",
      studentClass: prefillCurrentStudent ? currentStudent.class : "৮ম শ্রেণি",
      studentRoll: prefillCurrentStudent ? currentStudent.roll : "",
      location: "",
      visitDate: new Date().toISOString().split("T")[0],
      visitTime: "সন্ধ্যা ০৭:০০",
      teacherName: teacherName || "শ্রেণি শিক্ষক",
      studentState: "at_study_desk",
      studentStateDetails: "",
      studyEnvironment: "tidy",
      parentResponsibility: "highly_attentive",
      counselingNotes: "",
      studentCommitment: "",
      parentRemarks: "",
      followUpDate: "",
      overallScore: 4
    });
    setShowEntryModal(true);
  };

  const openEditEntry = (visit: HomeVisitRecord) => {
    setEditingVisit(visit);
    setFormData({ ...visit });
    setShowEntryModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName?.trim()) {
      alert("শিক্ষার্থীর নাম আবশ্যক!");
      return;
    }
    setIsSubmitting(true);
    try {
      const record: HomeVisitRecord = {
        id: editingVisit ? editingVisit.id : `visit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        studentName: formData.studentName || "",
        studentClass: formData.studentClass || "৮ম শ্রেণি",
        studentRoll: formData.studentRoll || "০১",
        location: formData.location || "ঠিকানা উল্লেখ নেই",
        visitDate: formData.visitDate || new Date().toISOString().split("T")[0],
        visitTime: formData.visitTime || "সন্ধ্যা ০৭:০০",
        teacherName: formData.teacherName || teacherName,
        studentState: formData.studentState || "at_study_desk",
        studentStateDetails: formData.studentStateDetails || "",
        studyEnvironment: formData.studyEnvironment || "tidy",
        parentResponsibility: formData.parentResponsibility || "highly_attentive",
        counselingNotes: formData.counselingNotes || "",
        studentCommitment: formData.studentCommitment || "",
        parentRemarks: formData.parentRemarks || "",
        followUpDate: formData.followUpDate || "",
        overallScore: formData.overallScore || 4,
        updatedAt: new Date().toISOString()
      };
      await onSaveVisit(record);
      setShowEntryModal(false);
      setEditingVisit(null);
    } catch (err) {
      console.error(err);
      alert("রেকর্ড সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert numerals to Bengali
  const toBnNum = (n: number | string) => {
    const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(n).replace(/[0-9]/g, (d) => bn[parseInt(d)]);
  };

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchesSearch = 
        v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.studentRoll.includes(searchQuery) ||
        v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesState = filterState === "all" || v.studentState === filterState;
      const matchesClass = filterClass === "all" || v.studentClass === filterClass;

      return matchesSearch && matchesState && matchesClass;
    });
  }, [visits, searchQuery, filterState, filterClass]);

  // Statistics
  const stats = useMemo(() => {
    const total = visits.length;
    if (total === 0) return { total: 0, atDeskPercent: 0, atDeskCount: 0, outsideCount: 0, mobileCount: 0, highParentPercent: 0 };
    const atDeskCount = visits.filter(v => v.studentState === "at_study_desk").length;
    const outsideCount = visits.filter(v => v.studentState === "outside_roaming").length;
    const mobileCount = visits.filter(v => v.studentState === "tv_mobile").length;
    const highParentCount = visits.filter(v => v.parentResponsibility === "highly_attentive" || v.parentResponsibility === "supportive").length;

    return {
      total,
      atDeskCount,
      atDeskPercent: Math.round((atDeskCount / total) * 100),
      outsideCount,
      mobileCount,
      highParentPercent: Math.round((highParentCount / total) * 100)
    };
  }, [visits]);

  const handlePrintCurrentView = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[21.5cm] mx-auto space-y-5 pb-16">
      {/* 1. TOP HEADER & NAVIGATION TABS (NO-PRINT) */}
      <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-indigo-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold shadow-sm">
                <Home className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  <span>শিক্ষকদের আচমকা বাড়ি পরিদর্শন ও তদারকি ফরম</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-mono px-2.5 py-0.5 rounded-full font-black uppercase shadow-2xs">
                    প্রিন্ট ও ডেটাবেস
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  শিক্ষার্থীরা যেন পড়ার টেবিলে সবসময় সজাগ থাকে—ফিল্ডে নিয়ে যাওয়ার জন্য A4 প্রিন্ট ফরম ও ডিজিটাল রিপোর্ট।
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openNewEntry(false)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>নতুন পরিদর্শন এন্ট্রি</span>
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/15">
          <button
            type="button"
            onClick={() => setActiveSubTab("single_sheet")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === "single_sheet"
                ? "bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>📋 একক প্রিন্টেবল ফিল্ড ফরম</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("batch_sheet")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === "batch_sheet"
                ? "bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📑 বহু-শিক্ষার্থী ব্যাচ রেজিস্টার</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("database")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === "database" || activeSubTab === "view_report"
                ? "bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>📊 সংরক্ষিত ডেটাবেস লগ ({toBnNum(visits.length)})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW A: SINGLE STUDENT DETAILED PRINTABLE FORM                     */}
      {/* ========================================================================= */}
      {activeSubTab === "single_sheet" && (
        <div className="space-y-4">
          {/* Action & Customization Toolbar (NO-PRINT) */}
          <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>প্রিন্ট অপশন ও ফিল্ড কাস্টমাইজেশন:</span>
              </div>
              <button
                type="button"
                onClick={handlePrintCurrentView}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ এই ফরমটি এখনই প্রিন্ট করুন (A4)</span>
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">তথ্য পূরণ মোড:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSheetFillMode("prefilled")}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] border cursor-pointer ${
                      sheetFillMode === "prefilled"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    স্বয়ংক্রিয় পূরণ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetFillMode("blank")}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] border cursor-pointer ${
                      sheetFillMode === "blank"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    ফাঁকা ডট ডট
                  </button>
                </div>
              </div>

              {sheetFillMode === "prefilled" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম:</label>
                    <input
                      type="text"
                      value={customStudentName}
                      onChange={(e) => setCustomStudentName(e.target.value)}
                      placeholder="নাম লিখুন"
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">শ্রেণি ও রোল:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customStudentClass}
                        onChange={(e) => setCustomStudentClass(e.target.value)}
                        className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      />
                      <input
                        type="text"
                        value={customStudentRoll}
                        onChange={(e) => setCustomStudentRoll(e.target.value)}
                        className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">পরিদর্শনকারী শিক্ষক:</label>
                <input
                  type="text"
                  value={customTeacherName}
                  onChange={(e) => setCustomTeacherName(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-amber-50/80 border border-amber-200 p-2 rounded-lg flex items-center gap-2">
              <span className="text-amber-700 font-bold">💡 নির্দেশিকা:</span>
              <span>
                এটি শিক্ষকদের মাঠে নিয়ে যাওয়ার জন্য প্রস্তুতকৃত আদর্শ ১ পাতার A4 পরিদর্শন ফরম। প্রিন্ট করে ক্লিপবোর্ডে নিয়ে বাড়ি পরিদর্শন করুন এবং কলম দিয়ে দাগিয়ে তাৎক্ষণিক মূল্যায়ন করুন।
              </span>
            </div>
          </div>

          {/* THE PRINTABLE A4 SINGLE SHEET DISPLAY */}
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl border-2 border-slate-900 font-serif space-y-4 print:p-6 print:m-0 print:border-2 print:shadow-none print:w-[21cm]">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-wide">
                {schoolName}
              </h1>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 bg-slate-100 inline-block px-4 py-0.5 rounded border border-slate-400">
                শিক্ষকদের আচমকা বাড়ি পরিদর্শন ও ছাত্র পর্যবেক্ষণ ফরম (Surprise Field Visit Sheet)
              </h2>
              <p className="text-[11px] text-slate-700 italic">
                "শিক্ষার্থী যেন সর্বদা পড়ার টেবিলে সজাগ থাকে এবং পিতা-মাতার সচেতনতা প্রত্যক্ষভাবে মূল্যায়ন করা যায়"
              </p>
            </div>

            {/* Teacher & Visit Date Grid */}
            <table className="w-full border-collapse border border-slate-800 text-xs">
              <tbody>
                <tr>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50 w-40">পরিদর্শনকারী শিক্ষকের নাম:</td>
                  <td className="border border-slate-800 p-2 font-bold font-sans">
                    {customTeacherName || "......................................................................."}
                  </td>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50 w-32">পরিদর্শনের তারিখ:</td>
                  <td className="border border-slate-800 p-2 font-mono">
                    {sheetFillMode === "prefilled" && customVisitDate ? customVisitDate : "....... / ....... / ২০২...."}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50">পদবি ও মোবাইল নম্বর:</td>
                  <td className="border border-slate-800 p-2 font-mono">.......................................................................</td>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50">সঠিক সময় ও বার:</td>
                  <td className="border border-slate-800 p-2 font-mono">সময়: ............ বার: ............</td>
                </tr>
              </tbody>
            </table>

            {/* Student Information Box */}
            <div className="border border-slate-800 p-3 rounded space-y-2 bg-slate-50/40">
              <h3 className="text-xs font-black text-slate-950 border-b border-slate-400 pb-1">
                ১. শিক্ষার্থীর প্রাথমিক তথ্য ও লোকেশন
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  শিক্ষার্থীর নাম:{" "}
                  <span className="font-bold text-slate-900 font-sans">
                    {sheetFillMode === "prefilled" && customStudentName ? customStudentName : "................................................"}
                  </span>
                </div>
                <div>
                  শ্রেণি ও শাখা:{" "}
                  <span className="font-bold text-slate-900 font-sans">
                    {sheetFillMode === "prefilled" && customStudentClass ? customStudentClass : ".............................."}
                  </span>
                </div>
                <div>
                  রোল নম্বর:{" "}
                  <span className="font-bold text-slate-900 font-mono">
                    {sheetFillMode === "prefilled" && customStudentRoll ? toBnNum(customStudentRoll) : "...................."}
                  </span>
                </div>
              </div>
              <div className="text-xs pt-1">
                বাসার সুনির্দিষ্ট ঠিকানা / পাড়া: <span className="font-mono">....................................................................................................................................................</span>
              </div>
            </div>

            {/* CORE: Immediate Observation Checkboxes */}
            <div className="border-2 border-slate-900 p-3.5 rounded bg-white space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <h3 className="text-xs font-black text-slate-950">
                  ২. উপস্থিতিকালীন তাৎক্ষণিক অবস্থা (শিক্ষার্থীকে সরাসরি কি অবস্থায় পাওয়া গেল?)
                </h3>
                <span className="text-[10px] italic text-slate-600">[সঠিক ঘরে টিক (✓) দিন]</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded">
                  <span className="w-4 h-4 border-2 border-slate-800 inline-block rounded-xs"></span>
                  <span><strong>[A]</strong> পড়ার টেবিলে মনোযোগসহকারে পাঠরত</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded">
                  <span className="w-4 h-4 border-2 border-slate-800 inline-block rounded-xs"></span>
                  <span><strong>[B]</strong> ঘরে খেলাধুলা / ছোটাছুটিতে ব্যস্ত</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded">
                  <span className="w-4 h-4 border-2 border-slate-800 inline-block rounded-xs"></span>
                  <span><strong>[C]</strong> টিভি / স্মার্টফোনে গেম বা ভিডিওতে মগ্ন</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded">
                  <span className="w-4 h-4 border-2 border-slate-800 inline-block rounded-xs"></span>
                  <span><strong>[D]</strong> বাড়িতে ছিল না (বাইরে উদ্দেশ্যহীন ঘোরাঘুরি)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded">
                  <span className="w-4 h-4 border-2 border-slate-800 inline-block rounded-xs"></span>
                  <span><strong>[E]</strong> অসময়ে ঘুম / অলস অবস্থায় পাওয়া গেছে</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded">
                  <span className="w-4 h-4 border-2 border-slate-800 inline-block rounded-xs"></span>
                  <span><strong>[F]</strong> পারিবারিক কাজে ব্যস্ত / অন্যান্য</span>
                </div>
              </div>
            </div>

            {/* Environment & Parents Responsibility Checkboxes */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-800 p-2.5 rounded space-y-1.5">
                <h4 className="font-bold border-b border-slate-300 pb-1">৩. পড়ার টেবিল ও পরিবেশের মান:</h4>
                <div className="space-y-1">
                  <div>[ &nbsp; ] চমৎকার ও সুশৃঙ্খল পরিবেশ</div>
                  <div>[ &nbsp; ] পরিপাটি ও মোটামুটি শান্ত</div>
                  <div>[ &nbsp; ] মাঝারি / মনোযোগ বিক্ষিপ্ত পরিবেশ</div>
                  <div>[ &nbsp; ] বিশৃঙ্খল / পড়ার অনুকূল পরিবেশ নেই</div>
                </div>
              </div>

              <div className="border border-slate-800 p-2.5 rounded space-y-1.5">
                <h4 className="font-bold border-b border-slate-300 pb-1">৪. পিতামাতা/অভিভাবকের দায়িত্বশীলতা:</h4>
                <div className="space-y-1">
                  <div>[ &nbsp; ] অত্যন্ত সচেতন ও নিয়মিত তদারককারী</div>
                  <div>[ &nbsp; ] সহানুভূতিশীল ও পরামর্শ গ্রহণে সচেষ্ট</div>
                  <div>[ &nbsp; ] মোটামুটি / ব্যস্ততার কারণে খেয়াল কম রাখেন</div>
                  <div>[ &nbsp; ] উদাসীন / কোনো খোঁজখবর রাখেন না</div>
                  <div>[ &nbsp; ] পরিদর্শনকালে অভিভাবক অনুপস্থিত ছিলেন</div>
                </div>
              </div>
            </div>

            {/* Counseling & Guidance Notes (Lined area for writing) */}
            <div className="border border-slate-800 p-3 rounded space-y-1.5">
              <h3 className="text-xs font-black text-slate-950">
                ৫. শিক্ষক কর্তৃক প্রদত্ত তাৎক্ষণিক মোটিভেশন ও কাউন্সেলিং:
              </h3>
              <div className="h-16 flex flex-col justify-between py-1 text-slate-400 text-[10px]">
                <div className="border-b border-dashed border-slate-400 w-full h-5"></div>
                <div className="border-b border-dashed border-slate-400 w-full h-5"></div>
                <div className="border-b border-dashed border-slate-400 w-full h-5"></div>
              </div>
            </div>

            {/* Student Commitment & Parent Signature */}
            <div className="border border-slate-800 p-3 rounded space-y-1.5">
              <h3 className="text-xs font-black text-slate-950">
                ৬. শিক্ষার্থীর অঙ্গীকার ও অভিভাবকের মন্তব্য:
              </h3>
              <div className="text-xs space-y-1 pt-1">
                <div>শিক্ষার্থীর অঙ্গীকার: ........................................................................................................................................................</div>
                <div>অভিভাবকের মন্তব্য: ........................................................................................................................................................</div>
              </div>
            </div>

            {/* Signatures & Follow-up */}
            <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs border-t border-slate-800">
              <div>
                <div className="border-t border-slate-800 w-36 mx-auto pt-1 font-bold">শিক্ষার্থীর স্বাক্ষর</div>
                <span className="text-[10px] text-slate-500">তারিখসহ</span>
              </div>
              <div>
                <div className="border-t border-slate-800 w-36 mx-auto pt-1 font-bold">অভিভাবকের স্বাক্ষর</div>
                <span className="text-[10px] text-slate-500">মোবাইল নম্বরসহ</span>
              </div>
              <div>
                <div className="border-t border-slate-800 w-36 mx-auto pt-1 font-bold">পরিদর্শনকারী শিক্ষকের স্বাক্ষর</div>
                <span className="text-[10px] text-slate-500">পরবর্তী ভিজিট তারিখ: ...................</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW B: BATCH MULTI-STUDENT FIELD REGISTER SHEET                   */}
      {/* ========================================================================= */}
      {activeSubTab === "batch_sheet" && (
        <div className="space-y-4">
          <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">বহু-শিক্ষার্থী ফিল্ড রেজিস্টার চেকলিস্ট</h3>
              <p className="text-xs text-slate-500">
                একই দিনে একটি নির্দিষ্ট এলাকার একাধিক শিক্ষার্থীর বাড়ি পরিদর্শনের জন্য কম্প্যাক্ট চেকলিস্ট।
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrintCurrentView}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ ব্যাচ রেজিস্টার প্রিন্ট করুন (A4)</span>
            </button>
          </div>

          <div className="bg-white text-slate-900 p-6 sm:p-7 rounded-xl shadow-xl border-2 border-slate-900 font-serif space-y-3 print:p-4 print:m-0 print:border-2 print:shadow-none print:w-[21cm]">
            <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
              <h1 className="text-lg font-black text-slate-950 uppercase">{schoolName}</h1>
              <h2 className="text-xs font-bold text-slate-800">
                শিক্ষকদের আচমকা বাড়ি পরিদর্শন ও তদারকি রেজিস্টার শিট (Multi-Student Field Batch Log)
              </h2>
              <div className="flex justify-between text-[11px] text-slate-700 mt-1 font-sans">
                <span>পরিদর্শনকারী শিক্ষক: {customTeacherName || "......................................................."}</span>
                <span>তারিখ: ......../......../২০২....</span>
                <span>এলাকা/পাড়া: ........................................................</span>
              </div>
            </div>

            <table className="w-full border-collapse border-2 border-slate-900 text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-center font-bold">
                  <th className="border border-slate-800 p-1.5 w-7">ক্র.</th>
                  <th className="border border-slate-800 p-1.5 w-32">শিক্ষার্থীর নাম ও শ্রেণি</th>
                  <th className="border border-slate-800 p-1.5 w-12">রোল</th>
                  <th className="border border-slate-800 p-1.5 w-32">ঠিকানা / লোকেশন</th>
                  <th className="border border-slate-800 p-1.5 w-20">সময়</th>
                  <th className="border border-slate-800 p-1.5">উপস্থিতিকালীন অবস্থা (টিক দিন)</th>
                  <th className="border border-slate-800 p-1.5 w-24">অভিভাবক</th>
                  <th className="border border-slate-800 p-1.5 w-24">স্বাক্ষর</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => (
                  <tr key={idx} className="h-14">
                    <td className="border border-slate-800 p-1 text-center font-bold font-mono">{toBnNum(idx)}</td>
                    <td className="border border-slate-800 p-1 font-sans"></td>
                    <td className="border border-slate-800 p-1 text-center font-mono"></td>
                    <td className="border border-slate-800 p-1"></td>
                    <td className="border border-slate-800 p-1 text-center"></td>
                    <td className="border border-slate-800 p-1 text-[9.5px]">
                      <div className="grid grid-cols-2 gap-1">
                        <div>[ ] পড়ার টেবিলে</div>
                        <div>[ ] খেলাধুলা/ছোটাছুটি</div>
                        <div>[ ] মোবাইল/টিভিতে</div>
                        <div>[ ] বাইরে উদ্দেশ্যহীন</div>
                      </div>
                    </td>
                    <td className="border border-slate-800 p-1 text-[9.5px]">
                      <div>[ ] সচেতন</div>
                      <div>[ ] মাঝারি</div>
                      <div>[ ] উদাসীন</div>
                    </td>
                    <td className="border border-slate-800 p-1 text-center align-bottom pb-1 text-[9px] text-slate-400">
                      স্বাক্ষর ও ফোন
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center text-[10.5px] mt-4 pt-2 border-t border-slate-800">
              <div>সার্বিক মন্তব্য: ........................................................................................................................</div>
              <div className="font-bold">পরিদর্শনকারী শিক্ষকের স্বাক্ষর: ....................................................</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-VIEW C: SAVED VISITS DATABASE & LOGS                                */}
      {/* ========================================================================= */}
      {activeSubTab === "database" && (
        <div className="space-y-4">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
              <span className="text-[11px] font-bold text-slate-500">মোট সম্পন্ন পরিদর্শন</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1">{toBnNum(stats.total)}</span>
              <span className="text-[10px] text-slate-400 mt-1">মাঠপর্যায়ে বাড়ি ভিজিট</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs flex flex-col">
              <span className="text-[11px] font-bold text-emerald-700">পড়ার টেবিলে পাওয়া গেছে</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-emerald-800 font-mono">{toBnNum(stats.atDeskPercent)}%</span>
                <span className="text-xs text-emerald-600 font-bold font-mono">({toBnNum(stats.atDeskCount)} জন)</span>
              </div>
              <span className="text-[10px] text-emerald-600/80 mt-1">সচেতন ও টেবিলে উপস্থিত</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs flex flex-col">
              <span className="text-[11px] font-bold text-rose-700">খেলাধুলা / মোবাইল / বাইরে</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-rose-800 font-mono">{toBnNum(stats.outsideCount + stats.mobileCount)}</span>
                <span className="text-xs text-rose-600 font-bold">জন শিক্ষার্থী</span>
              </div>
              <span className="text-[10px] text-rose-600/80 mt-1">তাৎক্ষণিক কাউন্সেলিং প্রদত্ত</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs flex flex-col">
              <span className="text-[11px] font-bold text-indigo-700">অভিভাবক সচেতনতার হার</span>
              <span className="text-2xl font-black text-indigo-900 font-mono mt-1">{toBnNum(stats.highParentPercent)}%</span>
              <span className="text-[10px] text-indigo-500 mt-1">সচেতন ও সহযোগী পিতামাতা</span>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="শিক্ষার্থীর নাম, রোল, লোকেশন দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Status Filter */}
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">সব অবস্থা ({toBnNum(visits.length)})</option>
                  <option value="at_study_desk">📖 পড়ার টেবিলে ছিল</option>
                  <option value="playing_home">🏃 ঘরে খেলাধুলায় ছিল</option>
                  <option value="tv_mobile">📱 মোবাইল/টিভিতে মগ্ন</option>
                  <option value="outside_roaming">🚫 বাইরে ঘোরাঘুরি করছিল</option>
                </select>
              </div>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">সকল শ্রেণি</option>
                <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
              </select>
            </div>
          </div>

          {/* VISITS RECORD LIST */}
          <div className="space-y-3">
            {filteredVisits.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">কোনো আচমকা পরিদর্শন রেকর্ড পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  শিক্ষকদের ফিল্ড ভিজিটের তথ্য এন্ট্রি দিতে <strong>'নতুন পরিদর্শন এন্ট্রি'</strong> বাটনে ক্লিক করুন অথবা মাঠপর্যায়ে নিয়ে যাওয়ার জন্য <strong>'একক প্রিন্টেবল ফিল্ড ফরম'</strong> ব্যবহার করুন।
                </p>
                <button
                  type="button"
                  onClick={() => openNewEntry(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold transition hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  প্রথম ভিজিট রেকর্ড এন্ট্রি করুন
                </button>
              </div>
            ) : (
              filteredVisits.map((v) => {
                const stateOpt = STUDENT_STATE_OPTIONS.find(s => s.value === v.studentState) || STUDENT_STATE_OPTIONS[0];
                const envOpt = STUDY_ENV_OPTIONS.find(e => e.value === v.studyEnvironment);
                const parentOpt = PARENT_RESPONSIBILITY_OPTIONS.find(p => p.value === v.parentResponsibility);

                return (
                  <div 
                    key={v.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                          {stateOpt.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{v.studentName}</h4>
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {v.studentClass} • রোল: {toBnNum(v.studentRoll)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{v.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-2xs flex items-center gap-1 ${stateOpt.badgeClass}`}>
                          <span>{stateOpt.icon}</span>
                          <span>{stateOpt.shortLabel}</span>
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReport(v);
                              setActiveSubTab("view_report");
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                            title="এই ভিজিটের পূর্ণাঙ্গ রিপোর্ট দেখুন ও প্রিন্ট করুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditEntry(v)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`আপনি কি ${v.studentName}-এর এই ভিজিট রেকর্ডটি ডিলিট করতে চান?`)) {
                                onDeleteVisit(v.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mid Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">পরিদর্শনের সময় ও শিক্ষক</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.visitDate} ({v.visitTime})</span>
                        </div>
                        <span className="text-[11px] text-slate-600 mt-0.5 block">শিক্ষক: {v.teacherName}</span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">পড়ার টেবিল ও পরিবেশ</span>
                        <span className="font-bold text-slate-800">{envOpt?.label || v.studyEnvironment}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          রেটিং: {[...Array(v.overallScore || 4)].map((_, i) => "⭐").join("")}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">পিতামাতার তদারকি</span>
                        <span className="font-bold text-slate-800">{parentOpt?.label || v.parentResponsibility}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5 truncate" title={v.parentRemarks}>
                          {v.parentRemarks || "কোনো মন্তব্য নেই"}
                        </span>
                      </div>
                    </div>

                    {/* Counseling Notes & Commitment */}
                    {(v.counselingNotes || v.studentCommitment) && (
                      <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/70 text-xs space-y-1.5">
                        {v.counselingNotes && (
                          <div className="flex items-start gap-1.5 text-slate-800">
                            <span className="font-bold text-amber-900 shrink-0">কাউন্সেলিং নোট:</span>
                            <span className="leading-relaxed">{v.counselingNotes}</span>
                          </div>
                        )}
                        {v.studentCommitment && (
                          <div className="flex items-start gap-1.5 text-slate-800 pt-1 border-t border-amber-200/50">
                            <span className="font-bold text-emerald-900 shrink-0">শিক্ষার্থীর ওয়াদা:</span>
                            <span className="italic text-emerald-800">"{v.studentCommitment}"</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
                      {v.followUpDate ? (
                        <span className="flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          <Clock className="w-3 h-3" />
                          <span>পরবর্তী সম্ভাব্য ফলো-আপ: {v.followUpDate}</span>
                        </span>
                      ) : <span></span>}

                      {onSelectStudentForRoutine && (
                        <button
                          type="button"
                          onClick={() => onSelectStudentForRoutine(v.studentName, v.studentClass, v.studentRoll)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer underline"
                        >
                          <span>এই শিক্ষার্থীর মাসিক রুটিনে যান</span>
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-VIEW D: SINGLE COMPLETED INSPECTION REPORT VIEW                     */}
      {/* ========================================================================= */}
      {activeSubTab === "view_report" && selectedReport && (
        <div className="space-y-4">
          <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveSubTab("database")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← তালিকায় ফিরে যান</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCurrentView}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ এই পরিদর্শন প্রতিবেদনটি প্রিন্ট করুন</span>
            </button>
          </div>

          {/* COMPLETED REPORT SHEET */}
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl border-2 border-slate-900 font-serif space-y-4 print:p-6 print:m-0 print:border-2 print:shadow-none print:w-[21cm]">
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <h1 className="text-xl font-black text-slate-950">{schoolName}</h1>
              <h2 className="text-sm font-bold bg-slate-100 inline-block px-3 py-1 rounded border border-slate-400">
                আচমকা বাড়ি পরিদর্শন ও ছাত্র কাউন্সেলিং রিপোর্ট
              </h2>
              <p className="text-xs text-slate-600">রেকর্ড আইডি: {selectedReport.id}</p>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-xs">
              <tbody>
                <tr>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50 w-36">শিক্ষার্থীর নাম:</td>
                  <td className="border border-slate-800 p-2 font-bold text-sm">{selectedReport.studentName}</td>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50 w-28">শ্রেণি ও রোল:</td>
                  <td className="border border-slate-800 p-2">{selectedReport.studentClass}, রোল: {toBnNum(selectedReport.studentRoll)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50">বাসার লোকেশন/ঠিকানা:</td>
                  <td className="border border-slate-800 p-2" colSpan={3}>{selectedReport.location}</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50">পরিদর্শনের তারিখ ও সময়:</td>
                  <td className="border border-slate-800 p-2">{selectedReport.visitDate} ({selectedReport.visitTime})</td>
                  <td className="border border-slate-800 p-2 font-bold bg-slate-50">পরিদর্শনকারী শিক্ষক:</td>
                  <td className="border border-slate-800 p-2 font-bold">{selectedReport.teacherName}</td>
                </tr>
              </tbody>
            </table>

            <div className="border-2 border-slate-900 p-3.5 rounded bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">উপস্থিতিকালীন তাৎক্ষণিক অবস্থা:</span>
                <span className="font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                  {STUDENT_STATE_OPTIONS.find(s => s.value === selectedReport.studentState)?.label}
                </span>
              </div>
              {selectedReport.studentStateDetails && (
                <p className="text-xs text-slate-700 italic border-t border-slate-300 pt-1">
                  বিস্তারিত অবস্থা: {selectedReport.studentStateDetails}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-800 p-2.5 rounded">
                <span className="font-bold block mb-1">পড়ার টেবিল ও পরিবেশ:</span>
                <span>{STUDY_ENV_OPTIONS.find(e => e.value === selectedReport.studyEnvironment)?.label}</span>
              </div>
              <div className="border border-slate-800 p-2.5 rounded">
                <span className="font-bold block mb-1">পিতামাতা/অভিভাবকের তদারকি:</span>
                <span>{PARENT_RESPONSIBILITY_OPTIONS.find(p => p.value === selectedReport.parentResponsibility)?.label}</span>
              </div>
            </div>

            {selectedReport.counselingNotes && (
              <div className="border border-slate-800 p-3 rounded space-y-1 text-xs">
                <span className="font-bold block">শিক্ষক কর্তৃক প্রদত্ত তাৎক্ষণিক কাউন্সেলিং ও করণীয়:</span>
                <p className="text-slate-800 leading-relaxed">{selectedReport.counselingNotes}</p>
              </div>
            )}

            {selectedReport.studentCommitment && (
              <div className="border border-slate-800 p-3 rounded space-y-1 text-xs bg-amber-50/40">
                <span className="font-bold block">শিক্ষার্থীর অঙ্গীকার:</span>
                <p className="italic text-slate-800">"{selectedReport.studentCommitment}"</p>
              </div>
            )}

            {selectedReport.parentRemarks && (
              <div className="border border-slate-800 p-3 rounded space-y-1 text-xs">
                <span className="font-bold block">অভিভাবকের প্রতিক্রিয়া ও মন্তব্য:</span>
                <p className="text-slate-800">{selectedReport.parentRemarks}</p>
              </div>
            )}

            <div className="pt-8 grid grid-cols-2 gap-4 text-center text-xs border-t border-slate-800">
              <div>
                <div className="border-t border-slate-800 w-44 mx-auto pt-1 font-bold">অভিভাবকের স্বাক্ষর</div>
              </div>
              <div>
                <div className="border-t border-slate-800 w-44 mx-auto pt-1 font-bold">পরিদর্শনকারী শিক্ষকের স্বাক্ষর</div>
                {selectedReport.followUpDate && (
                  <span className="text-[11px] text-slate-600 block mt-1">পরবর্তী সম্ভাব্য ভিজিট: {selectedReport.followUpDate}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DATA ENTRY & EDIT MODAL (NO-PRINT)                                     */}
      {/* ========================================================================= */}
      {showEntryModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm no-print overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-indigo-200 my-8 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingVisit ? "পরিদর্শন রেকর্ড সম্পাদনা" : "নতুন আচমকা বাড়ি পরিদর্শন এন্ট্রি"}
                  </h3>
                  <p className="text-xs text-slate-500">মাঠপর্যায়ে পরিদর্শনকৃত তথ্যসমূহ সফটওয়্যারে সংরক্ষণ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Row 1: Student Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentName || ""}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="উদাঃ আব্দুল্লাহ আল মাহমুদ"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">শ্রেণি</label>
                  <input
                    type="text"
                    value={formData.studentClass || ""}
                    onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                    placeholder="উদাঃ ৮ম শ্রেণি"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">রোল নম্বর</label>
                  <input
                    type="text"
                    value={formData.studentRoll || ""}
                    onChange={(e) => setFormData({ ...formData, studentRoll: e.target.value })}
                    placeholder="উদাঃ ০১"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Location, Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">পরিদর্শনের তারিখ</label>
                  <input
                    type="date"
                    value={formData.visitDate || ""}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিদর্শনের সময়</label>
                  <input
                    type="text"
                    value={formData.visitTime || ""}
                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                    placeholder="উদাঃ সন্ধ্যা ০৭:১৫"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিদর্শনকারী শিক্ষক</label>
                  <input
                    type="text"
                    value={formData.teacherName || ""}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    placeholder="শিক্ষকের নাম"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">বাসার সুনির্দিষ্ট লোকেশন ও পাড়া</label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="উদাঃ মধ্যমপাড়া, স্কুল রোড, বাড়ি নং ১২"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Immediate State */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block font-bold text-slate-800">
                  উপস্থিতিকালীন শিক্ষার্থীর তাৎক্ষণিক অবস্থা (সরাসরি কি অবস্থায় পাওয়া গেল?) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STUDENT_STATE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                        formData.studentState === opt.value
                          ? "bg-indigo-50 border-indigo-500 text-indigo-950 font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="studentState"
                        value={opt.value}
                        checked={formData.studentState === opt.value}
                        onChange={(e) => setFormData({ ...formData, studentState: e.target.value as any })}
                        className="text-indigo-600"
                      />
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.studentStateDetails || ""}
                  onChange={(e) => setFormData({ ...formData, studentStateDetails: e.target.value })}
                  placeholder="অতিরিক্ত কোনো পর্যবেক্ষণ থাকলে লিখুন (ঐচ্ছিক)..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 mt-2"
                />
              </div>

              {/* Study Environment & Parent Responsibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পড়ার টেবিল ও পরিবেশের মান</label>
                  <select
                    value={formData.studyEnvironment}
                    onChange={(e) => setFormData({ ...formData, studyEnvironment: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                  >
                    {STUDY_ENV_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পিতামাতা/অভিভাবকের তদারকি</label>
                  <select
                    value={formData.parentResponsibility}
                    onChange={(e) => setFormData({ ...formData, parentResponsibility: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                  >
                    {PARENT_RESPONSIBILITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Counseling & Guidance Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  শিক্ষক কর্তৃক প্রদত্ত তাৎক্ষণিক কাউন্সেলিং ও দিকনির্দেশনা *
                </label>
                <textarea
                  rows={2}
                  value={formData.counselingNotes || ""}
                  onChange={(e) => setFormData({ ...formData, counselingNotes: e.target.value })}
                  placeholder="পড়ার সময় বাড়ানো, মোবাইল নিয়ন্ত্রণ, পড়ার টেবিলে মনোযোগ রক্ষা ও সালাতের বিষয়ে কি কি কাউন্সেলিং করলেন..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Student Commitment & Parent Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর অঙ্গীকার বা প্রতিক্রিয়া</label>
                  <input
                    type="text"
                    value={formData.studentCommitment || ""}
                    onChange={(e) => setFormData({ ...formData, studentCommitment: e.target.value })}
                    placeholder="উদাঃ প্রতিদিন মাগরিবের পর টেবিলে বসার ওয়াদা করেছে"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">অভিভাবকের মন্তব্য / প্রতিক্রিয়া</label>
                  <input
                    type="text"
                    value={formData.parentRemarks || ""}
                    onChange={(e) => setFormData({ ...formData, parentRemarks: e.target.value })}
                    placeholder="উদাঃ মা আনন্দিত হয়েছেন এবং নিয়মিত তদারকির আশ্বাস দিয়েছেন"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Follow-up date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরবর্তী ফলো-আপ বা পুনরায় আচমকা ভিজিটের তারিখ</label>
                  <input
                    type="date"
                    value={formData.followUpDate || ""}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সার্বিক সন্তুষ্টি রেটিং (১-৫)</label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, overallScore: star })}
                        className="text-lg focus:outline-none cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= (formData.overallScore || 0) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 font-mono">({toBnNum(formData.overallScore || 4)}/৫)</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingVisit ? "আপডেট করুন" : "রেকর্ড সেভ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
