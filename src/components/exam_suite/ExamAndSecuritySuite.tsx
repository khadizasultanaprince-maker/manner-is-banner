// src/components/exam_suite/ExamAndSecuritySuite.tsx
import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  BookMarked,
  CreditCard,
  ShieldCheck,
  FileBadge,
  Award,
  Users,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronRight
} from "lucide-react";
import { QuestionPaperStudio } from "./QuestionPaperStudio";
import { SyllabusNotesMaker } from "./SyllabusNotesMaker";
import { IDCardStudio } from "./IDCardStudio";
import { GateSecurityScanner } from "./GateSecurityScanner";
import { AdmitCardStudio } from "./AdmitCardStudio";
import { MarkEntryAndResultSuite } from "./MarkEntryAndResultSuite";
import { GuardianMeetingManager } from "./GuardianMeetingManager";
import { GateSMSConfigPanel } from "./GateSMSConfigPanel";
import { MessageSquare, Settings } from "lucide-react";

export type ExamSuiteTab =
  | "question_paper"
  | "syllabus_notes"
  | "id_cards"
  | "gate_scanner"
  | "gate_sms_config"
  | "admit_cards"
  | "marks_results"
  | "guardian_meetings";

interface ExamAndSecuritySuiteProps {
  initialSubTab?: ExamSuiteTab;
}

export const ExamAndSecuritySuite: React.FC<ExamAndSecuritySuiteProps> = ({
  initialSubTab = "marks_results"
}) => {
  const [activeTab, setActiveTab] = useState<ExamSuiteTab>(initialSubTab);

  return (
    <div className="w-full space-y-6">
      {/* Master Institutional Suite Header */}
      <div className="no-print bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-amber-300" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  ডি-লিকন ডিজিটাল এক্সাম অ্যান্ড ক্যাম্পাস সিকিউরিটি স্যুট
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Exam Controller & PTA Engine
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                পরীক্ষা নিয়ন্ত্রণ ও স্মার্ট ক্যাম্পাস নিরাপত্তা ব্যবস্থা
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                প্রশ্নপত্র প্রণয়ন • টার্মভিত্তিক সিলেবাস • স্মার্ট আইডি কার্ড ও ডিজিটাল গেট স্ক্যানার • এডমিট কার্ড • খসড়া মার্ক এন্ট্রি ও ইনস্ট্যান্ট ট্রান্সক্রিপ্ট • অভিভাবক সভা ও লাইভ এলার্ট
              </p>
            </div>
          </div>
        </div>

        {/* 8-MODULE NAVIGATION TABS BAR */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* 1. Question Paper */}
          <button
            onClick={() => setActiveTab("question_paper")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "question_paper"
                ? "bg-indigo-600 text-white border-indigo-400 shadow-lg ring-2 ring-indigo-400"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span className="text-[9px] font-mono opacity-60">০১</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">প্রশ্নপত্র স্টুডিও</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">রেডিমেট CQ/MCQ</span>
            </div>
          </button>

          {/* 2. Syllabus & Notes */}
          <button
            onClick={() => setActiveTab("syllabus_notes")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "syllabus_notes"
                ? "bg-teal-600 text-white border-teal-400 shadow-lg ring-2 ring-teal-400"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <BookMarked className="w-4 h-4 text-emerald-300" />
              <span className="text-[9px] font-mono opacity-60">০২</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">সিলেবাস ও নোটস</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">পড়ার হ্যান্ডআউট</span>
            </div>
          </button>

          {/* 3. ID Cards */}
          <button
            onClick={() => setActiveTab("id_cards")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "id_cards"
                ? "bg-amber-600 text-white border-amber-400 shadow-lg ring-2 ring-amber-400"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span className="text-[9px] font-mono opacity-60">০৩</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">স্মার্ট আইডি কার্ড</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">QR ও ব্যাচ প্রিন্ট</span>
            </div>
          </button>

          {/* 4. Gate Security & Live Messages */}
          <button
            onClick={() => setActiveTab("gate_scanner")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "gate_scanner"
                ? "bg-emerald-600 text-white border-emerald-400 shadow-lg ring-2 ring-emerald-400"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="text-[9px] font-mono opacity-60">০৪</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">গেট স্ক্যানার</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">আইডি কার্ড রিডার</span>
            </div>
          </button>

          {/* 5. Gate SMS & Automated Notifications Config */}
          <button
            onClick={() => setActiveTab("gate_sms_config")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "gate_sms_config"
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-lg ring-2 ring-amber-300"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className={`w-4 h-4 ${activeTab === "gate_sms_config" ? "text-slate-950" : "text-amber-300"}`} />
              <span className="text-[9px] font-mono opacity-60">০৫</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">এসএমএস কনফিগ</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">স্বয়ংক্রিয় এলার্ট সেটিংস</span>
            </div>
          </button>

          {/* 6. Exam Admit Cards */}
          <button
            onClick={() => setActiveTab("admit_cards")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "admit_cards"
                ? "bg-rose-600 text-white border-rose-400 shadow-lg ring-2 ring-rose-400"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileBadge className="w-4 h-4 text-rose-300" />
              <span className="text-[9px] font-mono opacity-60">০৬</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">এডমিট কার্ড</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">পরীক্ষার সময়সূচি</span>
            </div>
          </button>

          {/* 7. Marks & Result Transcript */}
          <button
            onClick={() => setActiveTab("marks_results")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "marks_results"
                ? "bg-purple-600 text-white border-purple-400 shadow-lg ring-2 ring-purple-400"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Award className="w-4 h-4 text-purple-300" />
              <span className="text-[9px] font-mono opacity-60">০৭</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">মার্ক ও ট্রান্সক্রিপ্ট</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">রেজাল্ট প্রকাশনা</span>
            </div>
          </button>

          {/* 8. Guardian PTA Meetings */}
          <button
            onClick={() => setActiveTab("guardian_meetings")}
            className={`p-3 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
              activeTab === "guardian_meetings"
                ? "bg-pink-600 text-white border-pink-400 shadow-lg ring-2 ring-pink-400"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 h-4 text-pink-300" />
              <span className="text-[9px] font-mono opacity-60">০৮</span>
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">অভিভাবক সভা</span>
              <span className="text-[10px] opacity-75 leading-tight block mt-0.5">অনুপস্থিতি এলার্ট</span>
            </div>
          </button>
        </div>
      </div>

      {/* ACTIVE SUBMODULE CONTENT */}
      <div>
        {activeTab === "question_paper" && <QuestionPaperStudio />}
        {activeTab === "syllabus_notes" && <SyllabusNotesMaker />}
        {activeTab === "id_cards" && <IDCardStudio />}
        {activeTab === "gate_scanner" && <GateSecurityScanner />}
        {activeTab === "gate_sms_config" && <GateSMSConfigPanel />}
        {activeTab === "admit_cards" && <AdmitCardStudio />}
        {activeTab === "marks_results" && <MarkEntryAndResultSuite />}
        {activeTab === "guardian_meetings" && <GuardianMeetingManager />}
      </div>
    </div>
  );
};
