import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Check, 
  Copy, 
  X, 
  Award,
  Zap,
  User,
  Heart,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PRESET_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", 
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBn(num: number | string): string {
  if (num === undefined || num === null) return "";
  return num
    .toString()
    .split("")
    .map(char => {
      const parsed = parseInt(char, 10);
      return !isNaN(parsed) && parsed >= 0 && parsed <= 9 ? BENGALI_DIGITS[parsed] : char;
    })
    .join("");
}

function getNextMonthInfo(currentMonthStr: string) {
  // e.g. "জুলাই ২০২৬" or "মার্চ ২০২৬"
  const parts = currentMonthStr.trim().split(" ");
  const currentMonthName = parts[0];
  let year = new Date().getFullYear();
  
  if (parts.length > 1) {
    const bnToEn = parts[1].replace(/[০-৯]/g, d => "0123456789"["০১২৩৪৫৬৭৮৯".indexOf(d)]);
    const parsedYear = parseInt(bnToEn, 10);
    if (!isNaN(parsedYear)) year = parsedYear;
  }

  let monthIdx = PRESET_MONTHS.indexOf(currentMonthName);
  if (monthIdx === -1) monthIdx = new Date().getMonth();

  let nextMonthIdx = (monthIdx + 1) % 12;
  let nextYear = year;
  if (monthIdx === 11) {
    nextYear = year + 1;
  }

  const nextMonthName = PRESET_MONTHS[nextMonthIdx];
  const nextMonthFull = `${nextMonthName} ${toBn(nextYear)}`;

  const daysInNextMonth = new Date(nextYear, nextMonthIdx + 1, 0).getDate();
  const jsDay = new Date(nextYear, nextMonthIdx, 1).getDay(); // 0=Sun
  const startDayIndex = (jsDay + 1) % 7; // Saturday = 0

  return {
    monthName: nextMonthName,
    fullMonth: nextMonthFull,
    daysCount: daysInNextMonth,
    startDayIndex
  };
}

interface PerformanceAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentClass: string;
  studentRoll: string;
  currentMonth: string;
  savedRoutines: any[];
  competencies: any[];
  currentRows: any[];
  onApplyGoalsAndAdvice: (params: {
    monthlyAdvice: string;
    col1Header?: string;
    col4Header?: string;
    dailyGoals?: string[];
    advanceToMonth?: {
      selectedMonth: string;
      daysCount: number;
      startDayIndex: number;
    };
  }) => void;
  learningStyle?: string;
  behavioralPattern?: string;
}

