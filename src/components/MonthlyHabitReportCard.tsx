import React, { useMemo } from "react";
import { 
  Printer, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  User, 
  ShieldCheck, 
  Heart,
  BarChart2,
  FileCheck
} from "lucide-react";

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBnNum(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return "";
  return num.toString().replace(/[0-9]/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

export interface DayRowData {
  date: number;
  col1Checked: boolean;
  col2Checked: boolean;
  col3Checked: boolean;
  col4Checked: boolean;
  col5Checked?: boolean;
  col6Checked?: boolean;
  col1Val?: string;
  col2Val?: string;
  col3Val?: string;
  col4Val?: string;
  col5Val?: string;
  col6Val?: string;
  fajrChecked?: boolean;
  dhuhrChecked?: boolean;
  asrChecked?: boolean;
  maghribChecked?: boolean;
  ishaChecked?: boolean;
  dailyNote?: string;
  dailyGoal?: string;
}

export interface MonthlyHabitReportCardProps {
  studentName: string;
  studentClass: string;
  studentRoll: string;
  studentPhoto?: string;
  selectedMonth: string;
  daysCount: number;
  rows: DayRowData[];
  col1Header: string;
  col2Header: string;
  col3Header: string;
  col4Header: string;
  col5Header: string;
  col6Header: string;
  monthlyAdvice?: string;
  principalName?: string;
  principalInstruction?: string;
  onPrint?: () => void;
}

interface HabitMetric {
  id: string;
  habitNo: string;
  title: string;
  category: "prayer" | "study" | "conduct" | "health";
  daysCompleted: number;
  totalDays: number;
  percentage: number;
  ratingText: string;
  grade: string;
  color: string;
  bgTrack: string;
}

export const MonthlyHabitReportCard: React.FC<MonthlyHabitReportCardProps> = ({
  studentName,
  studentClass,
  studentRoll,
  studentPhoto,
  selectedMonth,
  daysCount,
  rows,
  col1Header,
  col2Header,
  col3Header,
  col4Header,
  col5Header,
  col6Header,
  monthlyAdvice = "নিয়মিত অধ্যবসায়, নৈতিক সততা ও সময়ের সঠিক মূল্যায়ন একজন শিক্ষার্থীকে আদর্শ ও সফল মানুষ হিসেবে গড়ে তোলে।",
  principalName = "অধ্যক্ষ / প্রধান শিক্ষক",
  principalInstruction = "সামগ্রিক অভ্যাস ও শিষ্টাচার সন্তোষজনক। নতুন মাসে এই শৃঙ্খলা দৃঢ়ভাবে অব্যাহত রাখতে হবে।",
  onPrint
}) => {
  // 1. Calculate Habit Completion Statistics for Each Defined Habit Column
  const habitMetrics: HabitMetric[] = useMemo(() => {
    const totalD = daysCount || 30;

    // Helper to calculate total completed for a condition across all days
    let c1 = 0; // Morning wakeup / sleep time
    let c2 = 0; // Prayers & Quran
    let c3 = 0; // Morning study
    let c4 = 0; // School & handwriting
    let c5 = 0; // Afternoon sports / recreation
    let c6 = 0; // Night study / bedtime

    rows.forEach((r) => {
      // Habit 1
      if (r.col1Checked) c1 += 1;
      else if (r.col1Val && r.col1Val.trim()) c1 += 0.5;

      // Habit 2: Prayers
      const prayersChecked = [r.fajrChecked, r.dhuhrChecked, r.asrChecked, r.maghribChecked, r.ishaChecked].filter(Boolean).length;
      if (prayersChecked >= 3 || r.col2Checked) {
        c2 += prayersChecked > 0 ? prayersChecked / 5 : 1;
      }

      // Habit 3: Morning study
      if (r.col3Checked) c3 += 1;
      else if (r.col3Val && r.col3Val.trim()) c3 += 0.5;

      // Habit 4: School handwriting
      if (r.col4Checked) c4 += 1;
      else if (r.col4Val && r.col4Val.trim()) c4 += 0.5;

      // Habit 5: Afternoon sports / recreation
      if (r.col5Checked) c5 += 1;
      else if (r.col5Val && r.col5Val.trim()) c5 += 0.5;

      // Habit 6: Night study
      if (r.col6Checked) c6 += 1;
      else if (r.col6Val && r.col6Val.trim()) c6 += 0.5;
    });

    const definitions = [
      {
        id: "h1",
        habitNo: "১",
        title: col1Header || "ভোরে ঘুম জাগা ও সময়নিষ্ঠতা",
        category: "conduct" as const,
        completed: Math.min(totalD, Math.round(c1 * 10) / 10),
        color: "bg-indigo-600",
        bgTrack: "bg-indigo-50"
      },
      {
        id: "h2",
        habitNo: "২",
        title: col2Header || "পাঁচ ওয়াক্ত নামাজ ও পবিত্র কোরআন চর্চা",
        category: "prayer" as const,
        completed: Math.min(totalD, Math.round(c2 * 10) / 10),
        color: "bg-emerald-600",
        bgTrack: "bg-emerald-50"
      },
      {
        id: "h3",
        habitNo: "৩",
        title: col3Header || "সকালের নিবিড় অধ্যয়ন (০৫:৩০ - ০৮:৩০)",
        category: "study" as const,
        completed: Math.min(totalD, Math.round(c3 * 10) / 10),
        color: "bg-blue-600",
        bgTrack: "bg-blue-50"
      },
      {
        id: "h4",
        habitNo: "৪",
        title: col4Header || "স্কুল ছুটির পর হাতের লেখা সম্পন্ন করা",
        category: "study" as const,
        completed: Math.min(totalD, Math.round(c4 * 10) / 10),
        color: "bg-amber-600",
        bgTrack: "bg-amber-50"
      },
      {
        id: "h5",
        habitNo: "৫",
        title: col5Header || "বিকেল ও খেলাধুলা / স্বাস্থ্যকর বিনোদন",
        category: "health" as const,
        completed: Math.min(totalD, Math.round(c5 * 10) / 10),
        color: "bg-teal-600",
        bgTrack: "bg-teal-50"
      },
      {
        id: "h6",
        habitNo: "৬",
        title: col6Header || "রাতের পড়া ও সময়মতো শয়ন (০৭:০০ - ০৯:০০)",
        category: "study" as const,
        completed: Math.min(totalD, Math.round(c6 * 10) / 10),
        color: "bg-purple-600",
        bgTrack: "bg-purple-50"
      }
    ];

    return definitions.map((def) => {
      const pct = totalD > 0 ? Math.min(100, Math.round((def.completed / totalD) * 100)) : 0;
      let ratingText = "মনোযোগ আবশ্যক";
      let grade = "D";
      if (pct >= 90) {
        ratingText = "অনন্য (Outstanding)";
        grade = "A+";
      } else if (pct >= 80) {
        ratingText = "উৎকৃষ্ট (Excellent)";
        grade = "A";
      } else if (pct >= 70) {
        ratingText = "সন্তোষজনক (Very Good)";
        grade = "B+";
      } else if (pct >= 55) {
        ratingText = "বিকাশমান (Developing)";
        grade = "B";
      } else if (pct >= 40) {
        ratingText = "প্রাথমিক পর্যায়";
        grade = "C";
      }

      return {
        id: def.id,
        habitNo: def.habitNo,
        title: def.title.replace(/^[০-৯\d]+[।.-]\s*/, ""),
        category: def.category,
        daysCompleted: def.completed,
        totalDays: totalD,
        percentage: pct,
        ratingText,
        grade,
        color: def.color,
        bgTrack: def.bgTrack
      };
    });
  }, [rows, daysCount, col1Header, col2Header, col3Header, col4Header, col5Header, col6Header]);

  // 2. Average Percentage of Completed Habits for the Current Month
  const overallAveragePercentage = useMemo(() => {
    if (habitMetrics.length === 0) return 0;
    const sum = habitMetrics.reduce((acc, h) => acc + h.percentage, 0);
    return Math.round(sum / habitMetrics.length);
  }, [habitMetrics]);

  // Overall Performance Evaluation
  const overallEvaluation = useMemo(() => {
    if (overallAveragePercentage >= 90) {
      return {
        grade: "A+",
        title: "অনন্য ও আদর্শ শিক্ষার্থী (Role Model)",
        remark: "চলতি মাসে অভ্যাসের নিয়মিত চর্চা ও নিষ্ঠা অত্যন্ত প্রশংসনীয় ও অনুকরণীয়।",
        badgeColor: "text-emerald-800 bg-emerald-50 border-emerald-300",
        circleColor: "#059669"
      };
    } else if (overallAveragePercentage >= 80) {
      return {
        grade: "A",
        title: "উৎকৃষ্ট ও সুশৃঙ্খল (Excellent)",
        remark: "অধিকাংশ অভ্যাস নিয়মিতভাবে সম্পন্ন হয়েছে; ছোটখাটো ফাঁকফোকর দূর করলে পূর্ণতা আসবে।",
        badgeColor: "text-blue-800 bg-blue-50 border-blue-300",
        circleColor: "#2563eb"
      };
    } else if (overallAveragePercentage >= 70) {
      return {
        grade: "B+",
        title: "সন্তোষজনক প্রগতি (Commendable)",
        remark: "নৈতিক আচরণ ও পড়াশোনার গতি সন্তোষজনক, তবে ছুটির দিনগুলোতেও ধারাবাহিকতা বজায় রাখা প্রয়োজন।",
        badgeColor: "text-amber-800 bg-amber-50 border-amber-300",
        circleColor: "#d97706"
      };
    } else if (overallAveragePercentage >= 50) {
      return {
        grade: "B",
        title: "উন্নতিশীল পর্যায় (Developing)",
        remark: "অভ্যাস গঠনে আরও একাগ্রতা দরকার; বিশেষ করে সকালের পড়া ও ঘুমের শৃঙ্খলায় শিক্ষক ও অভিভাবকের যৌথ তদারকি আবশ্যক।",
        badgeColor: "text-orange-800 bg-orange-50 border-orange-300",
        circleColor: "#ea580c"
      };
    } else {
      return {
        grade: "C",
        title: "নিবিড় যত্ন আবশ্যক (Needs Attention)",
        remark: "রুটিন মেনে চলার প্রতি বিশেষ নজর ও নিয়মিত প্রণোদনা প্রয়োজন।",
        badgeColor: "text-rose-800 bg-rose-50 border-rose-300",
        circleColor: "#e11d48"
      };
    }
  }, [overallAveragePercentage]);

  // 3. Weekly Breakdown of Habit Completion
  const weeklyData = useMemo(() => {
    const totalD = daysCount || 30;
    const weeks = [
      { weekNo: "১ম সপ্তাহ", range: "১ - ৭ তারিখ", start: 1, end: Math.min(7, totalD) },
      { weekNo: "২য় সপ্তাহ", range: "৮ - ১৪ তারিখ", start: 8, end: Math.min(14, totalD) },
      { weekNo: "৩য় সপ্তাহ", range: "১৫ - ২১ তারিখ", start: 15, end: Math.min(21, totalD) },
      { weekNo: "৪র্থ সপ্তাহ", range: "২২ - ২৮ তারিখ", start: 22, end: Math.min(28, totalD) },
      ...(totalD > 28 ? [{ weekNo: "৫ম সপ্তাহ", range: `২৯ - ${totalD} তারিখ`, start: 29, end: totalD }] : [])
    ];

    return weeks.map((w) => {
      let completedInWeek = 0;
      let daysInWeek = 0;

      rows.forEach((r) => {
        if (r.date >= w.start && r.date <= w.end) {
          daysInWeek++;
          let dayScore = 0;
          if (r.col1Checked) dayScore++;
          if (r.col2Checked || (r.fajrChecked && r.dhuhrChecked)) dayScore++;
          if (r.col3Checked) dayScore++;
          if (r.col4Checked) dayScore++;
          if (r.col5Checked) dayScore++;
          if (r.col6Checked) dayScore++;
          completedInWeek += dayScore;
        }
      });

      const maxInWeek = daysInWeek * 6;
      const pct = maxInWeek > 0 ? Math.round((completedInWeek / maxInWeek) * 100) : 0;

      return {
        ...w,
        completed: completedInWeek,
        maxPossible: maxInWeek,
        percentage: pct
      };
    });
  }, [rows, daysCount]);

  // 4. Consecutive Active Days / Streak
  const streakInfo = useMemo(() => {
    let maxStreak = 0;
    let currentStreak = 0;
    let daysWithAnyHabit = 0;

    rows.forEach((r) => {
      const activeCount = [r.col1Checked, r.col2Checked, r.col3Checked, r.col4Checked, r.col5Checked, r.col6Checked].filter(Boolean).length;
      if (activeCount >= 3) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        daysWithAnyHabit++;
      } else {
        currentStreak = 0;
      }
    });

    return {
      maxStreak,
      activeDays: daysWithAnyHabit
    };
  }, [rows]);

  const handleTriggerPrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Floating Action Toolbar (Hidden during print) */}
      <div className="w-full max-w-4xl mb-5 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 sm:p-4 rounded-xl border border-indigo-500/30 shadow-lg print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <FileCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>মাসিক অভ্যাস মূল্যায়ন রিপোর্ট কার্ড (A4 Printable)</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                গড়: {toBnNum(overallAveragePercentage)}%
              </span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              শিক্ষার্থী: <span className="text-gray-200 font-bold">{studentName}</span> • শ্রেণি: <span className="text-gray-200 font-bold">{studentClass}</span> • রোল: <span className="text-gray-200 font-bold">{toBnNum(studentRoll)}</span> • মাস: <span className="text-indigo-300 font-bold">{selectedMonth}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerPrint}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-lg shadow-md transition transform active:scale-95 flex items-center gap-2 cursor-pointer border border-indigo-400/30"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>প্রিন্ট রিপোর্ট কার্ড (A4)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* A4 PRINTABLE REPORT CARD CONTAINER */}
      {/* Dimensions: 210mm x 297mm (Standard International A4) */}
      {/* ========================================================================= */}
      <div 
        id="monthly-habit-report-card"
        className="w-full max-w-[210mm] bg-white text-slate-900 p-6 sm:p-8 md:p-10 border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-6 print:m-0 font-sans flex flex-col justify-between"
        style={{ minHeight: "297mm", boxSizing: "border-box" }}
      >
        <div>
          {/* 1. ACADEMIC INSTITUTION HEADER */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-900 text-amber-300 flex items-center justify-center font-black text-base shadow-sm">
                    🏛️
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                      আদর্শ একাডেমি ও চরিত্র গঠন মিশন
                    </h1>
                    <p className="text-[10px] text-slate-600 font-semibold tracking-wide">
                      নৈতিক শিষ্টাচার, সময়নিষ্ঠতা ও পড়াশোনার সমন্বিত প্রগতি মূল্যায়ন পর্ষদ
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-black text-slate-900">
                  <Award className="w-3.5 h-3.5 text-indigo-700" />
                  <span>মাসিক অভ্যাস ও চরিত্র মূল্যায়ন রিপোর্ট কার্ড • {selectedMonth}</span>
                </div>
              </div>

              {/* Student Photo & Roll Badge */}
              <div className="flex items-center gap-3 shrink-0">
                {studentPhoto ? (
                  <img
                    src={studentPhoto}
                    alt={studentName}
                    className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded border-2 border-slate-900 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-16 sm:w-16 sm:h-20 bg-slate-100 border-2 border-slate-900 rounded flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                    <User className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[8px] font-bold text-slate-500 leading-tight">ছবি</span>
                  </div>
                )}
              </div>
            </div>

            {/* Student Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">শিক্ষার্থীর নাম</span>
                <span className="font-black text-slate-950 text-sm block truncate">{studentName || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">শ্রেণি</span>
                <span className="font-extrabold text-slate-900 block">{studentClass || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">রোল নম্বর</span>
                <span className="font-black text-slate-950 font-mono text-sm block">{toBnNum(studentRoll) || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">কার্যকর দিন সংখ্যা</span>
                <span className="font-extrabold text-slate-900 font-mono block">{toBnNum(daysCount)} দিন</span>
              </div>
            </div>
          </div>

          {/* 2. EXECUTIVE SUMMARY & AVERAGE PERCENTAGE HERO SECTION */}
          <div className="mb-4 bg-slate-50 border border-slate-300 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Circular Gauge Visualizer */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                    fill="none"
                  />
                  {/* Animated / Progress Value Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={overallEvaluation.circleColor}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - overallAveragePercentage / 100)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-950 font-mono leading-none">
                    {toBnNum(overallAveragePercentage)}%
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase mt-0.5">গড় অর্জন</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded border font-mono bg-white shadow-2xs text-slate-900">
                    গ্রেড: {overallEvaluation.grade}
                  </span>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded border ${overallEvaluation.badgeColor}`}>
                    {overallEvaluation.title}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-semibold mt-1.5 leading-relaxed max-w-md">
                  {overallEvaluation.remark}
                </p>
              </div>
            </div>

            {/* Quick Metrics Pillar */}
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">সর্বোচ্চ স্ট্রিক</span>
                <span className="text-sm font-black text-emerald-700 font-mono block mt-0.5">
                  {toBnNum(streakInfo.maxStreak)} দিন
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">সক্রিয় উপস্থিতি</span>
                <span className="text-sm font-black text-indigo-700 font-mono block mt-0.5">
                  {toBnNum(streakInfo.activeDays)} / {toBnNum(daysCount)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. HABIT-BY-HABIT COMPLETION PERCENTAGE MATRIX */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>অভ্যাস ভিত্তিক বিস্তারিত সম্পাদন ও অগ্রগতি শতকরা হার (Habit Analysis)</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold font-mono">
                মোট ৬টি মূল নীতি
              </span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black text-[10px] uppercase border-b border-slate-300">
                    <th className="py-2 px-2.5 w-8 text-center border-r border-slate-200">নং</th>
                    <th className="py-2 px-3 border-r border-slate-200">অভ্যাস ও নৈতিক লক্ষ্য</th>
                    <th className="py-2 px-3 w-24 text-center border-r border-slate-200">সম্পন্ন দিন</th>
                    <th className="py-2 px-3 w-40 text-center border-r border-slate-200">শতকরা অগ্রগতি গ্রাফ</th>
                    <th className="py-2 px-2.5 w-16 text-center border-r border-slate-200">শতকরা</th>
                    <th className="py-2 px-3 w-28 text-center">মূল্যায়ন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {habitMetrics.map((h, idx) => (
                    <tr key={h.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="py-2 px-2.5 text-center font-black text-slate-900 border-r border-slate-200 font-mono">
                        {toBnNum(idx + 1)}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                        <span>{h.title}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700 border-r border-slate-200 font-mono">
                        {toBnNum(h.daysCompleted)} / {toBnNum(h.totalDays)} দিন
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full ${h.color} rounded-full transition-all duration-300`}
                            style={{ width: `${h.percentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2.5 text-center font-black text-slate-950 font-mono border-r border-slate-200">
                        {toBnNum(h.percentage)}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border inline-block ${
                          h.percentage >= 85 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : h.percentage >= 70
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : h.percentage >= 50
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-rose-50 text-rose-800 border-rose-300"
                        }`}>
                          {h.ratingText.split(" ")[0]} ({h.grade})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. WEEKLY CONSISTENCY BREAKDOWN */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>সাপ্তাহিক প্রগতি ও ধারাবাহিকতা বিশ্লেষণ (Weekly Habit Consistency)</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold font-mono">
                ১ম সপ্তাহ থেকে মাস সমাপ্তি
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {weeklyData.map((wk, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>{wk.weekNo}</span>
                      <span className="font-mono text-[9px]">{wk.range}</span>
                    </div>
                    <div className="text-base font-black text-slate-900 font-mono mt-1">
                      {toBnNum(wk.percentage)}%
                    </div>
                  </div>

                  <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        wk.percentage >= 80 ? "bg-emerald-600" : wk.percentage >= 60 ? "bg-indigo-600" : "bg-amber-500"
                      }`}
                      style={{ width: `${wk.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. TEACHER & PRINCIPAL COUNSELING ADVICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div className="bg-indigo-50/50 border border-indigo-200 p-3 rounded-lg">
              <h3 className="text-[11px] font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3 h-3 text-indigo-600" />
                <span>শিক্ষকের পর্যবেক্ষণ ও মাসিক পরামর্শ</span>
              </h3>
              <p className="text-slate-700 leading-relaxed font-semibold italic text-[11px]">
                &quot;{monthlyAdvice}&quot;
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
              <h3 className="text-[11px] font-black text-slate-950 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>অভিভাবকের অঙ্গীকার ও দায়িত্ব</span>
              </h3>
              <p className="text-slate-700 leading-relaxed text-[11px] font-medium">
                সন্তানের মোবাইল/টিভি আসক্তি রোধ করে প্রতিদিন সন্ধ্যায় পড়ার টেবিলে সান্নিধ্য দেওয়া এবং ৫ ওয়াক্ত নামাজে অনুপ্রেরণা যোগানো নিশ্চিত করব।
              </p>
            </div>
          </div>
        </div>

        {/* 6. FORMAL INSTITUTIONAL SIGNATURE BLOCK */}
        <div className="pt-4 border-t-2 border-slate-900 mt-2">
          <div className="grid grid-cols-3 gap-6 text-center text-xs font-bold text-slate-800">
            <div>
              <div className="border-b border-dashed border-slate-400 pb-1 mb-1.5 h-7 flex items-end justify-center font-serif text-[11px] text-slate-600">
                ...............................................
              </div>
              <span className="block text-[10px] text-slate-600 uppercase font-black">অভিভাবকের স্বাক্ষর ও তারিখ</span>
              <span className="text-[9px] text-slate-400 font-mono block">Guardian&apos;s Signature</span>
            </div>

            <div>
              <div className="border-b border-dashed border-slate-400 pb-1 mb-1.5 h-7 flex items-end justify-center font-serif text-[11px] text-indigo-900 font-bold">
                ক্লাস টিচার
              </div>
              <span className="block text-[10px] text-slate-600 uppercase font-black">শ্রেণি শিক্ষকের স্বাক্ষর</span>
              <span className="text-[9px] text-slate-400 font-mono block">Class Teacher&apos;s Verified</span>
            </div>

            <div>
              <div className="border-b border-dashed border-slate-400 pb-1 mb-1.5 h-7 flex items-end justify-center font-serif text-[11px] text-slate-950 font-black">
                {principalName}
              </div>
              <span className="block text-[10px] text-slate-600 uppercase font-black">অধ্যক্ষের স্বাক্ষর ও সিলমোহর</span>
              <span className="text-[9px] text-slate-400 font-mono block">Principal Official Seal</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[9px] text-slate-400 font-mono uppercase tracking-wider">
            <span>কপিরাইট © ২০২৬ শিষ্টাচার ও নৈতিক প্রগতি মিশন</span>
            <span>রিপোর্ট জেনারেট তারিখ: {toBnNum(new Date().toLocaleDateString("bn-BD"))}</span>
            <span>A4 PRINTABLE VERIFIED RECORD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
