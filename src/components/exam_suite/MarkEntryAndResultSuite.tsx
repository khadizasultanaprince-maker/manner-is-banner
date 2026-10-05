// src/components/exam_suite/MarkEntryAndResultSuite.tsx
import React, { useState } from "react";
import {
  Award,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Send,
  Sparkles,
  TrendingUp,
  FileText,
  UserCheck,
  Search,
  BookOpen
} from "lucide-react";
import { SubjectMarks, StudentExamRecord, calculateGradeAndGPA } from "./examTypes";
import { SAMPLE_EXAM_RECORDS } from "./examMockData";
import { studentsByClass } from "../../studentsData";
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const SUBJECTS_LIST = [
  { name: "বাংলা", code: "১০১", max: 100 },
  { name: "ইংরেজি", code: "১০২", max: 100 },
  { name: "প্রাথমিক গণিত", code: "১০৩", max: 100 },
  { name: "বাংলাদেশ ও বিশ্বপরিচয়", code: "১০৪", max: 100 },
  { name: "প্রাথমিক বিজ্ঞান", code: "১০৫", max: 100 },
  { name: "ইসলাম ও নৈতিক শিক্ষা", code: "১০৬", max: 100 }
];

export const MarkEntryAndResultSuite: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"blank_sheet" | "marks_entry" | "transcript">("marks_entry");
  const [selectedClass, setSelectedClass] = useState<string>("পঞ্চম শ্রেণি");
  const [selectedSubject, setSelectedSubject] = useState<string>("বাংলা");
  const [examName, setExamName] = useState<string>("১ম সাময়িক পরীক্ষা — ২০২৬");

  const [records, setRecords] = useState<StudentExamRecord[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_student_exam_records");
      return saved ? JSON.parse(saved) : SAMPLE_EXAM_RECORDS;
    } catch {
      return SAMPLE_EXAM_RECORDS;
    }
  });

  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string>("");

  const currentClassStudents = studentsByClass[selectedClass] || studentsByClass["পঞ্চম শ্রেণি"] || [];

  // Active student for transcript view
  const [selectedStudentRoll, setSelectedStudentRoll] = useState<string>(currentClassStudents[0]?.roll || "০১");
  const currentRecord = records.find(r => r.roll === selectedStudentRoll && r.className === selectedClass) || records[0];

  const handlePrint = () => {
    window.print();
  };

  // Update marks for a specific student
  const handleUpdateStudentMarks = (
    roll: string,
    studentName: string,
    cq: number,
    mcq: number,
    cont: number
  ) => {
    const total = cq + mcq + cont;
    const { grade, gpa } = calculateGradeAndGPA(total, 100);

    const existingRecIndex = records.findIndex(r => r.roll === roll && r.className === selectedClass);
    let updatedRecords = [...records];

    if (existingRecIndex !== -1) {
      const rec = { ...updatedRecords[existingRecIndex] };
      const subIndex = rec.subjects.findIndex(s => s.subjectName === selectedSubject);

      const newSubjectEntry: SubjectMarks = {
        subjectName: selectedSubject,
        subjectCode: SUBJECTS_LIST.find(s => s.name === selectedSubject)?.code || "১০০",
        cqMarks: cq,
        mcqMarks: mcq,
        continuousMarks: cont,
        totalMarks: total,
        highestMarks: Math.max(90, total),
        grade,
        gpa
      };

      if (subIndex !== -1) {
        rec.subjects[subIndex] = newSubjectEntry;
      } else {
        rec.subjects.push(newSubjectEntry);
      }

      // Re-calculate grand total and average GPA
      const grandTotal = rec.subjects.reduce((sum, s) => sum + s.totalMarks, 0);
      const avgGpa = Number((rec.subjects.reduce((sum, s) => sum + s.gpa, 0) / rec.subjects.length).toFixed(2));
      rec.grandTotal = grandTotal;
      rec.averageGpa = avgGpa;
      rec.finalGrade = avgGpa >= 5.0 ? "A+" : avgGpa >= 4.0 ? "A" : avgGpa >= 3.5 ? "A-" : avgGpa >= 3.0 ? "B" : avgGpa >= 2.0 ? "C" : avgGpa >= 1.0 ? "D" : "F";

      updatedRecords[existingRecIndex] = rec;
    } else {
      // Create new record
      const newRec: StudentExamRecord = {
        id: "rec-" + Date.now() + "-" + roll,
        studentId: "DLM-" + roll,
        studentName,
        className: selectedClass,
        roll,
        examName,
        academicYear: "২০২৬",
        subjects: [
          {
            subjectName: selectedSubject,
            subjectCode: SUBJECTS_LIST.find(s => s.name === selectedSubject)?.code || "১০০",
            cqMarks: cq,
            mcqMarks: mcq,
            continuousMarks: cont,
            totalMarks: total,
            highestMarks: 95,
            grade,
            gpa
          }
        ],
        grandTotal: total,
        averageGpa: gpa,
        finalGrade: grade,
        classRank: 1,
        totalStudentsInClass: currentClassStudents.length,
        teacherRemarks: "অগ্রগতি সন্তোষজনক। রুটিনমাফিক অধ্যয়নে নিয়মিত থাকুন।",
        principalRemarks: "উত্তীর্ণ ও পুরস্কৃত করার জন্য সুপারিশকৃত।",
        publishedToParent: true,
        publishedAt: "২০২৬-১০-০৫"
      };
      updatedRecords.push(newRec);
    }

    setRecords(updatedRecords);
    localStorage.setItem("dlikon_student_exam_records", JSON.stringify(updatedRecords));
  };

  // Publish / Push Result to Parent Portal
  const handlePublishResults = async () => {
    try {
      const updated = records.map(r => ({
        ...r,
        publishedToParent: true,
        publishedAt: new Date().toLocaleDateString("bn-BD")
      }));
      setRecords(updated);
      localStorage.setItem("dlikon_student_exam_records", JSON.stringify(updated));

      // Push to Firestore
      try {
        const docRef = doc(db, "exam_results_published", `${selectedClass}_${examName}`);
        await setDoc(docRef, {
          className: selectedClass,
          examName,
          records: updated,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore optional offline fallback:", err);
      }

      setPublishSuccessMsg(`🎉 অভিনন্দন! '${selectedClass}'-এর সকল শিক্ষার্থীর রেজাল্ট কার্ড অভিভাবক ড্যাশবোর্ডে সফলভাবে প্রকাশিত হয়েছে।`);
      setTimeout(() => setPublishSuccessMsg(""), 6000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header - No Print */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white">
                মার্ক এন্ট্রি ও একাডেমিক ট্রান্সক্রিপ্ট স্যুট (Marks & Result Transcript System)
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                Instant GPA & Rank Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              খসড়া ফরম প্রিন্ট → ডিজিটাল নম্বর এন্ট্রি → মুহূর্তেই রেজাল্ট কার্ড তৈরি ও অভিভাবকের ড্যাশবোর্ডে সেন্ড
            </p>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-700">
            <button
              onClick={() => setActiveSubTab("blank_sheet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === "blank_sheet"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📄 ১. খসড়া মার্ক ফরম (খাতা দেখার শিট)
            </button>
            <button
              onClick={() => setActiveSubTab("marks_entry")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === "marks_entry"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ ২. ডিজিটাল মার্ক এন্ট্রি গ্রিড
            </button>
            <button
              onClick={() => setActiveSubTab("transcript")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === "transcript"
                  ? "bg-amber-600 text-white shadow font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎓 ৩. রেজাল্ট কার্ড / ট্রান্সক্রিপ্ট (A4)
            </button>
          </div>

          <button
            onClick={handlePublishResults}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="অভিভাবকদের ড্যাশবোর্ডে লাইভ রেজাল্ট প্রকাশ করুন"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span>অভিভাবক ড্যাশবোর্ডে রেজাল্ট পাঠান</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>A4 প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {publishSuccessMsg && (
        <div className="no-print bg-emerald-950 border-2 border-emerald-400 p-4 rounded-xl text-white flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{publishSuccessMsg}</span>
        </div>
      )}

      {/* Class & Subject Selector Bar - No Print */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="font-bold text-slate-700 mr-2">শ্রেণি নির্বাচন:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900 outline-none"
            >
              {Object.keys(studentsByClass).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 mr-2">বিষয়:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900 outline-none"
            >
              {SUBJECTS_LIST.map(s => (
                <option key={s.name} value={s.name}>{s.name} (কোড: {s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 mr-2">পরীক্ষা:</label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900"
            />
          </div>
        </div>

        {activeSubTab === "transcript" && (
          <div>
            <label className="font-bold text-slate-700 mr-2">রোল ভিত্তিক শিক্ষার্থী:</label>
            <select
              value={selectedStudentRoll}
              onChange={(e) => setSelectedStudentRoll(e.target.value)}
              className="bg-indigo-50 border border-indigo-300 rounded px-3 py-1.5 font-black text-indigo-950 outline-none"
            >
              {currentClassStudents.map(st => (
                <option key={st.roll} value={st.roll}>
                  রোল {st.roll}: {st.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 1. BLANK MARK ENTRY SHEET (TEACHERS DRAFT PRINTOUT) */}
      {activeSubTab === "blank_sheet" && (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
              শিক্ষক মূল্যায়ন ও নম্বর লিপিবব্ধকরণ ফর্ম
            </span>
            <h1 className="text-2xl font-black text-black">ডি-লিকন মডেল একাডেমী</h1>
            <h2 className="text-base font-bold text-slate-900">
              {examName} — খসড়া মার্ক এন্ট্রি শিট
            </h2>
            <div className="flex items-center justify-center gap-4 text-xs font-black mt-2 pt-2 border-t border-dashed border-slate-400">
              <span>শ্রেণি: {selectedClass}</span>
              <span>•</span>
              <span>বিষয়: {selectedSubject}</span>
              <span>•</span>
              <span>পূর্ণমান: ১০০</span>
              <span>•</span>
              <span>শিক্ষার্থী সংখ্যা: {currentClassStudents.length} জন</span>
            </div>
          </div>

          {/* Blank Table */}
          <table className="w-full border-collapse border border-black text-xs text-center">
            <thead>
              <tr className="bg-slate-100 print:bg-transparent font-black">
                <th className="border border-black p-1.5 w-12">রোল</th>
                <th className="border border-black p-1.5 text-left pl-3">শিক্ষার্থীর নাম</th>
                <th className="border border-black p-1.5 w-20">লিখিত (CQ)<br/><span className="text-[10px] font-normal">[৭০]</span></th>
                <th className="border border-black p-1.5 w-20">নৈর্ব্যক্তিক (MCQ)<br/><span className="text-[10px] font-normal">[২০]</span></th>
                <th className="border border-black p-1.5 w-20">ধারাবাহিক/উপস্থিতি<br/><span className="text-[10px] font-normal">[১০]</span></th>
                <th className="border border-black p-1.5 w-20">মোট প্রাপ্ত<br/><span className="text-[10px] font-normal">[১০০]</span></th>
                <th className="border border-black p-1.5 w-24">গ্রেড / GPA</th>
                <th className="border border-black p-1.5 w-28">মন্তব্য</th>
              </tr>
            </thead>
            <tbody>
              {currentClassStudents.map((st) => (
                <tr key={st.roll} className="border-b border-black h-8">
                  <td className="border border-black p-1 font-mono font-bold">{st.roll}</td>
                  <td className="border border-black p-1 text-left pl-3 font-semibold">{st.name}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 font-black"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs font-bold mt-6">
            <div>
              <div className="border-t border-black pt-1 w-44 mx-auto">বিষয় শিক্ষকের স্বাক্ষর ও তারিখ</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-44 mx-auto">পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FAST DIGITAL MARKS ENTRY GRID */}
      {activeSubTab === "marks_entry" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                ডিজিটাল মার্ক এন্ট্রি গ্রিড: {selectedClass} — বিষয়: {selectedSubject}
              </h3>
              <p className="text-xs text-slate-500">
                লিখিত (CQ), নৈর্ব্যক্তিক (MCQ) ও ধারাবাহিক নম্বর ইনপুট দিন; জিপিএ ও গ্রেড স্বয়ংক্রিয়ভাবে হিসাব হবে
              </p>
            </div>
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              স্বয়ংক্রিয় লোকাল ও ক্লাউড সেভ
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-200">
                  <th className="p-2.5 w-16 text-center">রোল</th>
                  <th className="p-2.5">শিক্ষার্থীর নাম</th>
                  <th className="p-2.5 w-28 text-center">লিখিত CQ (৭০)</th>
                  <th className="p-2.5 w-28 text-center">নৈর্ব্যক্তিক MCQ (২০)</th>
                  <th className="p-2.5 w-28 text-center">ধারাবাহিক (১০)</th>
                  <th className="p-2.5 w-24 text-center">মোট নম্বর</th>
                  <th className="p-2.5 w-20 text-center">লেটার গ্রেড</th>
                  <th className="p-2.5 w-20 text-center">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClassStudents.map((st) => {
                  const studentRecord = records.find(r => r.roll === st.roll && r.className === selectedClass);
                  const subEntry = studentRecord?.subjects.find(s => s.subjectName === selectedSubject);

                  const cq = subEntry?.cqMarks ?? 55;
                  const mcq = subEntry?.mcqMarks ?? 16;
                  const cont = subEntry?.continuousMarks ?? 9;
                  const total = cq + mcq + cont;
                  const { grade, gpa } = calculateGradeAndGPA(total, 100);

                  return (
                    <tr key={st.roll} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                        {st.roll}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {st.name}
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          defaultValue={cq}
                          onBlur={(e) => {
                            const newCQ = Number(e.target.value);
                            handleUpdateStudentMarks(st.roll, st.name, newCQ, mcq, cont);
                          }}
                          className="w-16 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded font-mono focus:bg-white focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          defaultValue={mcq}
                          onBlur={(e) => {
                            const newMCQ = Number(e.target.value);
                            handleUpdateStudentMarks(st.roll, st.name, cq, newMCQ, cont);
                          }}
                          className="w-16 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded font-mono focus:bg-white focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          defaultValue={cont}
                          onBlur={(e) => {
                            const newCont = Number(e.target.value);
                            handleUpdateStudentMarks(st.roll, st.name, cq, mcq, newCont);
                          }}
                          className="w-16 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded font-mono focus:bg-white focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-center font-black text-slate-900 font-mono text-sm">
                        {total}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          grade === "A+" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                          grade === "A" ? "bg-teal-100 text-teal-800" :
                          grade === "F" ? "bg-rose-100 text-rose-800 font-bold" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {grade}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                        {gpa.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. OFFICIAL ACADEMIC TRANSCRIPT (A4 RESULT CARD) */}
      {activeSubTab === "transcript" && currentRecord && (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
          {/* Institutional Official Header with Grading Scale */}
          <div className="border-b-2 border-black pb-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="w-16 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-slate-50 font-black text-center text-[10px] leading-tight">
                মনোগ্রাম
              </div>

              <div className="text-center flex-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-700 block">
                  গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত
                </span>
                <h1 className="text-2xl font-black text-black tracking-tight">
                  ডি-লিকন মডেল একাডেমী
                </h1>
                <p className="text-xs text-slate-800 font-bold">
                  আদর্শ চরিত্র গঠন, নৈতিকতা ও ডিজিটাল শিক্ষা ব্যবস্থাপনা
                </p>
                <div className="inline-block bg-slate-900 text-white text-xs font-black px-4 py-0.5 rounded-full uppercase tracking-wider mt-1">
                  একাডেমিক ট্রান্সক্রিপ্ট / মার্কশিট (ACADEMIC TRANSCRIPT)
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  পরীক্ষা: <span className="underline font-black">{currentRecord.examName}</span> (শিক্ষাবর্ষ: ২০২৬)
                </div>
              </div>

              {/* Grading Matrix Box */}
              <div className="border border-black p-1 rounded text-[8.5px] leading-tight">
                <div className="font-bold text-center border-b border-black pb-0.5">গ্রেডিং স্কেল</div>
                <div className="grid grid-cols-3 gap-x-1.5 pt-0.5 font-mono">
                  <span>৮০-১০০</span><span className="font-bold">A+</span><span>5.0</span>
                  <span>৭০-৭৯</span><span className="font-bold">A</span><span>4.0</span>
                  <span>৬০-৬৯</span><span className="font-bold">A-</span><span>3.5</span>
                  <span>৫০-৫৯</span><span className="font-bold">B</span><span>3.0</span>
                  <span>৪০-৪৯</span><span className="font-bold">C</span><span>2.0</span>
                  <span>৩৩-৩৯</span><span className="font-bold">D</span><span>1.0</span>
                  <span>০০-৩২</span><span className="font-bold text-red-650">F</span><span>0.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="border border-black p-3 rounded-lg mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50/50 print:bg-transparent">
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">শিক্ষার্থীর নাম:</span>
              <span className="font-black text-black">{currentRecord.studentName}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">শ্রেণি ও শাখা:</span>
              <span className="font-bold text-black">{currentRecord.className} (ক-শাখা)</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">রোল নম্বর:</span>
              <span className="font-black text-black font-mono text-sm">{currentRecord.roll}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">মেধা স্থান (Rank):</span>
              <span className="font-black text-black bg-amber-200 print:bg-transparent px-2 py-0.2 rounded font-mono">
                {currentRecord.classRank} / {currentRecord.totalStudentsInClass}
              </span>
            </div>
          </div>

          {/* Subjects & Marks Table */}
          <div className="mb-4">
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-slate-100 print:bg-transparent font-black">
                  <th className="border border-black p-2 text-left pl-3">বিষয় ও কোড</th>
                  <th className="border border-black p-2 w-16">পূর্ণমান</th>
                  <th className="border border-black p-2 w-16">লিখিত</th>
                  <th className="border border-black p-2 w-16">MCQ</th>
                  <th className="border border-black p-2 w-20">ধারাবাহিক</th>
                  <th className="border border-black p-2 w-20">মোট প্রাপ্ত</th>
                  <th className="border border-black p-2 w-20">সর্বোচ্চ নম্বর</th>
                  <th className="border border-black p-2 w-16">লেটার গ্রেড</th>
                  <th className="border border-black p-2 w-16">গ্রেড পয়েন্ট</th>
                </tr>
              </thead>
              <tbody>
                {currentRecord.subjects.map((sub, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border border-black p-2 text-left pl-3 font-bold">
                      {sub.subjectName} ({sub.subjectCode})
                    </td>
                    <td className="border border-black p-2 font-mono">১০০</td>
                    <td className="border border-black p-2 font-mono">{sub.cqMarks}</td>
                    <td className="border border-black p-2 font-mono">{sub.mcqMarks}</td>
                    <td className="border border-black p-2 font-mono">{sub.continuousMarks ?? "-"}</td>
                    <td className="border border-black p-2 font-mono font-black">{sub.totalMarks}</td>
                    <td className="border border-black p-2 font-mono">{sub.highestMarks}</td>
                    <td className="border border-black p-2 font-black">{sub.grade}</td>
                    <td className="border border-black p-2 font-mono font-bold">{sub.gpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 print:bg-transparent font-black border-t-2 border-black text-center">
                  <td className="border border-black p-2 text-left pl-3">সর্বমোট ফলাফল (Grand Total)</td>
                  <td className="border border-black p-2 font-mono">৬০০</td>
                  <td colSpan={3} className="border border-black p-2"></td>
                  <td className="border border-black p-2 font-mono text-sm">{currentRecord.grandTotal}</td>
                  <td className="border border-black p-2">গড় GPA:</td>
                  <td className="border border-black p-2 text-sm">{currentRecord.finalGrade}</td>
                  <td className="border border-black p-2 text-sm font-mono text-emerald-800 print:text-black">
                    {currentRecord.averageGpa.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Teacher & Principal Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
            <div className="border border-black p-2.5 rounded bg-slate-50 print:bg-transparent space-y-1">
              <span className="font-black text-black block">শ্রেণি শিক্ষকের মূল্যায়ন ও মন্তব্য:</span>
              <p className="text-slate-800 font-medium italic">
                "{currentRecord.teacherRemarks}"
              </p>
            </div>
            <div className="border border-black p-2.5 rounded bg-slate-50 print:bg-transparent space-y-1">
              <span className="font-black text-black block">প্রধান শিক্ষকের অনুমোদন ও দিকনির্দেশনা:</span>
              <p className="text-slate-800 font-medium italic">
                "{currentRecord.principalRemarks}"
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs font-bold border-t border-dashed border-slate-300">
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">অভিভাবকের স্বাক্ষর</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">শ্রেণি শিক্ষক</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">প্রধান শিক্ষক (সিল ও স্বাক্ষর)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
