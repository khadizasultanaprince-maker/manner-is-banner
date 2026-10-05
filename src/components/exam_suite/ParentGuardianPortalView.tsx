// src/components/exam_suite/ParentGuardianPortalView.tsx
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  Bell,
  Calendar,
  CreditCard,
  FileBadge,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  FileText,
  Sparkles,
  ArrowRightCircle,
  ArrowLeftCircle,
  FileCheck2
} from "lucide-react";
import { GateLog, StudentExamRecord, GuardianMeeting, AdmitCard, StudentSecurityProfile } from "./examTypes";
import { SAMPLE_GATE_LOGS, SAMPLE_EXAM_RECORDS, SAMPLE_GUARDIAN_MEETINGS, SAMPLE_ADMIT_CARDS, SAMPLE_SECURITY_PROFILES } from "./examMockData";

interface ParentGuardianPortalViewProps {
  studentId: string;
  studentName: string;
  studentClass: string;
  studentRoll: string;
}

export const ParentGuardianPortalView: React.FC<ParentGuardianPortalViewProps> = ({
  studentId,
  studentName,
  studentClass,
  studentRoll
}) => {
  const [activeTab, setActiveTab] = useState<"gate_alerts" | "exam_results" | "id_admit" | "pta_meetings">("gate_alerts");

  // Gate Notifications for this student
  const [gateNotifs, setGateNotifs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`student_gate_notifs_${studentId}`);
      if (saved) return JSON.parse(saved);
      // Fallback: check global gate logs
      const global = localStorage.getItem("dlikon_gate_logs");
      if (global) {
        const parsed = JSON.parse(global);
        const match = parsed.filter((l: any) => l.studentId === studentId || l.roll === studentRoll);
        if (match.length > 0) return match;
      }
      return SAMPLE_GATE_LOGS.filter(l => l.studentId === studentId || l.roll === studentRoll || l.studentId === "DLM-501");
    } catch {
      return SAMPLE_GATE_LOGS;
    }
  });

  // Meeting Urgent Alerts for this student
  const [meetingAlerts, setMeetingAlerts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`student_meeting_alerts_${studentId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Published Exam Results
  const [examRecords, setExamRecords] = useState<StudentExamRecord[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_student_exam_records");
      const list = saved ? JSON.parse(saved) : SAMPLE_EXAM_RECORDS;
      return list.filter((r: StudentExamRecord) => r.roll === studentRoll || r.studentName === studentName || r.studentId === studentId);
    } catch {
      return SAMPLE_EXAM_RECORDS;
    }
  });

  // Active Guardian Meeting
  const [activeMeeting, setActiveMeeting] = useState<GuardianMeeting | null>(() => {
    try {
      const saved = localStorage.getItem("dlikon_guardian_meetings");
      const list = saved ? JSON.parse(saved) : SAMPLE_GUARDIAN_MEETINGS;
      return list[0] || null;
    } catch {
      return SAMPLE_GUARDIAN_MEETINGS[0];
    }
  });

  // Refresh notifications periodically
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedNotifs = localStorage.getItem(`student_gate_notifs_${studentId}`);
        if (savedNotifs) setGateNotifs(JSON.parse(savedNotifs));

        const savedAlerts = localStorage.getItem(`student_meeting_alerts_${studentId}`);
        if (savedAlerts) setMeetingAlerts(JSON.parse(savedAlerts));

        const savedResults = localStorage.getItem("dlikon_student_exam_records");
        if (savedResults) {
          const parsed = JSON.parse(savedResults);
          setExamRecords(parsed.filter((r: any) => r.roll === studentRoll || r.studentName === studentName));
        }
      } catch {}
    };

    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 3000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [studentId, studentRoll, studentName]);

  const latestExamResult = examRecords[0] || SAMPLE_EXAM_RECORDS[0];

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-6 text-white shadow-2xl space-y-5">
      {/* Top Banner with Parent Portal Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>অভিভাবক ও শিক্ষার্থী স্মার্ট কন্ট্রোল পোর্টাল</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                ডি-লিকন ডিজিটাল ক্যাম্পাস
              </span>
            </h3>
            <p className="text-xs text-indigo-200">
              গেট আগমন/প্রস্থান মেসেজ • পরীক্ষার রেজাল্ট কার্ড • এডমিট কার্ড • অভিভাবক সভা নোটিশ
            </p>
          </div>
        </div>

        {/* 4 Portal Navigation Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-indigo-500/30">
          <button
            onClick={() => setActiveTab("gate_alerts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "gate_alerts"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>গেট সিকিউরিটি মেসেজ ({gateNotifs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("exam_results")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "exam_results"
                ? "bg-purple-600 text-white shadow font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>পরীক্ষার রেজাল্ট ও ট্রান্সক্রিপ্ট</span>
          </button>

          <button
            onClick={() => setActiveTab("id_admit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "id_admit"
                ? "bg-amber-600 text-white shadow font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>আইডি কার্ড ও এডমিট কার্ড</span>
          </button>

          <button
            onClick={() => setActiveTab("pta_meetings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pta_meetings"
                ? "bg-rose-600 text-white shadow font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>অভিভাবক সভা ও রেজুলেশন</span>
          </button>
        </div>
      </div>

      {/* URGENT MEETING ABSENT ALERT BANNER (If alert exists) */}
      {meetingAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-amber-950 border-2 border-rose-400 p-4 rounded-2xl text-white shadow-xl animate-pulse flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl mt-0.5">
            <AlertTriangle className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-amber-300">
                {meetingAlerts[0]?.title}
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {meetingAlerts[0]?.time}
              </span>
            </div>
            <p className="text-xs text-slate-100 font-semibold leading-relaxed">
              {meetingAlerts[0]?.message}
            </p>
          </div>
        </div>
      )}

      {/* 1. GATE SECURITY MESSAGES */}
      {activeTab === "gate_alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>ক্যাম্পাস গেট আগমন ও প্রস্থান লাইভ মেসেজ ফিড</span>
            </h4>
            <span className="text-xs text-slate-400">
              ডি-লিকন অটো-নোটিফিকেশন ইঞ্জিন
            </span>
          </div>

          <div className="space-y-3">
            {gateNotifs.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/60 rounded-2xl border border-dashed border-slate-700 text-xs text-slate-400">
                আজকের কোনো গেট স্ক্যান রেকর্ড নেই। গেটে কার্ড স্ক্যান করামাত্রই এখানে মেসেজ আসবে।
              </div>
            ) : (
              gateNotifs.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition shadow-md flex items-start gap-3.5"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    item.type === "in"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}>
                    {item.type === "in" ? (
                      <ArrowRightCircle className="w-5 h-5" />
                    ) : (
                      <ArrowLeftCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white">
                        {item.title || (item.type === "in" ? "স্কুলে আগমন নিশ্চিতকরণ" : "স্কুল থেকে প্রস্থান")}
                      </span>
                      <span className="text-[11px] font-mono text-amber-300 font-bold">
                        {item.time || item.timeOnly}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {item.message || item.notificationMessage}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                      <span>তারিখ: {item.date || item.dateOnly || "আজ"}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">✓ SMS ও অ্যাপে সফলভাবে প্রেরিত</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. EXAM RESULTS & TRANSCRIPT */}
      {activeTab === "exam_results" && latestExamResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
            <div>
              <h4 className="text-base font-black text-amber-300">
                {latestExamResult.examName} — অফিসিয়াল ফলাফল
              </h4>
              <p className="text-xs text-slate-300">
                শ্রেণি: {latestExamResult.className} | রোল: {latestExamResult.roll} | মেধা স্থান: {latestExamResult.classRank}ম
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">সর্বমোট GPA</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {latestExamResult.averageGpa.toFixed(2)} ({latestExamResult.finalGrade})
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-black">
                  <th className="p-2.5">বিষয়</th>
                  <th className="p-2.5 text-center">পূর্ণমান</th>
                  <th className="p-2.5 text-center">লিখিত</th>
                  <th className="p-2.5 text-center">MCQ</th>
                  <th className="p-2.5 text-center">মোট নম্বর</th>
                  <th className="p-2.5 text-center">গ্রেড</th>
                  <th className="p-2.5 text-center">পয়েন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {latestExamResult.subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white">{sub.subjectName}</td>
                    <td className="p-2.5 text-center font-mono text-slate-400">১০০</td>
                    <td className="p-2.5 text-center font-mono">{sub.cqMarks}</td>
                    <td className="p-2.5 text-center font-mono">{sub.mcqMarks}</td>
                    <td className="p-2.5 text-center font-mono font-black text-amber-300 text-sm">
                      {sub.totalMarks}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-300">
                      {sub.gpa.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-amber-300 font-bold block">শ্রেণি শিক্ষকের মন্তব্য:</span>
            <p className="text-slate-300 italic">"{latestExamResult.teacherRemarks}"</p>
          </div>
        </div>
      )}

      {/* 3. ID & ADMIT CARD PREVIEW */}
      {activeTab === "id_admit" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Card Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-300">স্মার্ট ডিজিটাল আইডি কার্ড</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  ACTIVE 2026
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-amber-400 overflow-hidden shrink-0 flex items-center justify-center font-black text-xs">
                  ছবি
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-black text-white text-sm">{studentName}</div>
                  <div className="text-slate-400">শ্রেণি: {studentClass} | রোল: {studentRoll}</div>
                  <div className="text-emerald-400 font-mono text-[11px]">ID: {studentId}</div>
                  <div className="text-[10px] text-amber-300 font-bold">ডি-লিকন ডিজিটাল ক্যাম্পাস সিকিউরড</div>
                </div>
              </div>
            </div>

            {/* Admit Card Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-rose-300">পরীক্ষার প্রবেশপত্র (Admit Pass)</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                  হলে প্রদর্শন বাধ্যতামূলক
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-300">
                <div>পরীক্ষা: <span className="font-bold text-white">১ম সাময়িক পরীক্ষা — ২০২৬</span></div>
                <div>আসন নম্বর: <span className="font-bold text-amber-300">রুম ৩০১ (বেঞ্চ ২)</span></div>
                <div>কেন্দ্র: <span className="font-bold text-white">ডি-লিকন মডেল একাডেমী মেইন ক্যাম্পাস</span></div>
                <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                  ✓ হলে প্রবেশের সময় প্রবেশপত্র স্ক্যান করলে অভিভাবকের ফোনে উপস্থিতি মেসেজ যাবে।
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PTA GUARDIAN MEETINGS & RESOLUTION BOOK */}
      {activeTab === "pta_meetings" && activeMeeting && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                  আনুষ্ঠানিক আমন্ত্রণপত্র
                </span>
                <h4 className="text-sm font-black text-white">{activeMeeting.title}</h4>
              </div>
              <div className="text-right text-xs font-mono text-amber-300 font-bold">
                {activeMeeting.meetingDate} ({activeMeeting.meetingTime})
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {activeMeeting.letterBody}
            </p>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <span className="font-black text-indigo-300 block">সভার আলোচ্যসূচি (Agenda):</span>
              <ul className="space-y-1 text-slate-300 pl-4 list-disc font-medium">
                {activeMeeting.agenda.map((ag, i) => (
                  <li key={i}>{ag}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resolutions */}
          {activeMeeting.resolutions.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>সভায় সর্বসম্মতিক্রমে গৃহীত সিদ্ধান্তের রেজুলেশন খাতা:</span>
              </h4>

              <div className="space-y-2">
                {activeMeeting.resolutions.map((res) => (
                  <div key={res.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white flex justify-between">
                      <span>সিদ্ধান্ত #{res.decisionNumber}: {res.proposal}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{res.implementationDeadline}</span>
                    </div>
                    <div className="text-emerald-300 font-bold">✓ গৃহীত সিদ্ধান্ত: {res.decision}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
