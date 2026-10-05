// src/components/exam_suite/AdmitCardStudio.tsx
import React, { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import QRCode from "qrcode";
import { AdmitCard } from "./examTypes";
import { SAMPLE_ADMIT_CARDS } from "./examMockData";

export const AdmitCardStudio: React.FC = () => {
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_admit_cards");
      return saved ? JSON.parse(saved) : SAMPLE_ADMIT_CARDS;
    } catch {
      return SAMPLE_ADMIT_CARDS;
    }
  });

  const [selectedAdmitId, setSelectedAdmitId] = useState<string>(admitCards[0]?.id || "admit-501");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [examHallScanMsg, setExamHallScanMsg] = useState<string>("");

  const currentCard = admitCards.find(c => c.id === selectedAdmitId) || admitCards[0];

  useEffect(() => {
    if (!currentCard) return;
    const payload = JSON.stringify({
      type: "exam_admit_pass",
      exam: currentCard.examName,
      studentId: currentCard.studentId,
      name: currentCard.studentName,
      class: currentCard.className,
      roll: currentCard.roll,
      seat: currentCard.seatNo
    });

    QRCode.toDataURL(payload, {
      width: 140,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error("Admit QR error:", err));
  }, [currentCard]);

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateExamEntryScan = (subjectName: string) => {
    if (!currentCard) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
    const msg = `সম্মানিত অভিভাবক, আপনার সন্তান ${currentCard.studentName} (৫ম শ্রেণি, রোল: ${currentCard.roll}) আজ সকাল ${timeStr} এ নির্ধারিত সময়ে ডি-লিকন মডেল একাডেমী পরীক্ষা হলে উপস্থিত হয়ে '${subjectName}' পরীক্ষায় অংশগ্রহণ করেছে। - পরীক্ষা নিয়ন্ত্রক`;

    try {
      const studentNotifKey = `student_gate_notifs_${currentCard.studentId}`;
      const existingNotifs = JSON.parse(localStorage.getItem(studentNotifKey) || "[]");
      existingNotifs.unshift({
        id: "exam-att-" + Date.now(),
        title: "পরীক্ষার হলে উপস্থিতি নিশ্চিতকরণ",
        message: msg,
        time: timeStr,
        date: "আজকের পরীক্ষা",
        type: "in"
      });
      localStorage.setItem(studentNotifKey, JSON.stringify(existingNotifs));
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    setExamHallScanMsg(msg);
    setTimeout(() => setExamHallScanMsg(""), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header - No Print */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-md">
            <FileBadge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white">
                পরীক্ষার ডিজিটাল এডমিট কার্ড স্টুডিও (Exam Admit Card Generator)
              </h2>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                A4 Official Pass
              </span>
            </div>
            <p className="text-xs text-slate-400">
              পরীক্ষার হলে প্রবেশপত্র স্ক্যান করলে অভিভাবক সাথে সাথে পরীক্ষায় উপস্থিতির মেসেজ পান
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAdmitId}
            onChange={(e) => setSelectedAdmitId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none"
          >
            {admitCards.map(c => (
              <option key={c.id} value={c.id}>
                {c.studentName} (রোল: {c.roll}, {c.className})
              </option>
            ))}
          </select>

          <button
            onClick={() => handleSimulateExamEntryScan(currentCard.schedule[0]?.subject || "বাংলা")}
            className="px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="পরীক্ষার হলে প্রবেশপত্র স্ক্যান করুন"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span>হলে উপস্থিতি স্ক্যান ও অভিভাবককে মেসেজ</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>A4 এডমিট কার্ড প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Confirmation Alert Banner */}
      {examHallScanMsg && (
        <div className="no-print bg-emerald-950 border-2 border-emerald-400 p-4 rounded-xl text-white flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block mb-0.5">
              ✅ পরীক্ষার হলে প্রবেশপত্র স্ক্যান সফল!
            </span>
            <span className="text-slate-200">{examHallScanMsg}</span>
          </div>
        </div>
      )}

      {/* PRINTABLE A4 ADMIT CARD */}
      {currentCard && (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
          {/* Institutional Top Header */}
          <div className="border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 border-2 border-black rounded-xl flex items-center justify-center bg-slate-50 font-black text-center text-[10px] leading-tight">
                মনোগ্রাম
              </div>
              <div className="text-center flex-1 px-4">
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
                  প্রবেশপত্র (EXAM ADMIT CARD) — ২০২৬
                </div>
              </div>
              <div className="w-16 h-16 border-2 border-black rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                {qrCodeDataUrl && (
                  <img src={qrCodeDataUrl} alt="Security Pass" className="w-14 h-14" />
                )}
              </div>
            </div>

            <div className="text-center font-bold text-xs text-slate-900 mt-2">
              পরীক্ষা: <span className="font-black text-black underline">{currentCard.examName}</span>
            </div>
          </div>

          {/* Student Profile & Seat Info Grid */}
          <div className="border border-black p-3 rounded-lg mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50/50 print:bg-transparent">
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">পরীক্ষার্থীর নাম:</span>
              <span className="font-black text-black">{currentCard.studentName}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">শ্রেণি ও শাখা:</span>
              <span className="font-bold text-black">{currentCard.className} (ক-শাখা)</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">রোল নম্বর:</span>
              <span className="font-black text-black font-mono text-sm">{currentCard.roll}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] font-bold">রেজিস্ট্রেশন নং:</span>
              <span className="font-bold font-mono text-black">{currentCard.registrationNo}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-600 block text-[10px] font-bold">নির্ধারিত আসন (Seat No):</span>
              <span className="font-bold text-black bg-amber-100 print:bg-transparent px-1.5 py-0.5 rounded border border-amber-300 print:border-none">
                {currentCard.seatNo}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-600 block text-[10px] font-bold">পরীক্ষা কেন্দ্র:</span>
              <span className="font-bold text-black">{currentCard.centerName}</span>
            </div>
          </div>

          {/* Exam Schedule Table */}
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-black text-black">
              পরীক্ষার বিষয়ভিত্তিক সময়সূচি (Exam Schedule):
            </h4>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100 print:bg-transparent font-black text-center">
                  <th className="border border-black p-1.5 w-28">তারিখ</th>
                  <th className="border border-black p-1.5 w-24">বার</th>
                  <th className="border border-black p-1.5 text-left">বিষয়</th>
                  <th className="border border-black p-1.5 w-44">সময়</th>
                  <th className="border border-black p-1.5 w-16">কক্ষ নং</th>
                </tr>
              </thead>
              <tbody>
                {currentCard.schedule.map((item, idx) => (
                  <tr key={idx} className="border-b border-black text-center">
                    <td className="border border-black p-1.5 font-bold font-mono">{item.date}</td>
                    <td className="border border-black p-1.5">{item.day}</td>
                    <td className="border border-black p-1.5 text-left font-bold">{item.subject}</td>
                    <td className="border border-black p-1.5 font-mono text-[11px]">{item.time}</td>
                    <td className="border border-black p-1.5 font-bold font-mono">{item.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Exam Rules & Instructions */}
          <div className="border border-black p-2.5 rounded text-[11px] space-y-1 mb-6 bg-slate-50 print:bg-transparent">
            <span className="font-black text-black block">পরীক্ষার্থীদের জন্য জরুরি নির্দেশনাবলী:</span>
            <ul className="list-decimal pl-4 space-y-0.5 text-slate-800 font-medium">
              {currentCard.rules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs font-bold border-t border-dashed border-slate-300">
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">শ্রেণি শিক্ষক</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">পরীক্ষা নিয়ন্ত্রক</div>
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