export const PerformanceAnalyzerModal: React.FC<PerformanceAnalyzerModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentClass,
  studentRoll,
  currentMonth,
  savedRoutines,
  competencies,
  currentRows,
  onApplyGoalsAndAdvice,
  learningStyle,
  behavioralPattern
}) => {
  const [copied, setCopied] = useState(false);
  const [applyNextMonth, setApplyNextMonth] = useState(true);
  const [applyDailyGoals, setApplyDailyGoals] = useState(true);
  const [applyMonthlyAdvice, setApplyMonthlyAdvice] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"analysis" | "proposal" | "apply">("analysis");

  // Find all historical records matching current student
  const studentPastRoutines = useMemo(() => {
    if (!studentName && !studentRoll) return [];
    
    const normRoll = studentRoll.replace(/[০-৯]/g, d => "0123456789"["০১২৩৪৫৬৭৮৯".indexOf(d)]).trim();
    const cleanCls = studentClass.replace(/শ্রেণি|class/gi, "").trim();

    return savedRoutines.filter(r => {
      const rRoll = (r.studentRoll || "").toString().replace(/[০-৯]/g, (d: string) => "0123456789"["০১২৩৪৫৬৭৮৯".indexOf(d)]).trim();
      const rCls = (r.studentClass || "").toString().replace(/শ্রেণি|class/gi, "").trim();
      const rName = (r.studentName || "").toString().trim();

      const rollMatches = normRoll && rRoll && normRoll === rRoll;
      const classMatches = cleanCls && rCls && cleanCls === rCls;
      const nameMatches = studentName && rName && rName.toLowerCase() === studentName.trim().toLowerCase();

      return (rollMatches && classMatches) || nameMatches;
    });
  }, [savedRoutines, studentName, studentClass, studentRoll]);

  // Next month info
  const nextMonthInfo = useMemo(() => getNextMonthInfo(currentMonth), [currentMonth]);

  // Compute statistical metrics across past routines (or fallback to current rows)
  const analysisStats = useMemo(() => {
    let totalCheckedDays = 0;
    let wakeUpChecked = 0;
    let prayersChecked = 0;
    let totalPrayerOpportunities = 0;
    let morningStudyChecked = 0;
    let eveningStudyChecked = 0;
    let handwritingChecked = 0;
    let totalDaysAnalyzed = 0;

    const routinesToAnalyze = studentPastRoutines.length > 0 
      ? studentPastRoutines 
      : [{ selectedMonth: currentMonth, rows: currentRows }];

    routinesToAnalyze.forEach(routine => {
      if (Array.isArray(routine.rows)) {
        routine.rows.forEach((row: any) => {
          totalDaysAnalyzed++;
          const hasAny = row.col1Checked || row.col2Checked || row.col3Checked || row.col4Checked || row.col5Checked || row.col6Checked || row.fajrChecked;
          if (hasAny) totalCheckedDays++;

          if (row.col1Checked) wakeUpChecked++;
          if (row.col3Checked) morningStudyChecked++;
          if (row.col4Checked) handwritingChecked++;
          if (row.col6Checked) eveningStudyChecked++;

          // Prayers
          const prayers = [row.fajrChecked, row.dhuhrChecked, row.asrChecked, row.maghribChecked, row.ishaChecked];
          prayers.forEach(p => {
            totalPrayerOpportunities++;
            if (p) prayersChecked++;
          });
        });
      }
    });

    const safeDivide = (val: number, total: number) => total > 0 ? Math.round((val / total) * 100) : 75;

    const wakeUpRate = safeDivide(wakeUpChecked, totalDaysAnalyzed);
    const prayerRate = safeDivide(prayersChecked, totalPrayerOpportunities);
    const morningStudyRate = safeDivide(morningStudyChecked, totalDaysAnalyzed);
    const eveningStudyRate = safeDivide(eveningStudyChecked, totalDaysAnalyzed);
    const handwritingRate = safeDivide(handwritingChecked, totalDaysAnalyzed);
    const activeLoggingRate = safeDivide(totalCheckedDays, totalDaysAnalyzed);

    const overallScore = Math.round((wakeUpRate + prayerRate + morningStudyRate + eveningStudyRate + handwritingRate) / 5);

    // Identify strengths and improvement areas
    const strengths: string[] = [];
    const gaps: string[] = [];

    if (wakeUpRate >= 70) {
      strengths.push("ভোরবেলা ঘুম থেকে ওঠা ও ফজর সালাতের ধারাবাহিকতা প্রশংসনীয়");
    } else {
      gaps.push("ঋতুর পরিক্রমায় ভোর ০৫:০০ টায় নির্ধারিত সময়ে ঘুম জাগা ও ফজর আদায়ে অনীহা");
    }

    if (prayerRate >= 70) {
      strengths.push("পাঁচ ওয়াক্ত নামাজ সময়মতো আদায়ে বিশেষ যত্নবান");
    } else {
      gaps.push("৫ ওয়াক্ত নামাজের মাঝে বিশেষ করে মাগরিব ও এশার জামাতে নিয়মিত হওয়া প্রয়োজন");
    }

    if (morningStudyRate >= 70) {
      strengths.push("সকালের ৩ ঘন্টা নিবিড় অধ্যয়ন ও পাঠ্যবই রিভিশনে আন্তরিক");
    } else {
      gaps.push("সকালের পড়াশোনার টেবিলে পূর্ণ মনোযোগ ও সময় দেওয়া নিশ্চিত করা দরকার");
    }

    if (handwritingRate >= 70) {
      strengths.push("বিদ্যালয় ছুটির পরপরই হাতের লেখা ও বাড়ির কাজ সুসম্পন্ন করার ভালো অভ্যাস");
    } else {
      gaps.push("বিদ্যালয় থেকে ফিরে হাতের লেখা ও পরিচ্ছন্ন হোমওয়ার্ক সমাপ্ত করায় গড়িমসি");
    }

    if (eveningStudyRate >= 70) {
      strengths.push("সন্ধ্যার পড়ার টেবিলে শিষ্টাচার পাঠ ও পড়াশোনায় ধারাবাহিক");
    } else {
      gaps.push("সন্ধ্যার পড়ার টেবিলে মেজাজ নিয়ন্ত্রণ ও শান্তভাবে পড়াশোনা শেষ করা জরুরি");
    }

    // Evaluate competencies from student progress
    if (Array.isArray(competencies)) {
      competencies.forEach(comp => {
        if (comp.progress === "red" || comp.progress === "yellow") {
          gaps.push(`${comp.skillArea || "নির্দিষ্ট পাঠ"}: ${comp.currentStatus || "উন্নতি প্রয়োজন"}`);
        } else if (comp.progress === "green") {
          strengths.push(`${comp.skillArea || "নির্দিষ্ট বিষয়"}: সফলভাবে আয়ত্ত করেছে`);
        }
      });
    }

    return {
      totalMonths: routinesToAnalyze.length,
      monthsList: routinesToAnalyze.map(r => r.selectedMonth).filter(Boolean),
      totalDaysAnalyzed,
      wakeUpRate,
      prayerRate,
      morningStudyRate,
      eveningStudyRate,
      handwritingRate,
      activeLoggingRate,
      overallScore,
      strengths,
      gaps
    };
  }, [studentPastRoutines, currentMonth, currentRows, competencies]);

  // State for proposed customizable goals
  const [goal1, setGoal1] = useState(
    "ঋতুর পরিক্রমায় ভোর ০৫:০০ টায় ঘুম থেকে উঠে ফজর সালাত আদায় এবং সকালের ৩ ঘণ্টা নিবিড় অধ্যয়ন শতভাগ সম্পন্ন করা।"
  );
  const [goal2, setGoal2] = useState(
    "স্কুল ছুটির পর প্রথম কাজ হিসেবে হাতের লেখা শেষ করা এবং দুর্বল বিষয়ে (গণিত/বাংলা) প্রতিদিন ৩০ মিনিট নিবিড় চর্চা করা।"
  );
  const [goal3, setGoal3] = useState(
    "গুরুজনদের সালাম দেওয়া, বাবা-মাকে কাজে সাহায্য করা এবং শান্ত ও মার্জিত আচরণ বজায় রাখা।"
  );

  // Proposed Monthly Advice state
  const [customAdvice, setCustomAdvice] = useState(() => {
    const sName = studentName ? `স্নেহের ${studentName}, ` : "";
    return `${sName}বিগত মাসের পারফরম্যান্স পর্যালোচনায় দেখা গেছে যে তোমার অধ্যবসায় প্রশংসনীয়। তবে আগামী ${nextMonthInfo.monthName} মাসে ভোর ০৫:০০ টায় ঘুম থেকে ওঠা এবং স্কুল ছুটির পর হাতের লেখার যত্ন নেওয়াকে বিশেষ অগ্রাধিকার দিতে হবে। নিয়মিত পাঁচ ওয়াক্ত নামাজ এবং শৃঙ্খলাবদ্ধ পড়াশোনাই তোমার মেধা বিকাশের শ্রেষ্ঠ সোপান।`;
  });

  // Re-generate advice when studentName changes
  React.useEffect(() => {
    const sName = studentName ? `স্নেহের ${studentName}, ` : "";
    setCustomAdvice(
      `${sName}বিগত মাসের পারফরম্যান্স পর্যালোচনায় দেখা গেছে যে তোমার অধ্যবসায় প্রশংসনীয়। তবে আগামী ${nextMonthInfo.monthName} মাসে ভোর ০৫:০০ টায় ঘুম থেকে ওঠা এবং স্কুল ছুটির পর হাতের লেখার যত্ন নেওয়াকে বিশেষ অগ্রাধিকার দিতে হবে। নিয়মিত পাঁচ ওয়াক্ত নামাজ এবং শৃঙ্খলাবদ্ধ পড়াশোনাই তোমার মেধা বিকাশের শ্রেষ্ঠ সোপান।`
    );
  }, [studentName, nextMonthInfo.monthName]);

  const handleApply = () => {
    const dailyGoalsToApply = applyDailyGoals ? [goal1, goal2, goal3] : undefined;
    const advanceInfo = applyNextMonth ? {
      selectedMonth: nextMonthInfo.fullMonth,
      daysCount: nextMonthInfo.daysCount,
      startDayIndex: nextMonthInfo.startDayIndex
    } : undefined;

    onApplyGoalsAndAdvice({
      monthlyAdvice: applyMonthlyAdvice ? customAdvice : "",
      col1Header: "১। নামাজের জন্য ঘুম জাগা ০৫:০০",
      col4Header: "৪। স্কুল ছুটির পর প্রথম কাজ হাতের লেখা সম্পন্ন করা",
      dailyGoals: dailyGoalsToApply,
      advanceToMonth: advanceInfo
    });

    onClose();
  };

  const handleCopyReport = () => {
    const reportText = `📊 শিক্ষার্থী পারফরম্যান্স ও আগামী মাসের পরিকল্পনা রিপোর্ট
--------------------------------------------------
শিক্ষার্থী: ${studentName || "নামহীন"}
শ্রেণি: ${studentClass || "N/A"} | রোল: ${toBn(studentRoll)}
বিশ্লেষিত সময়: ${analysisStats.monthsList.join(", ") || currentMonth}
সামগ্রিক স্কোর: ${toBn(analysisStats.overallScore)}%

প্রধান অর্জনসমূহ (Strengths):
${analysisStats.strengths.map(s => `• ${s}`).join("\n")}

উন্নতির ক্ষেত্রসমূহ (Focus Areas):
${analysisStats.gaps.map(g => `• ${g}`).join("\n")}

আগামী মাসের (${nextMonthInfo.monthName}) প্রস্তাবিত লক্ষ্যসমূহ:
১. ${goal1}
২. ${goal2}
৩. ${goal3}

মাসিক অনুপ্রেরণামূলক উপদেশ:
"${customAdvice}"
--------------------------------------------------
প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto no-print">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-indigo-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-650 to-indigo-800 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <TrendingUp className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">পূর্ববর্তী পারফরম্যান্স বিশ্লেষণ ও আগামী মাসের প্রস্তাবনা</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI & Data Driven
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5 flex items-center gap-2">
                <span>{studentName ? `${studentName} (${studentClass || ""})` : "শিক্ষার্থীর নাম অপ্রাপ্ত"}</span>
                <span>•</span>
                <span>রোল: {toBn(studentRoll)}</span>
                <span>•</span>
                <span>বর্তমান মাস: {currentMonth}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab("analysis")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "analysis"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>১. পারফরম্যান্স বিশ্লেষণ ও পরিসংখ্যান</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("proposal")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "proposal"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>২. আগামী মাসের প্রস্তাবিত লক্ষ্য ও উপদেশ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("apply")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "apply"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>৩. এক ক্লিকে রুটিনে প্রয়োগ</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeSubTab === "analysis" && (
            <div className="space-y-5">
              {/* TOP SUMMARY BANNER */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 p-4 rounded-xl border border-indigo-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                    {studentPastRoutines.length > 0 
                      ? `✓ ক্লাউড থেকে ${toBn(studentPastRoutines.length)}টি মাসের রুটিন পর্যালোচনা করা হয়েছে` 
                      : `✓ বর্তমান মাসের ডাটা ও মনস্তাত্ত্বিক প্রগ্রেস পর্যালোচিত`}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {studentName}-এর সামগ্রিক অভ্যাস মান ও নিয়মানুবর্তিতা
                  </h4>
                  <p className="text-xs text-slate-500">
                    বিগত দিনগুলোতে ভোর ০৫:০০ ঘুমজাগা, সালাত, সকাল ও রাতের পড়াশোনা এবং হাতের লেখার পারফরম্যান্স।
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-indigo-200 shadow-2xs shrink-0">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">সামগ্রিক স্কোর</span>
                    <span className="text-2xl font-black text-indigo-700">{toBn(analysisStats.overallScore)}%</span>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    analysisStats.overallScore >= 80 
                      ? "bg-emerald-100 text-emerald-800" 
                      : analysisStats.overallScore >= 60 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-rose-100 text-rose-800"
                  }`}>
                    {analysisStats.overallScore >= 80 ? "A" : analysisStats.overallScore >= 60 ? "B" : "C"}
                  </div>
                </div>
              </div>

              {/* STATS METRIC GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-[10px] text-slate-500 font-bold mb-1">ভোর ০৫:০০ ঘুমজাগা</span>
                  <div className="text-lg font-black text-slate-900">{toBn(analysisStats.wakeUpRate)}%</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    analysisStats.wakeUpRate >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {analysisStats.wakeUpRate >= 70 ? "নিয়মিত" : "উন্নতি দরকার"}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-[10px] text-slate-500 font-bold mb-1">৫ ওয়াক্ত সালাত</span>
                  <div className="text-lg font-black text-slate-900">{toBn(analysisStats.prayerRate)}%</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    analysisStats.prayerRate >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {analysisStats.prayerRate >= 70 ? "অগ্রগামী" : "ফোকাস দরকার"}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-[10px] text-slate-500 font-bold mb-1">সকালের ৩ ঘ. পড়া</span>
                  <div className="text-lg font-black text-slate-900">{toBn(analysisStats.morningStudyRate)}%</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    analysisStats.morningStudyRate >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {analysisStats.morningStudyRate >= 70 ? "ধারাবাহিক" : "ঘাটতি আছে"}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-[10px] text-slate-500 font-bold mb-1">হাতের লেখা ও কাজ</span>
                  <div className="text-lg font-black text-slate-900">{toBn(analysisStats.handwritingRate)}%</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    analysisStats.handwritingRate >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {analysisStats.handwritingRate >= 70 ? "উত্তম" : "অমনোযোগ"}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
                  <span className="block text-[10px] text-slate-500 font-bold mb-1">রাতের ২ ঘ. পড়া</span>
                  <div className="text-lg font-black text-slate-900">{toBn(analysisStats.eveningStudyRate)}%</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    analysisStats.eveningStudyRate >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {analysisStats.eveningStudyRate >= 70 ? "সফল" : "উন্নয়নযোগ্য"}
                  </span>
                </div>
              </div>

              {/* STRENGTHS VS GAPS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2.5 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>চিহ্নিত সবল দিক ও প্রশংসনীয় অর্জনসমূহ:</span>
                  </div>
                  {analysisStats.strengths.length > 0 ? (
                    <ul className="space-y-2 text-xs text-emerald-950">
                      {analysisStats.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-800 italic">নতুন মাস শুরু হয়েছে, প্রাথমিক মূল্যায়ন প্রস্তুত করা হচ্ছে।</p>
                  )}
                </div>

                {/* Gaps */}
                <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2.5 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>আগামী মাসের জন্য চিহ্নিত অগ্রাধিকার ও দুর্বলতাসমূহ:</span>
                  </div>
                  {analysisStats.gaps.length > 0 ? (
                    <ul className="space-y-2 text-xs text-amber-950">
                      {analysisStats.gaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-amber-800 italic">সকল অভ্যাসে চমৎকার সমতা রয়েছে।</p>
                  )}
                </div>
              </div>

              {/* Psychological Profile summary if available */}
              {(learningStyle || behavioralPattern) && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>
                      <strong>মনস্তাত্ত্বিক ধরন:</strong> {learningStyle || "সাধারণ"} | {behavioralPattern || "শান্ত"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">ব্যক্তিগত লার্নিং প্রোফাইল সক্রিয়</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("proposal")}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>পরবর্তী ধাপ: আগামী মাসের লক্ষ্য ও উপদেশ দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSubTab === "proposal" && (
            <div className="space-y-5">
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-150">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>আগামী মাস ({nextMonthInfo.monthName})-এর জন্য ৩টি প্রধান লক্ষ্য:</span>
                </div>
                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                  বিগত মাসের পরিসংখ্যান বিশ্লেষণ করে শিক্ষার্থীর জন্য নিচের লক্ষ্যগুলো চূড়ান্ত করা হয়েছে। আপনি চাইলে এগুলো সরাসরি এডিট করতে পারেন:
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>লক্ষ্য ১ (ভোর ০৫:০০ আমল ও সময়নিষ্ঠা):</span>
                    </label>
                    <input
                      type="text"
                      value={goal1}
                      onChange={(e) => setGoal1(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>লক্ষ্য ২ (হাতের লেখা ও দুর্বল বিষয়ের নিবিড় অনুশীলন):</span>
                    </label>
                    <input
                      type="text"
                      value={goal2}
                      onChange={(e) => setGoal2(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-indigo-600" />
                      <span>লক্ষ্য ৩ (শিষ্টাচার, বড়দের সম্মান ও মার্জিত স্বভাব):</span>
                    </label>
                    <input
                      type="text"
                      value={goal3}
                      onChange={(e) => setGoal3(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* MONTHLY ADVICE PROPOSAL */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>আগামী মাসের রুটিনে প্রস্তাবিত মাসিক উপদেশ (Monthly Advice):</span>
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    স্বয়ংক্রিয়ভাবে তৈরি
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={customAdvice}
                  onChange={(e) => setCustomAdvice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 outline-none font-semibold text-slate-900 leading-relaxed"
                />
                <p className="text-[10px] text-slate-500">
                  এই উপদেশটি রুটিনের নিচের "মাসিক উপদেশ" বক্সে স্বয়ংক্রিয়ভাবে প্রতিস্থাপিত হবে।
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("analysis")}
                  className="py-2 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← পূর্বে ফিরুন
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("apply")}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>পরবর্তী ধাপ: রুটিনে যুক্ত করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSubTab === "apply" && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  প্রয়োগের জন্য অপশনসমূহ নিশ্চিত করুন:
                </h4>

                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition">
                  <input
                    type="checkbox"
                    checked={applyNextMonth}
                    onChange={(e) => setApplyNextMonth(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      আগামী মাসের রুটিন হিসেবে সেট করুন ({nextMonthInfo.fullMonth})
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      দিন সংখ্যা ({toBn(nextMonthInfo.daysCount)} দিন) এবং বার স্বয়ংক্রিয়ভাবে ক্যালেন্ডার অনুযায়ী বিন্যস্ত হবে।
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition">
                  <input
                    type="checkbox"
                    checked={applyMonthlyAdvice}
                    onChange={(e) => setApplyMonthlyAdvice(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      মাসিক উপদেশ হিসেবে প্রস্তাবিত লেখাটি বসিয়ে দিন
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      রুটিনের বটমে থাকা প্রধান উপদেশটি পরিবর্তিত হয়ে নতুন লক্ষ্যমুখী হবে।
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition">
                  <input
                    type="checkbox"
                    checked={applyDailyGoals}
                    onChange={(e) => setApplyDailyGoals(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      রুটিনের রো-গুলোতে প্রস্তাবিত ৩টি লক্ষ্য যুক্ত করুন
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      আগামী মাসের প্রতিটি দিনের নির্দিষ্ট লক্ষ্য হিসেবে ক্রমান্বয়ে সেট করা হবে।
                    </span>
                  </div>
                </label>
              </div>

              {/* SUMMARY BOX */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>প্রয়োগের পর ফলাফল:</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  ক্লিক করার সাথে সাথে বর্তমান স্ক্রিনের রুটিনটি নতুন মাসের সম্পূর্ণ প্রস্তুত ফর্মে রূপান্তরিত হবে। এছাড়া ভোরবেলা ঘুমজাগার সময়টি <strong>ভোর ০৫:০০</strong> তে অপরিবর্তিত থাকবে।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copied ? "রিপোর্ট কপি সম্পন্ন!" : "রিপোর্ট টেক্সট কপি করুন"}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 sm:w-auto py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
                  >
                    বাতিল
                  </button>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="w-1/2 sm:w-auto py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>✓ আগামী মাসের রুটিনে প্রয়োগ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
