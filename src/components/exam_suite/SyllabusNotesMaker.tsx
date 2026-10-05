// src/components/exam_suite/SyllabusNotesMaker.tsx
import React, { useState } from "react";
import {
  BookMarked,
  Printer,
  Plus,
  Trash2,
  FileCheck,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Calendar,
  GraduationCap
} from "lucide-react";
import { SyllabusItem, LectureNote } from "./examTypes";
import { SAMPLE_SYLLABUS, SAMPLE_LECTURE_NOTES } from "./examMockData";

export const SyllabusNotesMaker: React.FC = () => {
  const [activeView, setActiveView] = useState<"syllabus" | "notes">("syllabus");

  const [syllabuses, setSyllabuses] = useState<SyllabusItem[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_syllabuses");
      return saved ? JSON.parse(saved) : SAMPLE_SYLLABUS;
    } catch {
      return SAMPLE_SYLLABUS;
    }
  });

  const [notes, setNotes] = useState<LectureNote[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_lecture_notes");
      return saved ? JSON.parse(saved) : SAMPLE_LECTURE_NOTES;
    } catch {
      return SAMPLE_LECTURE_NOTES;
    }
  });

  const [selectedSylIndex, setSelectedSylIndex] = useState<number>(0);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number>(0);

  const currentSyllabus = syllabuses[selectedSylIndex] || syllabuses[0];
  const currentNote = notes[selectedNoteIndex] || notes[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controller Header - No Print */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white">
                সিলেবাস ও লেকচার নোটস মেকার (Syllabus & Lecture Handout Maker)
              </h2>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                Student Handout Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              টার্মভিত্তিক পরীক্ষার সিলেবাস কাঠামো ও শ্রেণিকক্ষের পড়ার হ্যান্ডআউট তৈরি
            </p>
          </div>
        </div>

        {/* View Switcher & Print */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-700">
            <button
              onClick={() => setActiveView("syllabus")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === "syllabus"
                  ? "bg-teal-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📋 পরীক্ষার সিলেবাস
            </button>
            <button
              onClick={() => setActiveView("notes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === "notes"
                  ? "bg-teal-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📖 লেকচার নোটস / পড়ার শিট
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-teal-950/40 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>A4 ফরম্যাটে প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* SYLLABUS VIEW */}
      {activeView === "syllabus" && currentSyllabus && (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-3 mb-5">
            <div className="inline-block bg-teal-50 border border-teal-800 px-3 py-0.5 rounded text-[11px] font-black uppercase text-teal-950 mb-1">
              টার্মভিত্তিক পরীক্ষার সিলেবাস — ২০২৬
            </div>
            <h1 className="text-2xl font-black text-black">ডি-লিকন মডেল একাডেমী</h1>
            <p className="text-xs text-slate-700 font-bold mt-0.5">
              শুদ্ধাচার, নৈতিকতা ও মেধা বিকাশের আদর্শ বিদ্যাপীঠ
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-extrabold mt-2 pt-2 border-t border-dashed border-slate-400">
              <span>শ্রেণি: {currentSyllabus.className}</span>
              <span>•</span>
              <span>বিষয়: {currentSyllabus.subject}</span>
              <span>•</span>
              <span>টার্ম: {currentSyllabus.term}</span>
            </div>
          </div>

          {/* Chapters Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-black border-l-4 border-teal-700 pl-2">
              নির্ধারিত অধ্যায় ও বিষয়বস্তু তালিকা:
            </h3>

            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100 print:bg-transparent font-black text-center">
                  <th className="border border-black p-2 w-16">অধ্যায়</th>
                  <th className="border border-black p-2 text-left">শিরোনাম</th>
                  <th className="border border-black p-2 text-left">মূল বিষয়বস্তু ও ফোকাস</th>
                  <th className="border border-black p-2 w-20">সম্ভাব্য ক্লাস</th>
                  <th className="border border-black p-2 w-20">নম্বর বণ্টন</th>
                </tr>
              </thead>
              <tbody>
                {currentSyllabus.chapters.map((ch, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border border-black p-2 text-center font-bold">{ch.chapterNo}</td>
                    <td className="border border-black p-2 font-bold">{ch.chapterTitle}</td>
                    <td className="border border-black p-2 text-[11px] leading-relaxed">
                      {ch.topics.join(", ")}
                    </td>
                    <td className="border border-black p-2 text-center font-bold">{ch.estimatedClasses} টি</td>
                    <td className="border border-black p-2 text-center font-black">{ch.weightage}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Exam Pattern & Guidelines */}
            <div className="bg-slate-50 print:bg-transparent border border-black p-3 rounded mt-4 text-xs space-y-1">
              <span className="font-black text-slate-900 block">প্রশ্নপত্রের ধরন ও নির্দেশিকা:</span>
              <p className="text-slate-800 leading-relaxed font-semibold">
                {currentSyllabus.examPattern}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-16 text-center text-xs font-bold mt-8 border-t border-dashed border-slate-300">
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">বিষয় শিক্ষক</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">পরীক্ষা নিয়ন্ত্রক</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">প্রধান শিক্ষক</div>
            </div>
          </div>
        </div>
      )}

      {/* LECTURE NOTES / HANDOUT VIEW */}
      {activeView === "notes" && currentNote && (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                ক্লাসরুম স্টাডি হ্যান্ডআউট (Lecture Handout)
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-black mt-1">
                {currentNote.title}
              </h1>
              <div className="flex gap-3 text-xs font-bold text-slate-800 mt-1">
                <span>শ্রেণি: {currentNote.className}</span>
                <span>•</span>
                <span>বিষয়: {currentNote.subject}</span>
                <span>•</span>
                <span>{currentNote.chapter}</span>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-600">প্রণয়নে:</div>
              <div className="font-black text-slate-900">{currentNote.authorTeacher}</div>
              <div className="text-[10px] text-slate-500 font-mono">তারিখ: {currentNote.createdAt}</div>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-black text-sm border-l-4 border-emerald-600 pl-2 mb-1.5">
                ১. মূল আলোচ্য ধারণাসমূহ (Key Concepts):
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-800 font-medium">
                {currentNote.keyConcepts.map((kc, i) => (
                  <li key={i}>{kc}</li>
                ))}
              </ul>
            </div>

            {/* Lecture Summary */}
            <div className="bg-slate-50 print:bg-transparent border border-slate-300 p-3 rounded">
              <h4 className="font-bold text-slate-900 mb-1">পাঠের সারসংক্ষেপ (Summary):</h4>
              <p className="text-slate-800 leading-relaxed font-semibold">
                {currentNote.lectureSummary}
              </p>
            </div>

            {/* Formulas or Definitions */}
            {currentNote.importantFormulasOrDefinitions.length > 0 && (
              <div>
                <h3 className="font-black text-sm border-l-4 border-indigo-600 pl-2 mb-1.5">
                  ২. গুরুত্বপূর্ণ সূত্র ও সংজ্ঞাবলী:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentNote.importantFormulasOrDefinitions.map((f, i) => (
                    <div key={i} className="border border-black p-2 rounded text-center font-bold bg-amber-50/50 print:bg-transparent text-[11px]">
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Questions & Answers */}
            <div>
              <h3 className="font-black text-sm border-l-4 border-purple-600 pl-2 mb-2">
                ৩. গুরুত্বপূর্ণ নমুনা প্রশ্নোত্তর (Model Q&A):
              </h3>
              <div className="space-y-3">
                {currentNote.modelQuestionsAndAnswers.map((item, i) => (
                  <div key={i} className="border border-slate-300 rounded p-3 bg-white space-y-1.5">
                    <div className="font-black text-slate-900 flex justify-between">
                      <span>{item.q}</span>
                      <span>[{item.marks} নম্বর]</span>
                    </div>
                    <pre className="text-xs font-sans whitespace-pre-wrap text-slate-700 bg-slate-50 print:bg-transparent p-2 rounded border border-dashed border-slate-200">
                      {item.a}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Homework Assignment */}
            <div className="border-2 border-dashed border-emerald-600 p-3 rounded bg-emerald-50/30 print:bg-transparent">
              <h4 className="font-black text-emerald-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>বাড়ির কাজ (Homework Assignment):</span>
              </h4>
              <p className="font-bold text-slate-900 mt-1 pl-5">
                {currentNote.homework}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
