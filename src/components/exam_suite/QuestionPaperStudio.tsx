// src/components/exam_suite/QuestionPaperStudio.tsx
import React, { useState } from "react";
import {
  FileText,
  Printer,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Columns,
  Layers,
  Copy,
  Download
} from "lucide-react";
import { QuestionPaper, QuestionPaperItem } from "./examTypes";
import { SAMPLE_QUESTION_PAPERS } from "./examMockData";

export const QuestionPaperStudio: React.FC = () => {
  const [papers, setPapers] = useState<QuestionPaper[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_question_papers");
      return saved ? JSON.parse(saved) : SAMPLE_QUESTION_PAPERS;
    } catch {
      return SAMPLE_QUESTION_PAPERS;
    }
  });

  const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0]?.id || "qp-bangla-5");
  const [twoColumnLayout, setTwoColumnLayout] = useState<boolean>(true);
  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);

  const activePaper = papers.find(p => p.id === selectedPaperId) || papers[0];

  const handleSavePapers = (updated: QuestionPaper[]) => {
    setPapers(updated);
    localStorage.setItem("dlikon_question_papers", JSON.stringify(updated));
  };

  const handleUpdateActivePaper = (updatedPaper: QuestionPaper) => {
    const updated = papers.map(p => p.id === updatedPaper.id ? updatedPaper : p);
    handleSavePapers(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddCQ = (sectionId: string) => {
    if (!activePaper) return;
    const newCQ: QuestionPaperItem = {
      id: "cq-" + Date.now(),
      type: "cq",
      number: String(activePaper.sections.flatMap(s => s.items).length + 1),
      stem: "নতুন উদ্দীপক এখানে লিখুন...",
      cqParts: {
        ka: { text: "জ্ঞানমূলক প্রশ্ন লিখুন?", marks: 1 },
        kha: { text: "অনুধাবনমূলক প্রশ্ন লিখুন? বুঝিয়ে লেখ।", marks: 2 },
        ga: { text: "উদ্দীপকের আলোকে প্রয়োগমূলক ব্যাখ্যা কর।", marks: 3 },
        gha: { text: "উচ্চতর দক্ষতামূলক বিশ্লেষণ কর।", marks: 4 }
      }
    };

    const updatedSections = activePaper.sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, newCQ] };
      }
      return sec;
    });

    handleUpdateActivePaper({ ...activePaper, sections: updatedSections });
  };

  const handleAddMCQ = (sectionId: string) => {
    if (!activePaper) return;
    const newMCQ: QuestionPaperItem = {
      id: "mcq-" + Date.now(),
      type: "mcq",
      number: String(activePaper.sections.flatMap(s => s.items).length + 1),
      mcqQuestion: "নতুন বহু-নির্বাচনী প্রশ্ন এখানে লিখুন?",
      mcqOptions: ["বিকল্প ক", "বিকল্প খ", "বিকল্প গ", "বিকল্প ঘ"],
      correctOption: 0
    };

    const updatedSections = activePaper.sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, newMCQ] };
      }
      return sec;
    });

    handleUpdateActivePaper({ ...activePaper, sections: updatedSections });
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    if (!activePaper) return;
    const updatedSections = activePaper.sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.filter(it => it.id !== itemId) };
      }
      return sec;
    });
    handleUpdateActivePaper({ ...activePaper, sections: updatedSections });
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar - No Print */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white">
                রেডিমেট প্রশ্নপত্র তৈরির স্টুডিও (Question Paper Maker)
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                A4 Board Format
              </span>
            </div>
            <p className="text-xs text-slate-400">
              সৃজনশীল (CQ), বহুনির্বাচনী (MCQ) ও সংক্ষিপ্ত প্রশ্নাবলীর অফিশিয়াল প্রশ্নপত্র প্রিন্ট ও সম্পাদনা
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <select
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            {papers.map(p => (
              <option key={p.id} value={p.id}>
                {p.subjectName} — {p.className}
              </option>
            ))}
          </select>

          {/* Toggle Layout */}
          <button
            onClick={() => setTwoColumnLayout(!twoColumnLayout)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            title="দুই কলাম অথবা এক কলাম লেআউট সুইচ করুন"
          >
            <Columns className="w-3.5 h-3.5 text-indigo-400" />
            <span>{twoColumnLayout ? "২-কলাম বোর্ড স্টাইল" : "১-কলাম স্টাইল"}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>A4 প্রশ্নপত্র প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Question Management Toolbar - No Print */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900">পরীক্ষার তথ্য কাস্টমাইজেশন:</span>
            <button
              onClick={() => setIsEditingMeta(!isEditingMeta)}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingMeta ? "সম্পাদনা বন্ধ করুন" : "শিরোনাম ও তথ্য এডিট"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activePaper?.sections.map(sec => (
              <div key={sec.id} className="flex gap-1.5">
                <button
                  onClick={() => handleAddCQ(sec.id)}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ নতুন সৃজনশীল ({sec.sectionName.split(":")[0]})</span>
                </button>
                <button
                  onClick={() => handleAddMCQ(sec.id)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ নতুন MCQ</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {isEditingMeta && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম</label>
              <input
                type="text"
                value={activePaper.schoolName}
                onChange={(e) => handleUpdateActivePaper({ ...activePaper, schoolName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">পরীক্ষার নাম</label>
              <input
                type="text"
                value={activePaper.examName}
                onChange={(e) => handleUpdateActivePaper({ ...activePaper, examName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">বিষয় ও কোড</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={activePaper.subjectName}
                  onChange={(e) => handleUpdateActivePaper({ ...activePaper, subjectName: e.target.value })}
                  className="w-2/3 bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900"
                />
                <input
                  type="text"
                  value={activePaper.subjectCode}
                  onChange={(e) => handleUpdateActivePaper({ ...activePaper, subjectCode: e.target.value })}
                  className="w-1/3 bg-white border border-slate-300 rounded px-2 py-1.5 font-mono text-center font-bold text-slate-900"
                  placeholder="কোড"
                />
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">শ্রেণি, সময় ও পূর্ণমান</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={activePaper.className}
                  onChange={(e) => handleUpdateActivePaper({ ...activePaper, className: e.target.value })}
                  className="w-1/3 bg-white border border-slate-300 rounded px-1.5 py-1.5 text-center font-bold text-slate-900 text-[11px]"
                />
                <input
                  type="text"
                  value={activePaper.duration}
                  onChange={(e) => handleUpdateActivePaper({ ...activePaper, duration: e.target.value })}
                  className="w-1/3 bg-white border border-slate-300 rounded px-1.5 py-1.5 text-center font-bold text-slate-900 text-[11px]"
                />
                <input
                  type="number"
                  value={activePaper.totalMarks}
                  onChange={(e) => handleUpdateActivePaper({ ...activePaper, totalMarks: Number(e.target.value) })}
                  className="w-1/3 bg-white border border-slate-300 rounded px-1.5 py-1.5 text-center font-bold text-slate-900 text-[11px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE A4 QUESTION PAPER SHEET */}
      <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
        {/* Board Standard Institutional Header */}
        <div className="text-center border-b-2 border-black pb-3 mb-4 space-y-1">
          <div className="inline-block border border-black px-3 py-0.5 rounded text-[11px] font-black tracking-widest uppercase mb-1">
            সেট কোড: {activePaper.setCode}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black">
            {activePaper.schoolName}
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">
            {activePaper.examName} ({activePaper.academicYear})
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs font-extrabold text-slate-900 pt-1">
            <span>বিষয়: {activePaper.subjectName}</span>
            <span>•</span>
            <span>বিষয় কোড: {activePaper.subjectCode}</span>
            <span>•</span>
            <span>শ্রেণি: {activePaper.className}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-2 px-2 border-t border-dashed border-slate-400 mt-2">
            <span>সময়: {activePaper.duration}</span>
            <span className="italic text-[11px]">{activePaper.instructions}</span>
            <span>পূর্ণমান: {activePaper.totalMarks}</span>
          </div>
        </div>

        {/* Question Sections Layout */}
        <div className={`space-y-6 ${twoColumnLayout ? "lg:columns-2 lg:gap-8 print:columns-2 print:gap-6" : ""}`}>
          {activePaper.sections.map((section) => (
            <div key={section.id} className="break-inside-avoid space-y-4 mb-6">
              {/* Section Header */}
              <div className="border-b border-black pb-1 flex items-center justify-between text-xs font-black bg-slate-100 print:bg-transparent px-2 py-1">
                <span>{section.sectionName}</span>
                {section.requiredCount && (
                  <span className="text-[11px] font-bold italic text-slate-700">
                    [{section.requiredCount}]
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={item.id} className="relative group text-xs text-black leading-relaxed break-inside-avoid">
                    {/* Delete button (No-print) */}
                    <button
                      onClick={() => handleDeleteItem(section.id, item.id)}
                      className="no-print absolute -top-2 -right-2 p-1 bg-red-100 hover:bg-red-200 text-red-650 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                      title="প্রশ্ন মুছে ফেলুন"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* 1. CREATIVE QUESTION (CQ) */}
                    {item.type === "cq" && (
                      <div className="space-y-2">
                        <div className="font-semibold text-justify">
                          <span className="font-black mr-1">{item.number}।</span>
                          <span className="bg-slate-50 print:bg-transparent p-1 rounded inline-block">
                            {item.stem}
                          </span>
                        </div>
                        {item.cqParts && (
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-start">
                              <span>(ক) {item.cqParts.ka.text}</span>
                              <span className="font-bold ml-2">[{item.cqParts.ka.marks}]</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span>(খ) {item.cqParts.kha.text}</span>
                              <span className="font-bold ml-2">[{item.cqParts.kha.marks}]</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span>(গ) {item.cqParts.ga.text}</span>
                              <span className="font-bold ml-2">[{item.cqParts.ga.marks}]</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span>(ঘ) {item.cqParts.gha.text}</span>
                              <span className="font-bold ml-2">[{item.cqParts.gha.marks}]</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. MULTIPLE CHOICE QUESTION (MCQ) */}
                    {item.type === "mcq" && (
                      <div className="space-y-1.5">
                        <div className="font-bold">
                          <span>{item.number}। </span>
                          <span>{item.mcqQuestion}</span>
                        </div>
                        {item.mcqOptions && (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-4 text-[11.5px]">
                            <div>(ক) {item.mcqOptions[0]}</div>
                            <div>(খ) {item.mcqOptions[1]}</div>
                            <div>(গ) {item.mcqOptions[2]}</div>
                            <div>(ঘ) {item.mcqOptions[3]}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. SHORT QUESTION */}
                    {item.type === "short" && (
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold">{item.number}। </span>
                          <span>{item.shortQuestion}</span>
                        </div>
                        {item.marks && <span className="font-bold ml-2">[{item.marks}]</span>}
                      </div>
                    )}

                    {/* 4. ESSAY TOPIC */}
                    {item.type === "essay" && (
                      <div className="flex justify-between items-start bg-slate-50 print:bg-transparent p-2 rounded">
                        <div>
                          <span className="font-bold">{item.number}। </span>
                          <span>{item.essayTopic}</span>
                        </div>
                        {item.marks && <span className="font-bold ml-2">[{item.marks}]</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Paper End Marking */}
        <div className="text-center pt-8 border-t border-dashed border-slate-300 mt-8 text-[11px] text-slate-500 font-bold">
          — [ সমাপ্ত ] —
        </div>
      </div>
    </div>
  );
};
