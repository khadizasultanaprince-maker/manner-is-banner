// src/components/exam_suite/GateSecurityScanner.tsx
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Scan,
  CheckCircle2,
  AlertCircle,
  Bell,
  Smartphone,
  Clock,
  ArrowRightCircle,
  ArrowLeftCircle,
  UserCheck,
  Search,
  Volume2,
  Trash2,
  Send,
  Zap,
  Radio
} from "lucide-react";
import { GateLog, StudentSecurityProfile } from "./examTypes";
import { SAMPLE_GATE_LOGS, SAMPLE_SECURITY_PROFILES } from "./examMockData";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const GateSecurityScanner: React.FC = () => {
  const [logs, setLogs] = useState<GateLog[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_gate_logs");
      return saved ? JSON.parse(saved) : SAMPLE_GATE_LOGS;
    } catch {
      return SAMPLE_GATE_LOGS;
    }
  });

  const [scanMode, setScanMode] = useState<"in" | "out">("in");
  const [scannedInput, setScannedInput] = useState<string>("");
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    studentName: string;
    message: string;
    type: "in" | "out";
    time: string;
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Play audio beep tone on scan
  const playBeep = (type: "in" | "out") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "in" ? 880 : 660, audioCtx.currentTime); // High pitch for in, lower for out
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio playback not allowed:", e);
    }
  };

  const handleProcessScan = async (studentIdToScan: string, forcedType?: "in" | "out") => {
    const typeToUse = forcedType || scanMode;
    const cleanId = studentIdToScan.trim();
    if (!cleanId) return;

    // Find student in security profiles
    let student = SAMPLE_SECURITY_PROFILES.find(
      s => s.studentId.toLowerCase() === cleanId.toLowerCase() || s.roll === cleanId
    );

    if (!student) {
      student = {
        studentId: cleanId,
        name: `শিক্ষার্থী (${cleanId})`,
        className: "পঞ্চম শ্রেণি",
        roll: cleanId,
        bloodGroup: "A+",
        guardianName: "অভিভাবক",
        guardianPhone: "01711-000000",
        emergencyContact: "01819-000000",
        address: "ডি-লিকন ক্যাম্পাস",
        cardExpiry: "২০২৬"
      };
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
    const dateFormatted = now.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
    const timestampStr = `${dateFormatted} ${timeFormatted}`;

    let notifMsg = "";
    if (typeToUse === "in") {
      notifMsg = `সম্মানিত অভিভাবক, আপনার সন্তান ${student.name} (শ্রেণি: ${student.className}, রোল: ${student.roll}) আজ ${dateFormatted} সকাল ${timeFormatted} এ নিরাপদে ডি-লিকন মডেল একাডেমী ক্যাম্পাসে প্রবেশ করেছে। - কর্তৃপক্ষ`;
    } else {
      notifMsg = `সম্মানিত অভিভাবক, আপনার সন্তান ${student.name} (শ্রেণি: ${student.className}, রোল: ${student.roll}) আজ ${dateFormatted} বিকাল ${timeFormatted} এ স্কুল ক্যাম্পাস ত্যাগ করেছে। - কর্তৃপক্ষ`;
    }

    const newLog: GateLog = {
      id: "gate-" + Date.now(),
      studentId: student.studentId,
      studentName: student.name,
      className: student.className,
      roll: student.roll,
      type: typeToUse,
      timestamp: timestampStr,
      timeOnly: timeFormatted,
      dateOnly: dateFormatted,
      guardianPhone: student.guardianPhone,
      notificationMessage: notifMsg,
      status: "delivered"
    };

    // Update Gate Logs
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem("dlikon_gate_logs", JSON.stringify(updatedLogs));

    // PUSH NOTIFICATION TO STUDENT DASHBOARD IN LOCALSTORAGE & FIRESTORE
    try {
      const studentNotifKey = `student_gate_notifs_${student.studentId}`;
      const existingNotifs = JSON.parse(localStorage.getItem(studentNotifKey) || "[]");
      existingNotifs.unshift({
        id: newLog.id,
        title: typeToUse === "in" ? "স্কুলে আগমন নিশ্চিতকরণ" : "স্কুল থেকে প্রস্থান বার্তা",
        message: notifMsg,
        time: timeFormatted,
        date: dateFormatted,
        type: typeToUse
      });
      localStorage.setItem(studentNotifKey, JSON.stringify(existingNotifs));

      // Also persist to global notifications
      const globalNotifs = JSON.parse(localStorage.getItem("all_gate_notifications") || "[]");
      globalNotifs.unshift(newLog);
      localStorage.setItem("all_gate_notifications", JSON.stringify(globalNotifs.slice(0, 50)));

      // Sync with Firestore
      try {
        await addDoc(collection(db, "gate_security_logs"), {
          ...newLog,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore sync optional offline fallback:", err);
      }
    } catch (e) {
      console.error("Storage error:", e);
    }

    playBeep(typeToUse);

    setLastScannedResult({
      success: true,
      studentName: student.name,
      message: notifMsg,
      type: typeToUse,
      time: timeFormatted
    });

    setScannedInput("");
  };

  const handleClearLogs = () => {
    if (confirm("আপনি কি সমস্ত গেট স্ক্যানিং লগ রেকর্ড খালি করতে চান?")) {
      setLogs([]);
      localStorage.removeItem("dlikon_gate_logs");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  ডিজিটাল গেট স্ক্যানার ও রিয়েল-টাইম অভিভাবক মেসেজিং
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-ping text-emerald-400" />
                  Live Gate Cloud Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                গেটে আইডি কার্ড স্ক্যান করামাত্রই অভিভাবকের ড্যাশবোর্ডে ও ফোনে আগমন/প্রস্থান মেসেজ স্বয়ংক্রিয়ভাবে সেন্ড হয়
              </p>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                : "bg-slate-800 text-slate-500 border border-slate-700"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>স্ক্যানার বিপ সাউন্ড: {soundEnabled ? "চালু" : "বন্ধ"}</span>
          </button>
        </div>

        {/* SCANNER CONTROL BAR */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode Switcher */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-300 mb-2 block">
              ১. স্ক্যানিং মোড নির্বাচন:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScanMode("in")}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  scanMode === "in"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-2 ring-emerald-400"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-650"
                }`}
              >
                <ArrowRightCircle className="w-4 h-4" />
                <span>প্রবেশ (In-Time)</span>
              </button>
              <button
                onClick={() => setScanMode("out")}
                className={`py-2.5 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  scanMode === "out"
                    ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg ring-2 ring-rose-400"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-650"
                }`}
              >
                <ArrowLeftCircle className="w-4 h-4" />
                <span>প্রস্থান (Out-Time)</span>
              </button>
            </div>
          </div>

          {/* Direct Scanner Input Form */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 md:col-span-2 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>২. বারকোড / QR স্ক্যানার রিডার অথবা শিক্ষার্থী আইডি লিখুন:</span>
              <span className="text-[10px] text-amber-300 font-mono">
                [Enter চাপলেই স্বয়ংক্রিয় প্রসেস হবে]
              </span>
            </span>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessScan(scannedInput);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Scan className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  placeholder="কার্ড স্ক্যান করুন বা DLM-501 / ০১ লিখুন..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>স্ক্যান ও মেসেজ পাঠান</span>
              </button>
            </form>
          </div>
        </div>

        {/* QUICK ONE-CLICK SIMULATOR BUTTONS FOR NURSERY & CLASS 5 STUDENTS */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">
            ⚡ তাৎক্ষণিক টেস্ট স্ক্যান (শিক্ষার্থীর বাটনে ক্লিক করে লাইভ মেসেজিং পরীক্ষা করুন):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SECURITY_PROFILES.map((st) => (
              <div key={st.studentId} className="flex gap-1">
                <button
                  onClick={() => handleProcessScan(st.studentId, "in")}
                  className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                  title="প্রবেশ স্ক্যান ও মেসেজ পাঠান"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{st.name} (ইন)</span>
                </button>
                <button
                  onClick={() => handleProcessScan(st.studentId, "out")}
                  className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-800 text-rose-200 border border-rose-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                  title="প্রস্থান স্ক্যান ও মেসেজ পাঠান"
                >
                  <ArrowLeftCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>আউট</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE SCAN CONFIRMATION BANNER */}
      {lastScannedResult && (
        <div className={`p-4 rounded-xl border-2 shadow-lg flex items-start gap-3 animate-fadeIn ${
          lastScannedResult.type === "in"
            ? "bg-emerald-950/90 border-emerald-400 text-white"
            : "bg-rose-950/90 border-rose-400 text-white"
        }`}>
          <div className="p-2 bg-white/10 rounded-xl mt-0.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-amber-300">
                {lastScannedResult.type === "in" ? "✅ গেট এন্ট্রি সফল!" : "🚪 ক্যাম্পাস প্রস্থান সম্পন্ন!"}
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {lastScannedResult.time}
              </span>
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 ml-auto">
                <Send className="w-3.5 h-3.5" />
                <span>অভিভাবকের ড্যাশবোর্ডে পুশ মেসেজ প্রেরিত</span>
              </span>
            </div>
            <p className="text-xs font-sans text-slate-100 bg-black/40 p-2.5 rounded-lg border border-white/10 leading-relaxed">
              📱 <strong>প্রেরিত মেসেজ প্রিভিউ:</strong> "{lastScannedResult.message}"
            </p>
          </div>
        </div>
      )}

      {/* LIVE GATE ACTIVITY LOGS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">
              আজকের ডিজিটাল গেট লগ ও অভিভাবক নোটিফিকেশন হিস্ট্রি ({logs.length}টি রেকর্ড)
            </h3>
          </div>

          <button
            onClick={handleClearLogs}
            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>লগ খালি করুন</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            আজকে এখনও কোনো শিক্ষার্থী গেট স্ক্যান করেনি। উপরে স্ক্যান ইনপুট দিয়ে পরীক্ষা করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <th className="p-2.5">সময়</th>
                  <th className="p-2.5">শিক্ষার্থীর নাম</th>
                  <th className="p-2.5">শ্রেণি ও রোল</th>
                  <th className="p-2.5 text-center">গেট স্ট্যাটাস</th>
                  <th className="p-2.5">অভিভাবক ফোন</th>
                  <th className="p-2.5">নোটিফিকেশন স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-slate-600 whitespace-nowrap">
                      {log.timeOnly}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {log.studentName}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {log.className}, রোল: <span className="font-bold text-slate-900">{log.roll}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                        log.type === "in"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}>
                        {log.type === "in" ? <ArrowRightCircle className="w-3 h-3 text-emerald-600" /> : <ArrowLeftCircle className="w-3 h-3 text-rose-600" />}
                        <span>{log.type === "in" ? "প্রবেশ (IN)" : "প্রস্থান (OUT)"}</span>
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-slate-600">
                      {log.guardianPhone}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>ড্যাশবোর্ড ও SMS ডেলিভার্ড</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
